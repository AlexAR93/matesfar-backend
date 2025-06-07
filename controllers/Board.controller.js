const Board = require("../models/Board.model.js");
const Task = require("../models/Task.model.js");
const User = require("../models/User.model.js");

const getBoards = async (req, res) => {
    try {
        const boards = await Board.find({ owners: req.uid }).populate("owners", "name");

        res.status(200).json({
            ok: true,
            boards,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        });
    }
};

const createBoard = async (req, res) => {
    const board = new Board(req.body);

    try {
        board.owners = [req.uid];

        const savedBoard = await board.save();

        res.status(201).json({
            ok: true,
            board: savedBoard,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        });
    }
};

const updateBoard = async (req, res) => {
    const boardId = req.params.id;

    try {
        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una pizarra con ese Id",
            });
        }

        if (!board.owners.includes(req.uid)) {
            return res.status(401).json({
                ok: false,
                msg: "No tiene privilegio de editar esta pizarra",
            });
        }

        const updatedBoard = await Board.findByIdAndUpdate(boardId, req.body, { new: true });

        res.status(200).json({
            ok: true,
            board: updatedBoard,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        });
    }
};

const deleteBoard = async (req, res) => {
    const boardId = req.params.id;

    try {
        const board = await Board.findById(boardId);

        //!Eliminaar tareas contenidad de la pizarra para evitar redunancia de datos
        await Task.deleteMany({ 'from': boardId });
        if (!board) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una pizarra con ese Id",
            });
        }

        if (!board.owners.includes(req.uid)) {
            return res.status(401).json({
                ok: false,
                msg: "No tiene privilegio de eliminar esta pizarra",
            });
        }

        await Board.findByIdAndDelete(boardId);

        res.status(200).json({
            ok: true,
            msg: "Pizarra eliminada correctamente",
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        });
    }
};

const addUserToBoard = async (req, res) => {
    const boardId = req.params.id; // ID de la pizarra
    const { userId } = req.body; // ID del usuario
    try {
        // Buscar la pizarra
        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una pizarra con ese Id",
            });
        }

        // Verificar si el usuario que realiza la acción es propietario
        if (!board.owners.includes(req.uid)) {
            return res.status(401).json({
                ok: false,
                msg: "No tiene privilegio para modificar los miembros de esta pizarra",
            });
        }

        // Verificar si el usuario ya esta
        if (board.owners.includes(userId)) {
            return res.status(400).json({
                ok: false,
                msg: "El usuario ya es miembro de la pizarra",
            });
        }

        // Verificar si el usuario a agregar existe
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                ok: false,
                msg: "El usuario que desea agregar no existe",
            });
        }

        // Agregar el nuevo usuario al array de owners
        board.owners.push(userId);

        // Guardar los cambios en la base
        await board.save();

        res.status(200).json({
            ok: true,
            msg: "Usuario agregado correctamente a la pizarra",
            board,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        });
    }
};

const removeUserFromBoard = async (req, res) => {
    const boardId = req.params.id; // ID de la pizarra
    const { userId } = req.body; // ID del usuario aeliminar

    try {
        // Buscar la pizarra
        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una pizarra con ese Id",
            });
        }

        // Verificar si el usuario que realiza la acción es propietario
        if (!board.owners.includes(req.uid)) {
            return res.status(401).json({
                ok: false,
                msg: "No tiene privilegio para modificar los miembros de esta pizarra",
            });
        }

        // Verificar si el usuario a eliminar es un propietario de la pizarra
        if (!board.owners.includes(userId)) {
            return res.status(400).json({
                ok: false,
                msg: "El usuario no es un miembro de la pizarra",
            });
        }

        // Prevenir que la pizarra se quede sin propietarios
        if (board.owners.length === 1) {
            return res.status(400).json({
                ok: false,
                msg: "No se puede eliminar al último propietario de la pizarra",
            });
        }

        // Eliminar al usuario del array de propietarios
        board.owners = board.owners.filter(ownerId => ownerId.toString() !== userId);

        // Guardar los cambios en la base
        await board.save();

        res.status(200).json({
            ok: true,
            msg: "Usuario eliminado correctamente de la pizarra",
            board,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        });
    }
};


module.exports = {
    getBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    addUserToBoard,
    removeUserFromBoard
};
