const express = require('express');
const path = require('path');
const stocksRouter = require('./routes/stocks');
const stocksService = require('./services/stocksService');

const app = express();
const PORT = 3000;

// 1. Путь к данным и инициализация сервиса
const DATA_FILE_PATH = path.join(__dirname, 'data/stocks.json');
stocksService.init(DATA_FILE_PATH);

// 2. Middleware для парсинга JSON (обязательно перед роутами)
app.use(express.json());

// 3. Логирующий middleware (выводит в консоль каждый запрос)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 4. Подключение маршрутов
app.use('/stocks', stocksRouter);

// 5. Обработка несуществующих маршрутов (404)
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// 6. Глобальный обработчик ошибок (500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// 7. Запуск
app.listen(PORT, () => {
    console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
});
