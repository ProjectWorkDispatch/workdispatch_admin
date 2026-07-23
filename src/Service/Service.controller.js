'use strict';

import Service from '../Service/Service.model.js';

// ADMIN: Ver todos los servicios registrados
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('clientId',  'firstName lastName email')
            .populate('workerId',  'firstName lastName email')
            .populate('requestId', '_id title');

        return res.status(200).json({ success: true, total: services.length, services });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error al listar servicios', error: err.message });
    }
};

// ADMIN: Cambiar estado de un servicio
export const updateServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Los valores permitidos son: ${validStatuses.join(', ')}`
            });
        }

        const service = await Service.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: false }
        )
            .populate('clientId',  'firstName lastName email')
            .populate('workerId',  'firstName lastName email')
            .populate('requestId', '_id title');

        if (!service) {
            return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
        }

        return res.status(200).json({
            success: true,
            message: `Estado del servicio actualizado a ${status}`,
            service
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error al actualizar el servicio', error: err.message });
    }
};