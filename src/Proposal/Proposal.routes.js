'use strict';

import { Router } from 'express';
import { getAllProposals, deactivateProposal } from './Proposal.controller.js';
import { validateProposalId } from '../../middlewares/proposal.validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';

const api = Router();

api.use(validateJWT, hasAdminRole);

api.get('/', getAllProposals);

api.patch('/:id', [validateProposalId], deactivateProposal);

export default api;