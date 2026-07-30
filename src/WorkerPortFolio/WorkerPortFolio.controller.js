'use strict';

import WorkerPortfolio from './WorkerPortFolio.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

// ADMIN: Ver todos los Portafolios (incluyendo activos e inactivos)
export const getAllPortfolios = async (req, res) => {
    try {
        const portfolios = await WorkerPortfolio.find()
            .populate('workerId', 'firstName lastName email role');
        return res.send({ success: true, portfolios });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: 'Error al obtener todos los portafolios',
            err: err.message
        });
    }
};

// ADMIN: Desactivar Registros Inadecuados (o reactivarlos)
export const moderateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await WorkerPortfolio.findById(id);

        if (!record) return res.status(404).send({ success: false, message: 'Registro no encontrado' });

        record.status = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        record.deletedAt = record.status === 'INACTIVE' ? new Date() : null;

        await record.save();
        await record.populate('workerId', 'firstName lastName email role');

        return res.send({
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

// ADMIN: Reemplazar la imagen de un registro del portafolio
export const updatePortfolioImage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).send({ success: false, message: 'No se subió ninguna imagen' });
        }

        const record = await WorkerPortfolio.findById(id);
        if (!record) return res.status(404).send({ success: false, message: 'Registro no encontrado' });

        if (record.imageUrl && record.imageUrl.startsWith('http')) {
            try {
                const photoPath = record.imageUrl;
                const uploadIndex = photoPath.indexOf('/upload/');
                if (uploadIndex !== -1) {
                    const afterUpload = photoPath.substring(uploadIndex + 8);
                    const parts = afterUpload.split('/');

                    if (parts[0].startsWith('v')) {
                        parts.shift();
                    }

                    const fullPath = parts.join('/');
                    const publicId = fullPath.substring(0, fullPath.lastIndexOf('.'));

                    await cloudinary.uploader.destroy(publicId);
                }
            } catch (deleteError) {
                console.error('Error al eliminar imagen anterior:', deleteError);
            }
        }

        record.imageUrl = req.file.path;
        await record.save();
        await record.populate('workerId', 'firstName lastName email role');

        return res.send({
            success: true,
            message: 'Imagen del portafolio actualizada',
            record
        });
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: 'Error al actualizar la imagen del portafolio',
            err: err.message
        });
    }
};