'use strict';

import Service from '../Service/Service.model.js';

// ADMIN: Ver todos los servicios registrados
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('requestId', 'title')
            .populate('clientId', 'firstName lastName')
            .populate('workerId', 'firstName lastName');

        return res.send({ success: true, total: services.length, services });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al listar servicios', err: err.message });
    }
};

// ADMIN: Cambiar el status de un servicio (moderación/soporte)
export const updateServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).send({
                success: false,
                message: `El status debe ser uno de: ${validStatuses.join(', ')}`
            });
        }

        const serviceExist = await Service.findById(id);
        if (!serviceExist) {
            return res.status(404).send({ success: false, message: 'Servicio no encontrado' });
        }

        const updateData = { status };
        if (status === 'COMPLETED' && !serviceExist.endDate) {
            updateData.endDate = new Date();
        }

        const serviceUpdated = await Service.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        return res.send({ success: true, message: 'Status actualizado correctamente', service: serviceUpdated });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al actualizar el status', err: err.message });
    }
};