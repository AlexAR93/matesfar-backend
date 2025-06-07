const { Router } = require("express");
const {  toCreateUser, toLogin, toRenew } = require('../controllers/Auth.controller.js');
const fieldValidator = require('../middlewares/field-validator.js');
const tokenValidator = require('../middlewares/token-validator.js');
const { check } = require("express-validator");

const app = Router();

//Registro de usuario
app.post('/register', [
    //Estos son middlewares, aparte del front, son otra capa de seguridad para que completen bien los campos, ya que el front es muy vulnerable.
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password debe de ser mínimo de 6 caracteres').isLength({min:6}),
    fieldValidator
], toCreateUser);

//Login de Usuario
app.post('/', toLogin);

//Renovar sesión en caso de caducar
app.get('/renew', tokenValidator, toRenew);

module.exports = app;
