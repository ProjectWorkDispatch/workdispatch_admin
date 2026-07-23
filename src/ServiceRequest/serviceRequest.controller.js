'use strict';

import ServiceRequest from './serviceRequest.model.js';

// ADMIN: Ver todas las solicitudes del sistema
export const getAllRequestsAdmin = async (req, res) => {
    try {
        const requests = await ServiceRequest.find()
            .populate('clientId',   'firstName lastName email')
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

        const deletedRequest = await ServiceRequest.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true, runValidators: false }
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

// ADMIN: Cambiar estado de una solicitud (CANCELLED, CLOSED, etc.)
export const changeRequestStatusAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'CLOSED'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Los valores permitidos son: ${validStatuses.join(', ')}`
            });
        }

        const updated = await ServiceRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: false }
        ).populate('clientId',   'firstName lastName email')
         .populate('categoryId', 'name');

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        res.status(200).json({
            success: true,
            message: `Estado de la solicitud cambiado a ${status}`,
            serviceRequest: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado de la solicitud',
            error: error.message
        });
    }
};