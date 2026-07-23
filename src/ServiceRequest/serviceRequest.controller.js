'use strict';

import ServiceRequest from './serviceRequest.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

const getUploadedServiceRequestImage = (req) => {
    if (req.file) return req.file;
    if (!req.files) return null;

    return req.files.serviceImage?.[0]
        || req.files.image?.[0]
        || req.files.photo?.[0]
        || null;
};

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

// ADMIN: Reemplazar imagen de una solicitud
// PATCH /ServiceRequest/:id/image - multipart/form-data, campo: serviceImage
export const updateRequestImageAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const uploadedImage = getUploadedServiceRequestImage(req);

        if (!uploadedImage) {
            return res.status(400).json({
                success: false,
                message: 'No se proporciono ninguna imagen'
            });
        }

        const request = await ServiceRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
        }

        const previousPublicId = request.serviceImage?.public_id;

        request.serviceImage = {
            url: uploadedImage.path,
            public_id: uploadedImage.filename
        };

        await request.save();

        if (previousPublicId && previousPublicId !== request.serviceImage.public_id) {
            await cloudinary.uploader.destroy(previousPublicId);
        }

        return res.status(200).json({
            success: true,
            message: 'Imagen de la solicitud actualizada correctamente',
            data: request
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la imagen de la solicitud',
            error: error.message
        });
    }
};
