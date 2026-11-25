import { Router } from 'express';
import { createAssignment, createExpenditure, listAssignments, listExpenditures } from '../controllers/assignmentController.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';
const r = Router();
// Logistics Officers are intentionally excluded: they manage Purchases and Transfers only.
const roles = authorizeRoles('ADMIN', 'BASE_COMMANDER');
r.get('/assignments', roles, enforceBaseScope, listAssignments);
r.post('/assignments', roles, enforceBaseScope, createAssignment);
r.get('/expenditures', roles, enforceBaseScope, listExpenditures);
r.post('/expenditures', roles, enforceBaseScope, createExpenditure);
export default r;
