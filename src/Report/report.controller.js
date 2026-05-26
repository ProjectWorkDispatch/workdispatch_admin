import Report from './report.model.js';
import User from '../Users/user.model.js';

export const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('reporterId',   'firstName lastName')
            .populate('reporteredId', 'firstName lastName');

        res.status(200).json({ success: true, reports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener los reportes', error: error.message });
    }
};

// Ignorar: solo marca el reporte como resuelto, sin tocar al usuario
export const resolveReport = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedReport = await Report.findByIdAndUpdate(
            id,
            { Status: false },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        }

        res.status(200).json({
            success: true,
            message: 'Reporte marcado como resuelto',
            report: updatedReport
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar el reporte', error: error.message });
    }
};

// Sancionar: resuelve el reporte Y desactiva al usuario reportado
export const sanctionReport = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        }

        // Marcar reporte como resuelto
        report.Status = false;
        await report.save();

        // Desactivar al usuario reportado
        const sanctionedUser = await User.findByIdAndUpdate(
            report.reporteredId,
            { active: false },
            { new: true, runValidators: false }
        );

        if (!sanctionedUser) {
            return res.status(404).json({ success: false, message: 'Usuario reportado no encontrado' });
        }

        res.status(200).json({
            success: true,
            message: `Usuario ${sanctionedUser.firstName} ${sanctionedUser.lastName} sancionado y desactivado`,
            report,
            user: { _id: sanctionedUser._id, active: sanctionedUser.active }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al sancionar al usuario', error: error.message });
    }
};