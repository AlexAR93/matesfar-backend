const { Schema, model } = require("mongoose");

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String
}, { timestamps: true });

CategorySchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

Category = model("Category", CategorySchema);

module.exports = Category;