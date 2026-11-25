import { Router } from 'express';
import { createTransfer, listTransfers } from '../controllers/transferController.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';
const r = Router();
const roles = authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER');
r.get('/', roles, enforceBaseScope, listTransfers);
r.post('/', roles, enforceBaseScope, createTransfer);
export default r;
