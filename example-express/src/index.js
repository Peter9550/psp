const express = require('express');
const http = require('http'); // Встроенный модуль Node.js
const { Server } = require('socket.io'); // Импорт сокетов
const path = require('path');
const stocksRouter = require('./routes/stocks');
const stocksService = require('./services/stocksService');

const app = express();
const server = http.createServer(app); // Создаем HTTP-сервер на базе Express
const io = new Server(server); // Привязываем сокеты к серверу

const PORT = 3000;

// Делаем объект io доступным во всем приложении через req
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(express.json());
app.use(express.static('public'));

// Логика подключения
io.on('connection', (socket) => {
    console.log('Новое устройство подключилось по WebSocket! 🔌');

    socket.on('disconnect', () => {
        console.log('Пользователь отключился');
    });
});

app.use('/stocks', stocksRouter);

// Важно: теперь запускаем server.listen, а не app.listen
server.listen(PORT, () => {
    console.log(`Сервер и WebSockets запущены на порту ${PORT} 🚀`);
});
