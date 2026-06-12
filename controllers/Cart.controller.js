const Cart = require("../models/Cart.model.js");
const Product = require("../models/Product.model.js");

const getCart = async (req, res) => {
  const userId = req.uid;

  try {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    res.json({ ok: true, cart: cart || { items: [] } });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Error al obtener el carrito" });
  }
};

const addToCart = async (req, res) => {
  const userId = req.uid;
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ ok: false, msg: "Producto no encontrado" });

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [{ product: productId, quantity }] });
    } else {
      const existingItem = cart.items.find(item => item.product.equals(productId));
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.json({ ok: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error al agregar al carrito" });
  }
};

const removeFromCart = async (req, res) => {
  const userId = req.uid;
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ ok: false, msg: "Carrito no encontrado" });

    cart.items = cart.items.filter(item => !item.product.equals(productId));
    await cart.save();

    res.json({ ok: true, cart });
  } catch {
    res.status(500).json({ ok: false, msg: "Error al quitar del carrito" });
  }
};

const clearCart = async (req, res) => {
  const userId = req.uid;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ ok: false, msg: "Carrito no encontrado" });

    cart.items = [];
    await cart.save();

    res.json({ ok: true, msg: "Carrito vaciado", cart });
  } catch {
    res.status(500).json({ ok: false, msg: "Error al vaciar el carrito" });
  }
};

const updateQuantity = async (req, res) => {
  const userId = req.uid;
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ ok: false, msg: "Carrito no encontrado" });

    const item = cart.items.find(i => i.product.equals(productId));
    if (!item) return res.status(404).json({ ok: false, msg: "Producto no está en el carrito" });

    // Validar cantidad
    if (quantity <= 0) {
      cart.items = cart.items.filter(i => !i.product.equals(productId));
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const updatedCart = await cart.populate("items.product");
    res.json({ ok: true, cart: updatedCart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error al actualizar cantidad" });
  }
};


module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateQuantity
};
