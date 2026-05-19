'use strict';

import Proposal from './Proposal.model.js';

// ADMIN: Ver todas las propuestas
export const getAllProposals = async (req, res) => {
    try {
        const proposals = await Proposal.find()
            .populate('serviceRequestId', 'title description')
            .populate('workerId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, proposals });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al listar propuestas',
            error: err.message
        });
    }
};

// ADMIN: Desactivar propuesta (Soft Delete)
export const deactivateProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const proposal = await Proposal.findByIdAndUpdate(
            id,
            { status: 'CANCELLED', deletedAt: new Date() },
            { new: true }
        );

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: 'Propuesta no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Propuesta desactivada por el administrador',
            proposal
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al desactivar la propuesta',
            error: err.message
        });
    }
};