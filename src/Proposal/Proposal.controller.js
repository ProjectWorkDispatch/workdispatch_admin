'use strict';

import Proposal from './Proposal.model.js';

// ADMIN: Ver todas las propuestas
export const getAllProposals = async (req, res) => {
    try {
        const proposals = await Proposal.find()
            .populate('serviceRequestId', 'title')
            .populate('workerId', 'firstName lastName');
        
        return res.send({ success: true, proposals });
    } catch (err) {
        return res.status(500).send({ 
            success: false, 
            message: 'Error al listar propuestas',
            err: err.message 
        });
    }
};

// ADMIN: Desactivar propuesta (Soft Delete)
export const deactivateProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const proposal = await Proposal.findByIdAndUpdate(id, 
            { status: 'CANCELLED', deletedAt: new Date() }, 
            { new: true }
        );
        
        if (!proposal) return res.status(404).send({ success: false, message: 'Propuesta no encontrada' });
        
        return res.send({ success: true, message: 'Propuesta desactivada por el administrador', proposal });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al desactivar la propuesta' });
    }
};