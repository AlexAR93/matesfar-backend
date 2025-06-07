const Category = require("../models/Category.model");

const getCategories = async (req, res) => {
    const categories = await Category.find();
    res.json({ ok: true, categories });
};

const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ ok: false, msg: "Categoría no encontrada" });
        res.json({ ok: true, category });
    } catch {
        res.status(500).json({ ok: false, msg: "Error interno" });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const exists = await Category.findOne({ name });
        if (exists) return res.status(400).json({ ok: false, msg: "Ya existe una categoría con ese nombre" });

        const category = new Category(req.body);
        await category.save();
        res.status(201).json({ ok: true, category });
    } catch {
        res.status(500).json({ ok: false, msg: "Error al crear categoría" });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ ok: false, msg: "Categoría no encontrada" });
        res.json({ ok: true, category });
    } catch {
        res.status(500).json({ ok: false, msg: "Error al actualizar categoría" });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ ok: false, msg: "Categoría no encontrada" });
        res.json({ ok: true, msg: "Categoría eliminada" });
    } catch {
        res.status(500).json({ ok: false, msg: "Error al eliminar categoría" });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
