// Shared inventory math. Balances are DERIVED from the ledger tables (no stored totals to drift).
//   balance = purchases + transfers_in - transfers_out - assigned - expended
export const BALANCE_SQL = `
  SELECT COALESCE(SUM(signed), 0)::int AS balance FROM (
    SELECT quantity AS signed FROM purchases WHERE base_id = $1 AND equipment_type_id = $2
    UNION ALL SELECT quantity FROM transfers WHERE destination_base_id = $1 AND equipment_type_id = $2 AND status = 'COMPLETED'
    UNION ALL SELECT -quantity FROM transfers WHERE source_base_id = $1 AND equipment_type_id = $2 AND status = 'COMPLETED'
    UNION ALL SELECT -quantity FROM assignments WHERE base_id = $1 AND equipment_type_id = $2
    UNION ALL SELECT -quantity FROM expenditures WHERE base_id = $1 AND equipment_type_id = $2
  ) l`;

// Serialises concurrent stock-reducing operations on the same (base, equipment) pair for the
// duration of the transaction, so two simultaneous requests cannot both spend the same stock.
export const lockStock = (client, baseId, equipmentTypeId) =>
  client.query('SELECT pg_advisory_xact_lock($1::int, $2::int)', [baseId, equipmentTypeId]);

export const currentBalance = async (client, baseId, equipmentTypeId) =>
  (await client.query(BALANCE_SQL, [baseId, equipmentTypeId])).rows[0].balance;

export const toInt = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
export const isPosInt = (v) => Number.isInteger(Number(v)) && Number(v) > 0;
