import { Router } from 'express';
import { getDashboardMetrics, getBalances, getMeta, getAuditLogs } from '../controllers/assetController.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';
const r = Router();
r.get('/meta', getMeta);
r.get('/dashboard', authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), enforceBaseScope, getDashboardMetrics);
r.get('/balances', authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), enforceBaseScope, getBalances);
r.get('/audit', authorizeRoles('ADMIN'), getAuditLogs);
export default r;
