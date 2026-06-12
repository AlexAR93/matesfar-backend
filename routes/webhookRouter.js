const { Router } = require("express");
const { MercadoPagoConfig, Payment } = require("mercadopago");
const Sale = require("../models/Sale.model");

const router = Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// ✅ Webhook de Mercado Pago
router.post("/mp_webhook", async (req, res) => {
  try {
    const data = req.body;

    console.log("📨 Webhook recibido:", JSON.stringify(data, null, 2));

    // Solo procesamos notificaciones de tipo "payment"
    if (data.type !== "payment") {
      console.log("⚪ Evento ignorado (no es de tipo 'payment').");
      return res.status(200).send("Evento ignorado");
    }

    // ✅ Obtener detalles del pago desde Mercado Pago
    const payment = await new Payment(client).get({ id: data.data.id });
    console.log("💰 Detalle del pago:", payment);

    // ✅ Mercado Pago puede devolver saleId o sale_id
    const saleId = payment.metadata?.saleId || payment.metadata?.sale_id;
    const status = payment.status;
    const paymentId = payment.id;

    if (!saleId) {
      console.warn("⚠️ Pago recibido sin saleId o sale_id en metadata. Ignorado.");
      return res.status(200).send("Sin saleId");
    }

    // ✅ Actualizar la venta con el nuevo estado e ID de pago
    await Sale.findByIdAndUpdate(saleId, {
      status,
      paymentId,
    });

    console.log(`✅ Venta ${saleId} actualizada a estado '${status}' con paymentId ${paymentId}`);
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error procesando webhook:", error);
    res.status(500).send("Error interno");
  }
});

module.exports = router;
