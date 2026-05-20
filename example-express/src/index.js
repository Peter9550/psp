const express = require('express');
const path = require('path');
const productsRouter = require('./routes/products');
const productsService = require('./services/productsService');

const app = express();
const PORT = 3000;

productsService.init(path.join(__dirname, 'data', 'products.json'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use(express.json());
// ЛР6, часть 2: раздаём собранный фронт как статику
// path устойчив к CWD: __dirname = .../example-express/src, поднимаемся на уровень и берём public/
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/products', productsRouter);

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT} 🚀`);
});
