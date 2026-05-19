'use strict';

import { Router } from 'express';
import { getAllProposals, deactivateProposal } from './Proposal.controller.js';
import { validateProposalId } from '../../middlewares/proposal.validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';

const api = Router();

// Protección global: todas las rutas requieren JWT válido y rol ADMIN
api.use(validateJWT, hasAdminRole);

// GET /proposals — listar todas las propuestas
api.get('/', getAllProposals);

// PATCH /proposals/:id — desactivar propuesta sospechosa (Soft Delete)
api.patch('/:id', [validateProposalId], deactivateProposal);

export default api;