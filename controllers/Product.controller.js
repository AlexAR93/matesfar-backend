const Product = require("../models/Product.model");

const getProductsMinified = async (req, res) => {
  try {
    const products = await Product.find(
      {}, // sin filtros
      "id name price stock images discount" // solo campos necesarios
    );

    res.json({ ok: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error al obtener productos" });
  }
};


const getProducts = async (req, res) => {
  try {
    const { category, sort, search, page = 1, limit = 12 } = req.query;

    let filter = {};
    if (category) {
      filter.category = category;
    }

    let regex = null;
    let wordStartRegex = null;

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      regex = new RegExp(escaped, "i");
      wordStartRegex = new RegExp(`(^|\\s)${escaped}`, "i");

      filter.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let products = await Product.find(filter)
      .populate("category", "name")
      .skip(skip)
      .limit(parseInt(limit));

    // --- NO convertir el producto a objeto ---
    if (search) {
      products = products.map(p => {
        let relevance = 0;

        if (wordStartRegex.test(p.name)) relevance += 4;
        if (new RegExp(`\\b${search}\\b`, "i").test(p.name)) relevance += 3;
        if (regex.test(p.name)) relevance += 2;
        if (regex.test(p.description)) relevance += 1;

        // agregamos la relevancia al documento original
        p._doc.relevance = relevance;
        return p;
      });

      products.sort((a, b) => b._doc.relevance - a._doc.relevance);
    }

    if (sort === "price_asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      products.sort((a, b) => b.price - a.price);
    }

    const total = await Product.countDocuments(filter);

    res.json({ ok: true, products, total });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error al obtener productos" });
  }
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

const getDiscountedProducts = async (req, res) => {
  try {
    const products = await Product.find({ "discount.isActive": true }).populate("category", "name");

    res.json({ ok: true, products });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Error al obtener productos con descuento" });
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
    const updateData = { ...req.body };

    if (updateData.details && Object.keys(updateData.details).length === 0) {
      delete updateData.details;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
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

const validateCart = async (req, res) => {
  try {
    const { items } = req.body; // [{ id, quantity }]
    if (!Array.isArray(items)) {
      return res.status(400).json({ ok: false, msg: "Formato de carrito inválido" });
    }

    const ids = items.map(i => i.id);
    const products = await Product.find({ _id: { $in: ids } });

    // Recorremos los items y los validamos contra la DB
    const validatedItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.id);
      if (!product) return null; // producto eliminado

      // Ajustar cantidad si stock es menor
      const safeQty = Math.min(item.quantity, product.stock);

      // Evitamos incluir productos sin stock
      if (safeQty <= 0) return null;

      return {
        product: {
          id: product._id.toString(),
          name: product.name,
          price: product.price,
          stock: product.stock,
          images: product.images || [],
          discount: product.discount || 0,
        },
        quantity: safeQty
      };
    }).filter(Boolean);

    return res.json({ ok: true, items: validatedItems });
  } catch (err) {
    console.error("Error validando carrito:", err);
    res.status(500).json({ ok: false, msg: "Error validando carrito" });
  }
}

module.exports = {
    getProductsMinified,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getDiscountedProducts,
    validateCart
};
