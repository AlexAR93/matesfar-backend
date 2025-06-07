const { Router } = require("express");
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    deleteSubtask,
    addSubtask
} = require("../controllers/Task.controller.js");

const router = Router();

// Obtener todas las tareas de una pizarra
router.get("/:boardId", getTasks);

// Crear una nueva tarea en una pizarra
router.post("/", createTask);

// Agregar subtarea
router.post('/:id', addSubtask)

// Actualizar una tarea existente
router.put("/:id", updateTask);

// Eliminar una tarea
router.delete("/:id", deleteTask);

// Eliminar una tarea
router.delete("/:id/:subtareas", deleteSubtask);

module.exports = router;
