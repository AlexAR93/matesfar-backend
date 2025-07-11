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
  }
}, { timestamps: true });

ProductSchema.method("toJSON", function () {
  const { __v, _id, price, realPrice, discount, ...object } = this.toObject();

  object.id = _id;

  // Lógica segura de descuento: se aplica sobre el `price` público
  if (discount?.isActive && discount?.percentage) {
    object.finalPrice = Number((price * (1 - discount.percentage / 100)).toFixed(2));
  } else {
    object.finalPrice = price;
  }

  // Solo mostramos realPrice si sos admin (opcional filtrar según roles)
  object.price = price;
  object.realPrice = realPrice;
  object.discount = discount;

  return object;
});


module.exports = model("Product", ProductSchema);
