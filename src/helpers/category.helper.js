import Category from '../Categories/category.model.js';

export const normalizeCategoryName = (name) => {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
};

export const resolveOrCreateCategory = async (rawName) => {
    const normalized = normalizeCategoryName(rawName);

    const activeCategories = await Category.find({ status: 'ACTIVE' }).select('name');
    const match = activeCategories.find(
        (cat) => normalizeCategoryName(cat.name) === normalized
    );
    if (match) return match._id;

    const created = await Category.create({
        name: rawName.trim(),
        description: `Categoría creada automáticamente a partir de una solicitud personalizada.`,
        status: 'ACTIVE'
    });
    return created._id;
};
