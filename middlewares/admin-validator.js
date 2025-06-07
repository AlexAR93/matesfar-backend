const User = require("../models/User.model");

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.uid);
        if (!user || user.role !== "admin") {
            return res.status(403).json({
                ok: false,
                msg: "Acceso denegado. Se requiere rol de administrador."
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ ok: false, msg: "Error interno." });
    }
};

module.exports = isAdmin;
