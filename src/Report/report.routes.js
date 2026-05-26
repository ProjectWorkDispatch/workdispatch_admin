import { Router } from 'express';
import { getAllReports, resolveReport, sanctionReport } from './report.controller.js';
import { resolveReportValidator } from '../../middlewares/report-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';

const router = Router();

router.use(validateJWT, hasAdminRole);

router.get('/', getAllReports);

router.patch('/resolve/:id', resolveReportValidator, resolveReport);

router.patch('/sanction/:id', resolveReportValidator, sanctionReport);

export default router;