const express = require('express');
const cors = require('cors');
const path = require('path');
const { configDotenv } = require('dotenv');
const connectToMongo = require('./db/config.js');

// Routers
const rutaPrincipal = require('./routes/mainRouter.js');
const rutaUsuarios = require('./routes/authRouter.js');
const boardRouter = require('./routes/boardRouter.js');
const taskRouter = require('./routes/taskRouter.js');
const eventRouter = require('./routes/eventRouter.js');
const productsRouter = require("./routes/productRouter.js");
const categoriesRouter = require("./routes/categoryRouter.js");
const imagesRouter = require('./routes/imageRouter.js');
const cartRouter = require('./routes/cartRouter.js');
const paymentRouter = require("./routes/paymentRouter.js");
const webhookRouter = require("./routes/webhookRouter.js");

configDotenv();
connectToMongo();

const app = express();

app.use(cors({
  origin: [
    'https://matesfar-manager.netlify.app',
    'https://matesfar.netlify.app'
  ]
}));
app.use(express.json());

// Archivos estáticos
const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

// --- Rutas API ---
app.use('/auth', rutaUsuarios);
app.use('/pizarras', boardRouter);
app.use('/eventos', eventRouter);
app.use('/tareas', taskRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/images', imagesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/webhook', webhookRouter);

// --- Mercado Pago redirect routes ---
app.get('/success', (req, res) => res.redirect('https://matesfar.netlify.app/'));
app.get('/failure', (req, res) => res.redirect('https://matesfar.netlify.app/failure'));
app.get('/pending', (req, res) => res.redirect('https://matesfar.netlify.app/pending'));

// --- React frontend fallback ---
app.use('/*', rutaPrincipal);
app.get('*', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));

// --- 404 handler ---
app.use((req, res) => res.status(404).send('Not Found'));

// --- Start server ---
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () =>
  console.log(`🚀 Servidor iniciado en http://localhost:${port}`)
);
