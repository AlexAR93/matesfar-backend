const { Schema, model } = require("mongoose");

const SchemaUser= Schema({
    name: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true,
        unique: true
    },
    password: {
        type: String,
        required:true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
})

const User=model('User', SchemaUser);
module.exports = User;