const express = require('express');
const path = require('node:path');
const cors = require('cors');
const { configDotenv } = require('dotenv');
const connectToMongo = require('./db/config.js');

// Importar rutas
const rutaPrincipal = require('./routes/mainRouter.js');
const rutaUsuarios = require('./routes/authRouter.js');
const boardRouter = require('./routes/boardRouter.js');
const taskRouter = require('./routes/taskRouter.js');
const eventRouter = require('./routes/eventRouter.js');
const productsRouter = require("./routes/productRouter.js");
const categoriesRouter = require("./routes/categoryRouter.js");
const imagesRouter = require('./routes/imageRouter.js')

const app = express();

// Cargar variables de entorno
configDotenv();

// Conectar a la base de datos
connectToMongo();

// Middleware
app.use(cors({
  origin: 'https://matesfar-manager.netlify.app/'
}));
app.use(express.json());

// archivos estáticos desde 'public'
const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

/* Rutas de la API */
app.use('/auth', rutaUsuarios);
app.use('/pizarras', boardRouter);
app.use('/eventos', eventRouter);
app.use('/tareas', taskRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use('/api/images', imagesRouter);

app.use('/*', rutaPrincipal);

/* Fallback para React Router */
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

/* Manejo de rutas no encontradas */
app.use((req, res) => {
  res.status(404).send('Not Found');
});

/* Server */
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', (err) => {
  console.log(err ? err : `Servidor iniciado en http://localhost:${port}`);
});
