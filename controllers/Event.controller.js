const Event = require("../models/Event.model.js");

const getEvents = async (req, res) => {
    try {
  
        const events = await Event.find({ user: req.uid }).populate('user', 'name');

        res.status(200).json({
            ok: true,
            events
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        });
    }
};

const createEvent = async (req, res) => {
    const event = new Event(req.body);

    try {
        event.user = req.uid;

        const savedEvent = await event.save();

        res.json({
            ok: true,
            savedEvent
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

const updateEvent = async (req, res) => {
    const eventId = req.params.id;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                ok: false,
                msg: 'No existen eventos por ese Id'
            });
        }
        if (event.user.toString() !== req.uid) {
            return res.status(401).json({
                ok: false,
                msg: "No tiene privilegio de editar este evento"
            });
        }

        const newEvent = {
            ...req.body,
            user: req.uid
        };

        const updatedEvent = await Event.findByIdAndUpdate(eventId, newEvent, { new: true });

        res.status(201).json({
            ok: true,
            event: updatedEvent
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

const deleteEvent = async (req, res) => {
    const eventId = req.params.id;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                ok: false,
                msg: 'No existen eventos por ese Id'
            });
        }
        if (event.user.toString() !== req.uid) {
            return res.status(401).json({
                ok: false,
                msg: "No tiene privilegio de eliminar este evento"
            });
        }

        const deletedEvent = await Event.findByIdAndDelete(eventId);

        res.status(201).json({
            ok: true,
            event: deletedEvent
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

// Exportar las funciones
module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
};
