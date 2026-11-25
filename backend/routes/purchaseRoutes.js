import { Router } from 'express';
import { createPurchase, listPurchases } from '../controllers/purchaseController.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';
const r = Router();
const roles = authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER');
r.get('/', roles, enforceBaseScope, listPurchases);
r.post('/', roles, enforceBaseScope, createPurchase);
export default r;
