'use strict';
import Skill from './skill.model.js';

export const createSkill = async (req, res) => {
    try {
        const skill = new Skill(req.body);
        await skill.save();
        res.status(201).json({ success: true, message: 'Skill agregada', data: skill });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Skill.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const deactivateSkill = async (req, res) => {
    try {
        const { id } = req.params;
        await Skill.findByIdAndUpdate(id, { isActive: false });
        res.status(200).json({ success: true, message: 'Skill desactivada' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getAllSkillsAdmin = async (req, res) => {
    try {
        const skills = await Skill.find().populate('categoryId');
        res.status(200).json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};