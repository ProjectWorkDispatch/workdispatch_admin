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