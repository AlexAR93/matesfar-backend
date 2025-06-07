const { default: mongoose } = require("mongoose");
const Task = require("../models/Task.model.js");

const getTasks = async (req, res) => {
    const currentBoardId = req.params.boardId; // Suponiendo que el `boardId` se pasa en la URL
    
    try {
        // Verifica si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(currentBoardId)) {
        return res.status(400).json({ message: "ID de tablero inválido" });
      }
  
      // Usa el constructor correctamente para convertir el ID
      const tasks = await Task.find({ from: new mongoose.Types.ObjectId(currentBoardId) })
        .populate("from", "name");
    
        res.status(200).json({
            ok: true,
            tasks,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"+error,
        });
    }
};

const createTask = async (req, res) => {
    const task = new Task(req.body);

    try {
        const savedTask = await task.save();

        res.status(201).json({
            ok: true,
            task: savedTask,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        });
    }
};

const addSubtask = async (req, res) => {
    const taskId = req.params.id; // ID de la tarea principal
    console.log(req.body)
    const { text } = req.body; // Texto de la nueva subtarea

    try {
        // Busca la tarea por su ID
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una tarea con ese ID",
            });
        }

        // Crear una nueva subtarea con un _id único
        const newSubtask = {
            _id: new mongoose.Types.ObjectId(),
            text,
        };

        // Agregar la subtarea al array taskList
        task.taskList.push(newSubtask);

        // Guardar los cambios en la base de datos
        await task.save();

        res.status(201).json({
            ok: true,
            msg: "Subtarea agregada correctamente",
            task,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador: " + error.message,
        });
    }
};


const updateTask = async (req, res) => {
    const taskId = req.params.id;
    const updateData = req.body; // Datos flexibles en un objeto genérico

    try {
        // Buscar y actualizar la tarea en una sola operación
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $set: updateData },
            { new: true, runValidators: true } // Retornar la tarea actualizada y validar cambios
        );

        if (!updatedTask) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una tarea con ese ID",
            });
        }

        res.status(200).json({
            ok: true,
            task: updatedTask,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: `Hable con el administrador: ${error.message}`,
        });
    }
};


const deleteSubtask = async (req, res) => {
    const taskId = req.params.id;
    const subtaskId = req.params.subtareas;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una tarea con ese Id",
            });
        }
        await Task.updateOne(
            { _id: taskId }, // Filtro: Busca la tarea por _id
            { $pull: { taskList: { _id: subtaskId } } } // Elimina la subtarea con el _id especificado
          )
        
        res.status(200).json({
            ok: true,
            task: 'Subtarea eliminada',
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"+error,
        });
    }
};


const deleteTask = async (req, res) => {
    const taskId = req.params.id;
    console.log(taskId)
    try {
        const task = await Task.findById(taskId);
        console.log(task)
        if (!task) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una tarea con ese Id",
            });
        }

        await Task.findByIdAndDelete(taskId);

        res.status(200).json({
            ok: true,
            msg: "Tarea eliminada correctamente",
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        });
    }
};

module.exports = {
    getTasks,
    createTask,
    addSubtask,
    updateTask,
    deleteTask,
    deleteSubtask,
};
