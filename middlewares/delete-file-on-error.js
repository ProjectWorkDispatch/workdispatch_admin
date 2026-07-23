import { cloudinary } from './file-uploader.js';

const getUploadedFiles = (req) => {
    if (req.file) return [req.file];
    if (!req.files) return [];

    if (Array.isArray(req.files)) return req.files;

    return Object.values(req.files).flat().filter(Boolean);
};
 
// Middleware normal: registra un listener para borrar el archivo si la respuesta termina con error (>=400)
export const cleanupUploadedFileOnFinish = (req, res, next) => {
    // Solo registra si hubo upload
    const uploadedFiles = getUploadedFiles(req);
    if (uploadedFiles.length) {
        res.on('finish', async () => {
            try {
                if (res.statusCode >= 400) {
                    for (const file of uploadedFiles) {
                        const publicId = file.public_id || file.filename;
                        if (publicId) {
                            await cloudinary.uploader.destroy(publicId);
                            console.log(
                                `Archivo Cloudinary eliminado por respuesta ${res.statusCode}: ${publicId}`
                            );
                        }
                    }
                }
            } catch (e) {
                console.error(
                    `Error al eliminar archivo de Cloudinary tras error de respuesta: ${e.message}`
                );
            }
        });
    }
    next();
};
 
// Middleware de manejo de errores (fallback): si algún middleware llama next(err), intenta borrar
export const deleteFileOnError = async (err, req, res, next) => {
    try {
        const uploadedFiles = getUploadedFiles(req);
        for (const file of uploadedFiles) {
            const publicId = file.public_id || file.filename;
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
                console.log(
                    `Archivo Cloudinary eliminado por error en cadena: ${publicId}`
                );
            }
        }
    } catch (unlinkErr) {
        console.error(
            `Error al eliminar archivo de Cloudinary (error handler): ${unlinkErr.message}`
        );
        // no interrumpir el flujo de error original
    }
    return next(err);
};
