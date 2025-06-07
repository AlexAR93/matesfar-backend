const { Schema, model } = require("mongoose");

const BoardSchema = Schema({
    name: {
        type: String,
        required: true,
        trim: true, // Quita espacios en blanco al inicio y al final
    },
    owners: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    tasks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Task",
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now, 
    },
});

// Método para actualizar la fecha de última modificación
BoardSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

BoardSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

const Board = model("Board", BoardSchema);

module.exports = Board;
