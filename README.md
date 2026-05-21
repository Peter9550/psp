# Лабораторная работа №6 — Promise, fetch, сборка клиентской части

**Дисциплина:** Принципы построения программных систем
**Группа:** ИУ5-42Б
**Студент:** Емельянов Пётр
**Вариант:** 1 (продолжение варианта из ЛР5)

---

## Цель работы

Лабораторная состоит из двух частей:

1. **Заменить механизм взаимодействия с API**: вместо устаревшего
   `XMLHttpRequest` (на колбэках) использовать современный `fetch` API
   на промисах и `async/await`.

2. **Собрать клиентскую часть через систему сборки** (Vite) и настроить
   бэкенд на раздачу собранного фронтенда в качестве статики, чтобы
   фронт и API работали с одного origin и проблема CORS была решена
   архитектурно.

Лабораторная надстраивается над ЛР5 — ветка создана от `ajax`.

---

## Часть 1: переход с XMLHttpRequest на fetch

### Что такое Promise

`Promise` — объект, представляющий результат будущей асинхронной операции.
У промиса три состояния:

- **pending** — операция выполняется, результат ещё неизвестен;
- **fulfilled** — операция успешно завершена (вызвали `resolve(value)`);
- **rejected** — операция завершилась с ошибкой (вызвали `reject(error)`).

Слежение за состоянием — через методы:

- `.then(onSuccess, onError)` — реакция на завершение;
- `.catch(onError)` — короткая запись для обработки ошибки;
- `.finally(cb)` — выполняется в любом случае.

В отличие от колбэков, промисы можно **цепочкой связывать** и удобно
обрабатывать ошибки в одном месте через `.catch` или `try/catch` с `await`.

### async/await

Синтаксический сахар над промисами. Функция, помеченная `async`,
автоматически возвращает промис. Внутри неё можно писать `await`
перед промисом — выполнение «приостанавливается» до его завершения,
после чего возвращается значение из fulfilled. Если промис ушёл
в rejected — `await` бросает исключение, которое ловится обычным
`try/catch`.

Это позволяет писать асинхронный код «как синхронный»:

```js
async function load() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
    } catch (err) {
        console.log('ошибка:', err);
    }
}
```

### fetch API

`fetch` — современная встроенная функция браузера для HTTP-запросов,
возвращающая промис. Заменяет `XMLHttpRequest`.

**Особенности**, которые учтены в моём коде:

1. **fetch не считает HTTP-ошибки 4xx/5xx за провал** — он считает,
   что «ответ получили, статус 404 — это тоже ответ». Промис уходит
   в rejected только при сетевом сбое. Поэтому проверяю `response.ok`
   (true для статусов 200–299) и сам бросаю исключение.

2. **204 No Content не имеет тела** — `response.json()` упадёт на
   пустой строке. Проверяю статус отдельно.

### Реализация: `modules/ajax.js`

В ЛР5 этот файл оборачивал `XMLHttpRequest` в `new Promise`. В ЛР6
переписан полностью на `fetch` + `async/await` + `try/catch`.
**Внешний API класса не изменился** — методы `get / post / patch / delete`
работают так же, поэтому страницы переписывать не пришлось.

```js
export class Ajax {
    static async request({ method, url, body }) {
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                throw { status: response.status, statusText: response.statusText };
            }

            const data = response.status === 204 ? null : await response.json();
            return { status: response.status, data };
        } catch (e) {
            throw e;
        }
    }

    static async get(url)         { return Ajax.request({ method: 'GET', url }); }
    static async post(url, body)  { return Ajax.request({ method: 'POST', url, body }); }
    static async patch(url, body) { return Ajax.request({ method: 'PATCH', url, body }); }
    static async delete(url)      { return Ajax.request({ method: 'DELETE', url }); }
}
```

Это показывает **силу модульной архитектуры**: смена низкоуровневой
технологии (XHR → fetch) затронула один файл, остальной код не пострадал.

### Страницы

В `pages/main/index.js` и `pages/product/index.js` теперь используется
`async/await` и `try/catch` вместо колбэков:

```js
async renderGrid() {
    try {
        const { data } = await Ajax.get(url);
        // ...рендерим карточки
    } catch (e) {
        // ...показываем «Сервер недоступен»
    }
}
```

---

## Часть 2: сборка через Vite и раздача статики

### Что такое Vite

[Vite](https://vite.dev/) — современный сборщик фронтенда. Аналоги:
Webpack (старый и тяжёлый), Rollup, Parcel.

**Что делает сборщик:**

1. Прочитывает `index.html`, идёт по дереву `import`'ов, **склеивает
   все модули в один-два файла**. В разработке один HTML-запрос вместо
   десятков.
2. **Минифицирует** — выкидывает пробелы, комментарии, переименовывает
   переменные. Файл сокращается в разы.
3. **Хеширует имя файла** (`index-Cj04efL0.js`) — при изменении кода хеш
   меняется, что заставляет браузер обновить кеш.
4. В dev-режиме предоставляет **hot reload** — меняешь файл, страница
   автообновляется без F5.

### Установка и конфигурация

```bash
npm install -D vite
```

`vite.config.js`:

```js
export default {
    build: {
        outDir: './public',
        emptyOutDir: true,
    },
};
```

Скрипты в `package.json`:

```json
{
    "type": "module",
    "scripts": {
        "dev":     "vite",
        "build":   "vite build",
        "preview": "vite preview"
    }
}
```

- `npm run dev` — поднимает dev-сервер на `http://localhost:5173` с
  hot-reload.
- `npm run build` — собирает продакшен-бандл в папку `./public/`.
- `npm run preview` — локальный просмотр результата сборки.

После `npm run build`:

```
public/
├── index.html                      — переписанный, со ссылкой на бандл
└── assets/
    └── index-Cj04efL0.js           — весь JS, склеенный и минифицированный
```

### Раздача статики бэкендом

В `example-express/src/index.js` добавлена строка:

```js
app.use(express.static(path.join(__dirname, '..', 'public')));
```

Эта middleware говорит Express: «любой запрос, которого нет в API-роутах,
попробуй отдать как файл из `example-express/public/`». В результате:

- `GET /` → `public/index.html`
- `GET /assets/index-XXX.js` → `public/assets/index-XXX.js`
- `GET /products` → попадает в API-роут

`path.join(__dirname, '..', 'public')` — устойчивый абсолютный путь,
не зависит от того, из какой директории запущен `node`.

Методичка показывает аналогичный приём для NestJS через
`useStaticAssets(resolve(__dirname, '..', 'public'))`. У меня Express,
поэтому используется `express.static(...)` — **то же самое, разные
библиотеки**.

### Решение CORS «архитектурным» способом

В ЛР5 CORS решался на сервере через middleware с заголовками
`Access-Control-Allow-*`. В ЛР6 в production-режиме это **не нужно**
вообще: фронт и API оба отдаются с `http://localhost:3000` — один
origin, Same-Origin Policy не срабатывает.

CORS-middleware оставлено в `index.js` на случай dev-режима, когда фронт
запускается отдельно на `:5173` (Vite dev-server) и обращается к
бэку на `:3000`.

---

## Отличия от ЛР5

| Что | ЛР5 | ЛР6 |
|---|---|---|
| HTTP-клиент | `XMLHttpRequest` + колбэки | `fetch` + `async/await` |
| Сигнатура методов `Ajax` | `Ajax.get(url, onSuccess, onError)` | `await Ajax.get(url)` |
| Обработка ошибок | вторая функция-колбэк | `try/catch` |
| Доставка фронта | Live Server (отдельно) | бандл от Vite, раздаваемый Express |
| URL пользователя | `http://127.0.0.1:5500/index.html` | `http://localhost:3000/` |
| `<script src>` | твой `main.js` | минифицированный `assets/index-XXX.js` |
| CORS | обязателен (разные origin) | не нужен в prod (один origin) |

UI визуально не изменился — это **инженерное улучшение** без изменения
поведения для пользователя.

---

## Как запустить

### Production-режим (всё на одном порту, без CORS)

```bash
# 1. Установить зависимости
npm install                       # vite в корне
cd example-express && npm install # express в бэке

# 2. Собрать фронт
cd ..
npm run build                     # появится ./public/

# 3. Скопировать билд в бэкенд
rm -rf example-express/public
cp -r public example-express/public

# 4. Запустить бэк
cd example-express
npm start                         # :3000

# 5. Открыть http://localhost:3000/
```

### Dev-режим (с hot reload, нужен CORS)

```bash
# Терминал 1 — бэк
cd example-express
npm start                         # :3000

# Терминал 2 — Vite dev-server
npm run dev                       # :5173 (с hot-reload)

# Открыть http://localhost:5173/
```

---

## Выводы

В ходе работы получены навыки:

1. Понимание промисов: три состояния (pending / fulfilled / rejected),
   методы `.then` / `.catch` / `.finally`, цепочки промисов.
2. Использование `async/await` как современного способа работы с
   асинхронным кодом, перехват ошибок через `try/catch`.
3. Применение `fetch` API вместо устаревшего `XMLHttpRequest`,
   корректная обработка нюансов: проверка `response.ok`, обработка
   204 No Content.
4. Настройка системы сборки фронтенда (Vite): конфигурация, скрипты,
   принцип работы бандлинга и минификации.
5. Раздача статических ресурсов через Express (`express.static`),
   объединение фронта и API на одном origin — устранение проблемы
   CORS на архитектурном уровне.
6. Понимание разницы между dev-режимом (hot-reload, два процесса)
   и production-режимом (один сервер, оптимизированный бандл).

Приложение работает идентично ЛР5 для конечного пользователя, но
использует современный стек технологий: промисы вместо колбэков,
fetch вместо XHR, сборщик вместо «голых» модулей. Это типичный путь
эволюции фронтенд-проекта от учебного к продакшен-готовому.
