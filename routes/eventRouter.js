const { Router } = require("express");
const { createEvent, deleteEvent, getEvents, updateEvent } = require("../controllers/Event.controller.js");
const tokenValidator = require("../middlewares/token-validator.js");
const fieldValidator = require("../middlewares/field-validator.js");
const isDate = require("../helpers/is-date.js");
const { check } = require("express-validator");

const app = Router();

// Aplico globalmente el middleware tokenValidator así no tengo que ponerlo 1x1
app.use(tokenValidator);

//! Si quisiera que getEvents sea público pero luego los demás métodos no. /***Abajo***/
//* Aplico el app.use(tokenValidator) por debajo de getEvents

// Obtener eventos
app.get('/', getEvents);

// Crear un nuevo evento
app.post(
    '/',
    [
        check('title', 'El título es obligatorio').not().isEmpty(),
        check('start', 'Fecha de inicio es obligatoria').custom(isDate),
        check('end', 'Fecha de finalización es obligatoria').custom(isDate),
        fieldValidator
    ],
    createEvent
);

// Actualizar evento
app.put('/:id', updateEvent);

// Borrar evento
app.delete('/:id', deleteEvent);

module.exports = app;
