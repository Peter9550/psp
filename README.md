# ЛР 4. REST API на Express.js со слоёной архитектурой

**Тема проекта**
**Буфет МГТУ им. Н. Э. Баумана.** В ЛР3 фронтенд был полностью самодостаточным — данные карточек товаров жили в JS-массивах. ЛР4 строит **бэкенд** отдельным процессом на Node.js + Express, который хранит данные в JSON-файле и отдаёт их по HTTP. В этой работе ещё нет фронтенда — только сервер с REST API, проверяемый через Postman/curl. В ЛР5 фронтенд подключится к этому API через AJAX.

---

## Оглавление

1. [Введение и назначение](#1-введение-и-назначение)
2. [Общая структура проекта](#2-общая-структура-проекта)
3. [Описание разделов](#3-описание-разделов)
4. [Слоёная архитектура](#4-слоёная-архитектура)
5. [REST-эндпоинты](#5-rest-эндпоинты)
6. [Контроллеры и сервисы](#6-контроллеры-и-сервисы)
7. [Хранение данных в JSON-файле](#7-хранение-данных-в-json-файле)
8. [WebSocket-канал для уведомлений](#8-websocket-канал-для-уведомлений)
9. [Запуск](#9-запуск)
10. [Об авторе](#10-об-авторе)

---

## 1. Введение и назначение

Четвёртая лабораторная работа знакомит с серверной разработкой на **Node.js + Express.js**. Цель — спроектировать REST API для управления карточками «акций» (вариант домена методички; в ЛР5 переименуем в «продукты» под фронт ЛР3), реализовать слоёную архитектуру (routes → controllers → services), сохранять состояние в JSON-файле и проверить работу через Postman.

Дополнительно настроен **WebSocket**-канал через `socket.io`: при создании, изменении и удалении карточки сервер рассылает событие подключённым клиентам. Это закладывает основу для будущего real-time обновления UI в более продвинутых лабах.

---

## 2. Общая структура проекта

```
psp/
├── .postman/
│   └── resources.yaml                — конфигурация запросов для Postman
├── postman/
│   └── globals/workspace.globals.yaml — глобальные переменные Postman
└── example-express/
    ├── package.json                  — express, socket.io, nodemon
    ├── public/test.html              — тестовая страница для проверки сокетов
    └── src/
        ├── index.js                  — запуск сервера, middleware, регистрация роутов
        ├── routes/stocks.js          — маршруты GET/POST/PATCH/DELETE /stocks
        ├── controllers/stocksController.js
        ├── services/stocksService.js — бизнес-логика
        ├── services/fileService.js   — чтение/запись JSON-файла
        └── data/stocks.json          — «база данных»
```

---

## 3. Описание разделов

Сервер реализован по **трёхслойной архитектуре** — паттерн, принятый во всех серьёзных бэкенд-проектах:

* **`src/index.js`** — точка входа. Создаёт Express-приложение, навешивает middleware (JSON-парсер, статика, проксирование `io` в `req`), подключает socket.io и роутер `/stocks`, запускает HTTP-сервер на порту 3000.
* **`src/routes/stocks.js`** — карта URL → функция контроллера. Один файл, никакой логики, только маппинг.
* **`src/controllers/stocksController.js`** — тонкий слой между HTTP и бизнес-логикой. Достаёт параметры из `req`, вызывает сервис, формирует `res`.
* **`src/services/stocksService.js`** — операции `findAll / findOne / create / update / remove`. Не знает про HTTP.
* **`src/services/fileService.js`** — низкоуровневое чтение/запись JSON через встроенный модуль `fs`.

---

## 4. Слоёная архитектура

Запрос идёт сверху вниз, ответ — обратно:

```
[Клиент (Postman / браузер)]
        ↓ HTTP-запрос
[Express middleware: CORS, JSON-парсер, io]
        ↓
[routes/stocks.js: маппинг URL → функция]
        ↓
[controllers/stocksController.js: req → service → res]
        ↓
[services/stocksService.js: бизнес-логика]
        ↓
[services/fileService.js: чтение/запись stocks.json]
        ↓
[stocks.json на диске]
```

Каждый слой знает только о соседнем — `controller` не лезет в файл напрямую, `service` не знает что такое `req`/`res`. Это позволяет менять один слой не трогая остальные: если завтра заменим JSON-файл на PostgreSQL — поправим только `fileService` (или подменим целиком), контроллеры и роуты останутся как есть.

---

## 5. REST-эндпоинты

```js
// src/routes/stocks.js
const router = express.Router();

router.get('/',       stocksController.getAllStocks);     // GET    /stocks
router.get('/:id',    stocksController.getStockById);     // GET    /stocks/5
router.post('/',      stocksController.createStock);      // POST   /stocks
router.patch('/:id',  stocksController.updateStock);      // PATCH  /stocks/5
router.delete('/:id', stocksController.deleteStock);      // DELETE /stocks/5
```

Полная таблица эндпоинтов:

| Метод  | URL                  | Что делает                  | Успех        | Ошибка        |
|--------|----------------------|-----------------------------|--------------|---------------|
| GET    | `/stocks`            | список всех                 | 200 + JSON   | —             |
| GET    | `/stocks?title=сни`  | фильтрация по подстроке     | 200 + JSON   | —             |
| GET    | `/stocks/:id`        | одна карточка по id         | 200 + JSON   | 404 если нет  |
| POST   | `/stocks`            | создать                     | 201 + JSON   | 400 без полей |
| PATCH  | `/stocks/:id`        | обновить (частично)         | 200 + JSON   | 404 если нет  |
| DELETE | `/stocks/:id`        | удалить                     | 204          | 404 если нет  |

---

## 6. Контроллеры и сервисы

```js
// src/controllers/stocksController.js
const getAllStocks = (req, res) => {
  const { title } = req.query;                          // → ?title=... достаём из URL
  const stocks = stocksService.findAll(title);
  res.json(stocks);                                      // → отправили JSON клиенту
};

const createStock = (req, res) => {
  const { src, title, text } = req.body;                // → req.body уже распарсен express.json()
  if (!src || !title || !text)
    return res.status(400).json({ error: 'Не все поля заполнены' });

  const newStock = stocksService.create({ src, title, text });
  if (req.io) req.io.emit('stockCreated', newStock);    // → оповещаем socket.io подписчиков
  res.status(201).json(newStock);
};

const deleteStock = (req, res) => {
  const id = parseInt(req.params.id);                   // → :id всегда строка → приводим к числу
  const success = stocksService.remove(id);
  if (!success) return res.status(404).json({ error: 'Карточка не найдена' });
  if (req.io) req.io.emit('stockDeleted', id);
  res.status(204).send();                               // → 204 No Content, тело пустое
};
```

```js
// src/services/stocksService.js
const findAll = (title) => {
  const stocks = fileService.readData(dataFilePath);
  if (title) {
    return stocks.filter(s =>
      s.title.toLowerCase().includes(title.toLowerCase())
    );
  }
  return stocks;
};

const create = (stockData) => {
  const stocks = fileService.readData(dataFilePath);
  const newId = stocks.length > 0 ? Math.max(...stocks.map(s => s.id)) + 1 : 1;
  const newStock = { id: newId, ...stockData };
  stocks.push(newStock);
  fileService.writeData(dataFilePath, stocks);
  return newStock;
};

const remove = (id) => {
  const stocks = fileService.readData(dataFilePath);
  const filteredStocks = stocks.filter(s => s.id !== id);
  if (filteredStocks.length === stocks.length) return false;   // → ничего не удалили
  fileService.writeData(dataFilePath, filteredStocks);
  return true;
};
```

---

## 7. Хранение данных в JSON-файле

```js
// src/services/fileService.js
const fs = require('fs');

const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);                            // → текст файла → JS-массив
  } catch (err) {
    console.error('Ошибка чтения файла:', err);
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    // → JSON.stringify с отступом 2 — файл остаётся читаемым человеком
  } catch (err) {
    console.error('Ошибка записи файла:', err);
  }
};
```

В качестве «базы данных» используется `src/data/stocks.json` — обычный JSON-массив. Это упрощение для учебной лабы: нет необходимости поднимать PostgreSQL/MongoDB. В реальном проекте `fileService` был бы заменён на интеграцию с настоящей БД через ORM (Sequelize, Prisma, TypeORM).

**Минус подхода** — нет блокировок: при параллельных POST/DELETE возможен race condition (двое читают, оба пишут, изменения первого теряются). Для учебной лабы это не критично.

---

## 8. WebSocket-канал для уведомлений

В дополнение к REST API настроен **WebSocket-канал** через `socket.io`. Идея: когда сервер изменяет состояние (создал/обновил/удалил карточку), он рассылает событие всем подключённым клиентам.

```js
// src/index.js
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);                  // → нужен HTTP-сервер для apt и для сокетов
const io = new Server(server);

app.use((req, res, next) => {
  req.io = io;                                          // → пробрасываем io в каждый req
  next();
});

io.on('connection', (socket) => {
  console.log('Новое устройство подключилось по WebSocket! 🔌');
  socket.on('disconnect', () => console.log('Пользователь отключился'));
});

server.listen(PORT, () => {
  console.log(`Сервер и WebSockets запущены на порту ${PORT}`);
});
```

В контроллерах при изменении данных делается `req.io.emit('eventName', payload)`. Любая открытая страница, подписанная на этот канал (через `socket.on('eventName', cb)`), получит событие сразу — без перезагрузки или повторного запроса.

В этой ЛР сокетный канал просто настроен, тестовая страница лежит в `example-express/public/test.html`. Реальное использование появится в более поздних лабах.

---

## 9. Запуск

```bash
cd example-express
npm install                       # → ставит express, socket.io, nodemon

npm run dev                       # → nodemon: автоперезапуск при изменении файлов
# или
npm start                         # → продакшен-запуск через node

# → сервер слушает http://localhost:3000
```

Проверка эндпоинтов через **curl**:

```bash
# Список всех
curl http://localhost:3000/stocks

# По id
curl http://localhost:3000/stocks/1

# Создание
curl -X POST http://localhost:3000/stocks \
     -H "Content-Type: application/json" \
     -d '{"src":"http://example.com/img.jpg","title":"Новая","text":"описание"}'

# Обновление
curl -X PATCH http://localhost:3000/stocks/1 \
     -H "Content-Type: application/json" \
     -d '{"title":"Новый заголовок"}'

# Удаление
curl -X DELETE http://localhost:3000/stocks/1
```

Также подготовлены коллекции для **Postman** — папки `postman/` и `.postman/` содержат YAML-конфигурации запросов.

---

## 10. Об авторе

Разработка выполнена в рамках курса **«Принципы построения программных систем»**.
**Студент:** Емельянов Пётр
**Группа:** ИУ5-42Б
**Учебное заведение:** МГТУ им. Н. Э. Баумана
