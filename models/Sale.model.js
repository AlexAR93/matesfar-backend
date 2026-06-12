const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    buyer: {
      type: Object,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        // 🔹 Si compró el original, esto viene null o undefined
        variantId: {
          type: String,
          required: false 
        },
        title: String,
        selectedDetails: {
          type: Object,
          required: false
        },
        quantity: { type: Number, required: true },
        unit_price: { type: Number, required: true },
      },
    ],
    address: {
      type: Object,
      required: false,
    },
    total: {
      type: Number,
      required: true,
    },
    preferenceId: {
      type: String,
      required: false, // ✅ Se asigna después de crearse la preferencia de MP
    },
    paymentId: {
      type: String,
      required: false,
    },
    shipping:{
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "in_process"],
      default: "pending", // ✅ coherente con el flujo normal
    },
  },
  {
    timestamps: true, // ✅ agrega createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model("Sale", saleSchema);
