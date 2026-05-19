import { Router } from 'express';
import { getAllReports, resolveReport } from './report.controller.js';
import { resolveReportValidator } from '../../middlewares/report-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';

const router = Router();

// Protección global: todas las rutas requieren JWT válido y rol ADMIN
router.use(validateJWT, hasAdminRole);

router.get('/', getAllReports);

router.patch('/resolve/:id', resolveReportValidator, resolveReport);

export default router;