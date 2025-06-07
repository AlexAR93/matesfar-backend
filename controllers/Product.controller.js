const Product = require("../models/Product.model");

const getProducts = async (req, res) => {
    const products = await Product.find().populate("category", "name");
    res.json({ ok: true, products });
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category", "name");
        if (!product) return res.status(404).json({ ok: false, msg: "Producto no encontrado" });
        res.json({ ok: true, product });
    } catch {
        res.status(500).json({ ok: false, msg: "Error al buscar el producto" });
    }
};

const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ ok: true, product });
    } catch (err) {
        res.status(500).json({ ok: false, msg: "Error al crear producto" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ ok: false, msg: "Producto no encontrado" });
        res.json({ ok: true, product });
    } catch {
        res.status(500).json({ ok: false, msg: "Error al actualizar producto" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ ok: false, msg: "Producto no encontrado" });
        res.json({ ok: true, msg: "Producto eliminado", product});
    } catch {
        res.status(500).json({ ok: false, msg: "Error al eliminar producto" });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
