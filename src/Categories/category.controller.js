import Category from './category.model.js';
import { normalizeCategoryName } from '../helpers/category.helper.js';


export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
            error: error.message
        });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener categoría',
            error: error.message
        });
    }
};

export const createCategory = async (req, res) => {
    try {
        const data = req.body;

        const normalized = normalizeCategoryName(data.name);
        const allCategories = await Category.find().select('name');
        const existingCategory = allCategories.find(
            (cat) => normalizeCategoryName(cat.name) === normalized
        );
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'La categoría ya existe'
            });
        }

        const category = new Category(data);
        await category.save();

        res.status(201).json({
            success: true,
            message: 'Categoría creada correctamente',
            data: category
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear categoría',
            error: error.message
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const categoryExist = await Category.findById(id);
        if (!categoryExist) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        const categoryUpdated = await Category.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Categoría actualizada correctamente',
            data: categoryUpdated
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar categoría',
            error: error.message
        });
    }
};

export const changeCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        category.status = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        await category.save();

        res.status(200).json({
            success: true,
            message: `Estado de categoría cambiado a ${category.status}`,
            data: category
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado de categoría',
            error: error.message
        });
    }
};