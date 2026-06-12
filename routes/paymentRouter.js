const { Router } = require("express");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const Product = require("../models/Product.model");
const Sale = require("../models/Sale.model");
const validarCheckout = require("../middlewares/validarCheckout");

const router = Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// 🔍 Verificar pago real con payment_id
router.get("/verify/:payment_id", async (req, res) => {
  try {
    const { payment_id } = req.params;

    console.log("🔍 Verificando pago:", payment_id);

    // ⚠ Con el SDK nuevo la forma correcta es:
    const payment = await new Payment(client).get({ id: payment_id });

    console.log("📦 Respuesta MP:", payment);

    return res.json(payment);
  } catch (error) {
    console.error("❌ Error verificando pago:", error);
    return res.status(500).json({
      error: error.message || "Error verificando el pago",
    });
  }
});

router.post("/create_preference", validarCheckout, async (req, res) => {
  console.log("📥 Petición recibida en /create_preference");
  try {
    const { cart, address, buyerData, shipping } = req.body;

    if (!Array.isArray(cart) || !cart.length) {
      return res.status(400).json({ error: "El carrito está vacío." });
    }

    // 🔹 1️⃣ Obtener datos actualizados de los productos y calcular descuentos
    const items = await Promise.all(
      cart.map(async ({ product, quantity, variantId }) => {
        const prod = await Product.findById(product._id || product.id).lean();
        if (!prod) throw new Error(`Producto no encontrado: ${product._id}`);

        //!
        let price;
        let selectedDetails = {};

        if(variantId){
          const variant = prod.variants.find(v => v._id.toString() === variantId.toString());
          if (!variant) throw new Error("Variante no encontrada");

          price = variant.price;
          selectedDetails = variant.details || {};
        }else {
          price = prod.price;
          selectedDetails = prod.details || {};
        }
        //!
        if (prod.discount?.isActive) {
          price = Math.round(price * (1 - prod.discount.percentage / 100));
        }
        const displayTitle = variantId 
          ? `${prod.name} (${Object.values(selectedDetails).join(" - ")})` 
          : prod.name;
        return {
          productId: prod._id||prod.id,
          variantId,
          selectedDetails,
          title: displayTitle,
          quantity: Number(quantity),
          unit_price: price,
          currency_id: "ARS",
        };
      })
    );

    const itemsForMP = items.map(item => ({
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: "ARS"
    }));

    // 🔹 2️⃣ Calcular total
    let total = items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);

    // 🔸 Si el envío es por moto, sumamos $1000 al total y lo agregamos como ítem visible
    if (shipping === "moto") {
      total += 1000;
      itemsForMP.push({
        title: "Envío por moto",
        quantity: 1,
        unit_price: 1000,
        currency_id: "ARS",
      });
    }

    // 🔹 3️⃣ Crear venta preliminar en la base
    const newSale = await Sale.create({
      buyer: buyerData,
      items: items.map((c) => ({
        productId: c.productId,
        variantId: c.variantId,
        selectedDetails: c.selectedDetails,
        title: c.title,
        quantity: c.quantity,
        unit_price: c.unit_price,
      })),
      address,
      total,
      shipping,
      status: "pending",
    });

    console.log(`💾 Venta creada en DB con ID: ${newSale._id}`);

    // 🔹 4️⃣ Crear preferencia en Mercado Pago
    const preference = new Preference(client);
    const prefBody = {
      items:itemsForMP,
      back_urls: {
        success: "https://verdearoma.netlify.app/cart/success",
        failure: "https://verdearoma.netlify.app/cart/success",
        pending: "https://verdearoma.netlify.app/cart/success",
      },
      auto_return: "approved",
      notification_url:
        "https://verdearoma-backend.fly.dev/api/webhook/mp_webhook",
      metadata: {
        saleId: newSale._id.toString(),
      },
    };

    console.log("⚙️ Enviando preferencia a Mercado Pago...");
    const response = await preference.create({ body: prefBody });

    if (!response?.id) {
      throw new Error("Mercado Pago no devolvió un ID de preferencia válido.");
    }

    console.log("✅ Preferencia creada en MP:", response.id);

    // 🔹 5️⃣ Guardar el preferenceId en la venta
    await Sale.findByIdAndUpdate(newSale._id, { preferenceId: response.id });
    console.log(`🔗 Sale ${newSale._id} actualizada con preferenceId ${response.id}`);

    // 🔹 6️⃣ Responder al frontend
    return res.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    res
      .status(500)
      .json({ error: error.message || "Error al crear la preferencia de pago" });
  }
});

module.exports = router;
