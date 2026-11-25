// Integration test against a running API (default http://localhost:4000). Requires `npm run seed` first.
const API = process.env.API_URL || 'http://localhost:4000';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ' + extra}`); };
const call = async (method, path, token, body) => {
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) });
  let j = null; try { j = await r.json(); } catch {} return { status: r.status, body: j };
};
const login = async (u, p) => (await call('POST', '/api/auth/login', null, { username: u, password: p })).body?.token;

const admin = await login('admin_user', 'AdminPass123!');
const cmd = await login('commander_alpha', 'CommandPass123!');
const log = await login('logistics_officer', 'LogisticsPass123!');

ok('login works for all 3 roles', admin && cmd && log);
ok('bad password -> 401', (await call('POST', '/api/auth/login', null, { username: 'admin_user', password: 'x' })).status === 401);
ok('no token -> 401', (await call('GET', '/api/assets/dashboard')).status === 401);

// RBAC
ok('logistics cannot read assignments (403)', (await call('GET', '/api/assignments', log)).status === 403);
ok('logistics cannot create expenditure (403)', (await call('POST', '/api/expenditures', log, { baseId: 1, equipmentTypeId: 5, quantity: 1 })).status === 403);
ok('commander cannot read audit log (403)', (await call('GET', '/api/assets/audit', cmd)).status === 403);
ok('admin can read audit log', (await call('GET', '/api/assets/audit', admin)).status === 200);

// Base scope: commander_alpha asks for base 2, must still get base 1 data
const dAdmin1 = (await call('GET', '/api/assets/dashboard?baseId=1', admin)).body;
const dCmdTry2 = (await call('GET', '/api/assets/dashboard?baseId=2', cmd)).body;
ok('commander forced to own base (asks base 2, gets base 1)', JSON.stringify(dCmdTry2) === JSON.stringify(dAdmin1), `${JSON.stringify(dCmdTry2)} vs ${JSON.stringify(dAdmin1)}`);
const pCmd = (await call('GET', '/api/purchases', cmd)).body;
ok('commander purchase list only shows Fort Alpha', pCmd.length > 0 && pCmd.every((p) => p.base === 'Fort Alpha'));
ok('commander cannot transfer out of another base (403)', (await call('POST', '/api/transfers', cmd, { sourceBaseId: 2, destinationBaseId: 1, equipmentTypeId: 1, quantity: 1 })).status === 403);
const w = await call('POST', '/api/purchases', cmd, { baseId: 2, equipmentTypeId: 1, quantity: 5 });
ok('commander purchase accepted (body baseId is overridden server-side)', w.status === 201);

// Dashboard math identity
const d = (await call('GET', '/api/assets/dashboard', admin)).body;
ok('closing = opening + net - assigned - expended', d.closingBalance === d.openingBalance + d.netMovement - d.assigned - d.expended, JSON.stringify(d));
ok('net movement = purchases + in - out', d.netMovement === d.purchases + d.transfersIn - d.transfersOut);
ok('global transfers in == out', d.transfersIn === d.transfersOut, JSON.stringify(d));
// Date range: opening balance of a later window equals closing of the earlier window
const d1 = (await call('GET', '/api/assets/dashboard?baseId=1&equipmentTypeId=1&endDate=' + new Date(Date.now() - 20 * 864e5).toISOString().slice(0, 10), admin)).body;
const d2 = (await call('GET', '/api/assets/dashboard?baseId=1&equipmentTypeId=1&startDate=' + new Date(Date.now() - 19 * 864e5).toISOString().slice(0, 10), admin)).body;
ok('window continuity: closing(earlier) == opening(later)', d1.closingBalance === d2.openingBalance, `${d1.closingBalance} vs ${d2.openingBalance}`);

// Transfers: balance + validation + atomic audit
const bal = async (b, e) => (await call('GET', `/api/assets/dashboard?baseId=${b}&equipmentTypeId=${e}`, admin)).body.closingBalance;
const [s0, t0] = [await bal(3, 6), await bal(2, 6)];
const tooMany = await call('POST', '/api/transfers', admin, { sourceBaseId: 1, destinationBaseId: 2, equipmentTypeId: 6, quantity: 1 });
ok('transfer exceeding stock rejected (409)', tooMany.status === 409, JSON.stringify(tooMany));
ok('same base transfer rejected (400)', (await call('POST', '/api/transfers', admin, { sourceBaseId: 3, destinationBaseId: 3, equipmentTypeId: 6, quantity: 1 })).status === 400);
ok('negative quantity rejected (400)', (await call('POST', '/api/transfers', admin, { sourceBaseId: 3, destinationBaseId: 2, equipmentTypeId: 6, quantity: -5 })).status === 400);
const auditBefore = (await call('GET', '/api/assets/audit', admin)).body.length;
const okT = await call('POST', '/api/transfers', admin, { sourceBaseId: 3, destinationBaseId: 2, equipmentTypeId: 6, quantity: 10 });
ok('valid transfer -> 201', okT.status === 201, JSON.stringify(okT));
ok('source -10 and destination +10', (await bal(3, 6)) === s0 - 10 && (await bal(2, 6)) === t0 + 10);
const audit = (await call('GET', '/api/assets/audit', admin)).body;
ok('transfer wrote an audit row', audit.some((a) => a.action === 'TRANSFER' && a.details.includes('from Base #3 to Base #2')) && audit.length > auditBefore);

// Concurrency: stock at base 3 / equipment 6 is s0-10. Fire 5 parallel transfers each taking 60% of it: exactly one may succeed.
const avail = await bal(3, 6), each = Math.ceil(avail * 0.6);
const results = await Promise.all(Array.from({ length: 5 }, () => call('POST', '/api/transfers', admin, { sourceBaseId: 3, destinationBaseId: 1, equipmentTypeId: 6, quantity: each })));
const succ = results.filter((r) => r.status === 201).length;
ok(`concurrent oversell blocked (1 of 5 succeeded)`, succ === 1, `successes=${succ}`);
ok('balance never negative after race', (await bal(3, 6)) === avail - each && (await bal(3, 6)) >= 0);

// Assignments / expenditures reduce stock and are validated
ok('assignment above stock rejected (409)', (await call('POST', '/api/assignments', cmd, { baseId: 1, equipmentTypeId: 4, quantity: 1, personnelName: 'X' })).status === 409);
const e0 = await bal(1, 5);
ok('expenditure recorded (201)', (await call('POST', '/api/expenditures', cmd, { baseId: 1, equipmentTypeId: 5, quantity: 10, reason: 'test' })).status === 201);
ok('expenditure reduced closing balance by 10', (await bal(1, 5)) === e0 - 10);
ok('assignment requires personnel name (400)', (await call('POST', '/api/assignments', cmd, { baseId: 1, equipmentTypeId: 1, quantity: 1 })).status === 400);

console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
