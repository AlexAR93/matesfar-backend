const { Schema, model } = require("mongoose");

const SaleSchema = Schema({
    products: [
        {
            product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            },
            quantity: {
            type: Number,
            required: true,
            min: 1
            },
            price: {
            type: Number,
            required: true,
            }
        }
        ]
        ,
    buyer:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true,
    }
}, { timestamps: true });

SaleSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Sale = model("Sale", SaleSchema);

module.exports = Sale;
