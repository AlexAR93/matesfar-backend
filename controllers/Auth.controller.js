const { compareSync, genSaltSync, hashSync } = require("bcrypt");
const User = require("../models/User.model.js");
const toGenerateJWT = require("../helpers/jwt.js");

const toCreateUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe un usuario con ese correo'
            });
        }

        user = new User(req.body);

        // Encriptar contraseña
        const salt = genSaltSync();
        user.password = hashSync(password, salt);

        await user.save();

        // JWT
        const token = await toGenerateJWT(user.id, user.name);

        res.status(201).json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
};

const toLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario y/o contraseña no son correctos'
            });
        }

        // passwords confirmación
        const validPassword = compareSync(password, user.password);
console.log(validPassword)
console.log(password)
console.log(user.password)
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Incorrect password'
            });
        }

        // JWT
        const token = await toGenerateJWT(user.id, user.name);

        res.json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
};

const toRenew = async (req, res) => {
    const { uid, name } = req;

    // Generar JWT
    const token = await toGenerateJWT(uid, name);

    res.json({
        ok: true,
        uid,
        name,
        token
    });
};

module.exports = {
    toCreateUser,
    toLogin,
    toRenew
};
