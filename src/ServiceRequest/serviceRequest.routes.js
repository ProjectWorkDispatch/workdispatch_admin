import { Router } from 'express';
import { getAllRequestsAdmin, deleteRequestAdmin } from './serviceRequest.controller.js';
import { estimateBudgetAI } from './ai.controller.js';
import { validateServiceRequestId } from '../../middlewares/serviceRequest-validator.js';

const router = Router();

// IA: Estimación de presupuesto
router.post('/ai/estimate-budget', estimateBudgetAI);

// Rutas protegidas para ADMIN
router.get('/', getAllRequestsAdmin);
router.delete('/:id', validateServiceRequestId, deleteRequestAdmin);

export default router;