'use strict';

import ServiceRequest from './serviceRequest.model.js';

// ADMIN: Ver todas las solicitudes del sistema 
export const getAllRequestsAdmin = async (req, res) => {
    try {
        const requests = await ServiceRequest.find()
            .populate('clientId', 'firstName lastName email')
            .populate('categoryId', 'name');
        res.status(200).json({
            success: true,
            total: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener solicitudes',
            error: error.message
        });
    }
};

// ADMIN: Soft Delete de solicitudes inapropiadas
export const deleteRequestAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cambiamos findByIdAndDelete por findByIdAndUpdate
        const deletedRequest = await ServiceRequest.findByIdAndUpdate(
            id, 
            { isActive: false }, 
            { new: true }
        );

        if (!deletedRequest) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        res.status(200).json({
            success: true,
            message: 'Solicitud desactivada (Soft Delete) por el administrador',
            data: deletedRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al realizar el Soft Delete',
            error: error.message
        });
    }
};

// ADMIN: Actualizar estado de una solicitud
export const updateRequestStatusAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'CLOSED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`
            });
        }

        const updated = await ServiceRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        )
            .populate('clientId', 'firstName lastName email')
            .populate('categoryId', 'name');

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        res.status(200).json({
            success: true,
            message: `Solicitud actualizada a estado ${status}`,
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado de la solicitud',
            error: error.message
        });
    }
};