const { Router } = require("express");
const {
    getBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    addUserToBoard,
    removeUserFromBoard
} = require("../controllers/Board.controller.js");
const tokenValidator = require("../middlewares/token-validator.js");

const router = Router();

router.use(tokenValidator);

// Obtener todas las pizarras del usuario
router.get("/", getBoards);

// Crear una nueva pizarra
router.post("/", createBoard);

// Actualizar una pizarra existente
router.put("/:id", updateBoard);

// Eliminar una pizarra
router.delete("/:id", deleteBoard);

// Agregar un usuario a la pizarra
router.post("/:id/addUser", addUserToBoard);

// Eliminar un usuario de la pizarra
router.delete("/:id/removeUser", removeUserFromBoard);

module.exports = router;
