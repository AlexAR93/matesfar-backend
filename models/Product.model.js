const { Schema, model } = require("mongoose");

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  realPrice: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  images: {
    type: Array,
    required: true
  },
  discount: {
    isActive: {
      type: Boolean,
      default: false
    },
    percentage: {
      type: Number,
      min: 1,
      max: 100
    }
  },

  details: {
    type: Map,
    of: String,
    required: false
  },
  variants: [{
    details: {
      type: Map,
      of: String,
      required: true
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: String
  }],

}, { timestamps: true });

ProductSchema.method("toJSON", function () {
  const { __v, _id, price, realPrice, discount, ...object } = this.toObject({ getters: true });

  object.id = _id;

  if (discount?.isActive && discount?.percentage) {
    object.finalPrice = Number((price * (1 - discount.percentage / 100)).toFixed(2));
  } else {
    object.finalPrice = price;
  }

  object.price = price;
  object.realPrice = realPrice;
  object.discount = discount;

  // 🔹 FIX: convertir Map a objeto plano
  if (object.details instanceof Map) {
    object.details = Object.fromEntries(object.details);
  }

  // 🔹 NUEVO FIX: Convertir los Maps de cada variante
  if (object.variants && Array.isArray(object.variants)) {
    object.variants = object.variants.map(v => {
      if (v.details instanceof Map) {
        v.details = Object.fromEntries(v.details);
      }
      return v;
    });
  }

  return object;
});


module.exports = model("Product", ProductSchema);
