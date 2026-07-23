'use strict';

import UserSkill from './userSkill.model.js';

// ADMIN: Ver todas las UserSkills del sistema
export const getAllUserSkillsAdmin = async (req, res) => {
    try {
        const data = await UserSkill.find()
            .populate('userId', 'firstName lastName email role')
            .populate('skillId', 'name');

        res.status(200).json({
            success: true,
            total: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las habilidades de usuarios',
            error: error.message
        });
    }
};

// ADMIN: Asignar habilidad a un usuario
export const assignSkillToUser = async (req, res) => {
    try {
        const { userId, skillId, experienceYears } = req.body;

        // Evitar duplicados
        const existing = await UserSkill.findOne({ userId, skillId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya tiene esta habilidad asignada'
            });
        }

        const userSkill = new UserSkill({ userId, skillId, experienceYears });
        await userSkill.save();

        const populated = await userSkill.populate([
            { path: 'userId', select: 'firstName lastName email role' },
            { path: 'skillId', select: 'name' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Habilidad asignada correctamente',
            data: populated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al asignar habilidad',
            error: error.message
        });
    }
};

// ADMIN: Eliminar habilidad de un usuario
export const removeSkillFromUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await UserSkill.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Relación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Habilidad eliminada del usuario correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar habilidad',
            error: error.message
        });
    }
};