// src/WorkerPortFolio/WorkerPortFolio.controller.js
'use strict';

import WorkerPortfolio from './WorkerPortFolio.model.js';
import { createAutomaticNotification } from '../helpers/notification.helper.js';

// ADMIN: Ver todos los portafolios (activos e inactivos) con datos del worker
export const getAllPortfolios = async (req, res) => {
    try {
        const portfolios = await WorkerPortfolio.find()
            .populate('workerId', 'firstName lastName email role profilePhoto');

        return res.status(200).send({ success: true, portfolios });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: 'Error al obtener todos los portafolios',
            err: err.message
        });
    }
};

// ADMIN: Desactivar o reactivar un registro del portafolio (toggle)
export const moderateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await WorkerPortfolio.findById(id);

        if (!record) {
            return res.status(404).send({ success: false, message: 'Registro no encontrado' });
        }

        record.status = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        record.deletedAt = record.status === 'INACTIVE' ? new Date() : null;

        await record.save();

        const mensaje = record.status === 'INACTIVE'
            ? 'Un administrador ha desactivado uno de tus registros de portafolio por incumplir las normas de la comunidad.'
            : 'Tu registro de portafolio ha sido reactivado por un administrador.';

        await createAutomaticNotification(
            record.workerId,
            mensaje,
            `PORTFOLIO_${record.status}`
        );

        return res.status(200).send({
            success: true,
            message: `El registro ha sido marcado como ${record.status} por el Administrador`,
            record
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: 'Error al moderar el registro',
            err: err.message
        });
    }
};

// ADMIN: Actualizar la imagen de un registro de portafolio
// PATCH /PortFolio/:id/image — Content-Type: multipart/form-data, campo: portfolioImage
export const updatePortfolioImage = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await WorkerPortfolio.findById(id);

        if (!record) {
            return res.status(404).send({ success: false, message: 'Registro no encontrado' });
        }

        if (!req.file) {
            return res.status(400).send({ success: false, message: 'No se proporcionó ninguna imagen' });
        }

        // req.file.path es la URL segura de Cloudinary generada por uploadPortfolioImage
        record.imageUrl = req.file.path;
        await record.save();

        return res.status(200).send({
            success: true,
            message: 'Imagen del portafolio actualizada correctamente',
            imageUrl: record.imageUrl
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: 'Error al actualizar la imagen del portafolio',
            err: err.message
        });
    }
};