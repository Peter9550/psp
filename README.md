# ЛР 6. Promise, fetch, сборка клиентской части через Vite

**Тема проекта**
**Буфет МГТУ им. Н. Э. Баумана** — то же приложение каталога продуктов буфета, что и в ЛР5, но переведённое на современный стек: `XMLHttpRequest` заменён на `fetch` с `async/await`, а фронтенд собирается сборщиком Vite и раздаётся бэкендом как статика.

---

## Оглавление

1. [Введение и назначение](#1-введение-и-назначение)
2. [Общая структура проекта](#2-общая-структура-проекта)
3. [Описание разделов](#3-описание-разделов)
4. [Promise и async/await — что это](#4-promise-и-asyncawait--что-это)
5. [Класс Ajax на fetch](#5-класс-ajax-на-fetch)
6. [async/await в страницах](#6-asyncawait-в-страницах)
7. [Сборка через Vite](#7-сборка-через-vite)
8. [Раздача статики бэкендом](#8-раздача-статики-бэкендом)
9. [Отличия от ЛР5](#9-отличия-от-лр5)
10. [Запуск](#10-запуск)
11. [Об авторе](#11-об-авторе)

---

## 1. Введение и назначение

Лабораторная работа состоит из **двух частей**:

* **Часть 1** — заменить устаревший `XMLHttpRequest` (на колбэках) современным `fetch` API на промисах и `async/await`. Изменение должно затронуть только низкоуровневый модуль работы с сетью.
* **Часть 2** — собрать клиентскую часть через систему сборки **Vite** и настроить бэкенд на раздачу собранного фронтенда как статики, чтобы фронт и API работали с одного origin и проблема CORS была решена архитектурно.

Лабораторная надстраивается над ЛР5 — ветка `fetch` создана от ветки `ajax`. Функционал приложения (поиск, удаление, просмотр карточек, изменение цены) полностью идентичен предыдущей лабораторной — это работа над **инженерным качеством**, а не над фичами.

---

## 2. Общая структура проекта

```
psp/
├── index.html                       — каркас SPA: один <div id="root">
├── main.js                          — точка входа, создаёт MainPage
├── vite.config.js                   — конфигурация сборщика
├── package.json                     — скрипты dev/build/preview, devDep vite
├── modules/
│   ├── ajax.js                      — класс Ajax (fetch + async/await)
│   └── stockUrls.js                 — URL-константы API
├── pages/
│   ├── main/index.js                — главная: сетка карточек + поиск
│   └── product/index.js             — детальная: одна карточка
├── components/
│   ├── product-card/index.js        — карточка-плитка
│   └── back-button/index.js         — кнопка «назад»
├── public/                          — результат `npm run build` (gitignored)
└── example-express/                 — бэкенд (Node.js + Express)
    ├── package.json
    ├── public/                      — копия билда фронта (gitignored)
    └── src/
        ├── index.js                 — запуск, CORS, express.static, роутер
        ├── routes/products.js       — REST: GET/POST/PATCH/DELETE
        ├── controllers/             — обработчики
        ├── services/                — бизнес-логика
        └── data/products.json       — «база данных»
```

---

## 3. Описание разделов

В ЛР6 заменены/добавлены следующие компоненты:

* **`modules/ajax.js`** — полностью переписан с XHR на `fetch` + `async/await` + `try/catch`. Внешний API класса (`Ajax.get/post/patch/delete`) сохранён, поэтому страницы переписывать не пришлось.
* **`pages/main/index.js`, `pages/product/index.js`** — теперь используют `await` вместо колбэков.
* **`vite.config.js` (новый)** — конфигурация сборщика Vite с `outDir: './public'`.
* **`package.json`** — добавлены скрипты `dev`/`build`/`preview` и `vite` в `devDependencies`.
* **`example-express/src/index.js`** — добавлен `express.static(path.join(__dirname, '..', 'public'))` для раздачи собранного фронта как статики.

---

## 4. Promise и async/await — что это

`Promise` — объект, представляющий результат **будущей** асинхронной операции. У него три состояния:

* `pending` — операция выполняется, результат неизвестен;
* `fulfilled` — успех (вызвали `resolve(value)`);
* `rejected` — ошибка (вызвали `reject(error)`).

`async/await` — синтаксический сахар над промисами. Функция, помеченная `async`, автоматически возвращает промис. Внутри неё можно ставить `await` перед другим промисом — выполнение «приостанавливается» до завершения, и возвращается значение из `fulfilled` (или бросается исключение из `rejected`, которое ловится `try/catch`).

```js
// Старый стиль — цепочка .then().catch()
fetch(url)
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(err => console.log(err));

// Современный стиль — async/await
async function load() {
  try {
    const r = await fetch(url);
    const data = await r.json();
    console.log(data);
  } catch (err) {
    console.log(err);
  }
}
// → код читается сверху вниз как синхронный
// → ошибки ловятся обычным try/catch
```

---

## 5. Класс Ajax на fetch

```js
// modules/ajax.js
static async request({ method, url, body }) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw { status: response.status, statusText: response.statusText };
  }
  // → fetch НЕ считает HTTP-ошибки 4xx/5xx за провал
  // → промис уходит в rejected только при сетевом сбое
  // → response.ok = true для 200–299, проверяю и бросаю сам

  const data = response.status === 204 ? null : await response.json();
  // → DELETE возвращает 204 No Content, тела нет
  // → response.json() упадёт на пустой строке — поэтому проверка

  return { status: response.status, data };
}

static async get(url)         { return Ajax.request({ method: 'GET',    url }); }
static async post(url, body)  { return Ajax.request({ method: 'POST',   url, body }); }
static async patch(url, body) { return Ajax.request({ method: 'PATCH',  url, body }); }
static async delete(url)      { return Ajax.request({ method: 'DELETE', url }); }
```

Главная мысль: **сменили низкоуровневую технологию (XHR → fetch) в одном файле**, остальной код не пострадал, потому что внешний интерфейс класса (`Ajax.get/post/patch/delete`) идентичен. Это сила модульной архитектуры.

---

## 6. async/await в страницах

```js
// pages/main/index.js
async renderGrid() {
  try {
    const { data } = await Ajax.get(url);                  // → ждём промис
    const products = Array.isArray(data) ? data : [];
    products.forEach(item => new ProductCardComponent(grid).render(item, ...));
  } catch (e) {
    grid.innerHTML = '<div>Сервер недоступен</div>';       // → ловим и сетевой сбой,
                                                            //   и наш throw из !response.ok
  }
}
```

Сравните с ЛР5, где приходилось разносить логику на две функции (onSuccess / onError) и тащить контекст через `const self = this`. Теперь линейный код.

---

## 7. Сборка через Vite

```js
// vite.config.js
export default {
  build: {
    outDir: './public',     // → методичка просит ./public (по умолчанию ./dist)
    emptyOutDir: true,      // → очищать перед каждой сборкой
  },
};
```

```json
// package.json
{
  "type": "module",
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview"
  },
  "devDependencies": { "vite": "^5.4.10" }
}
// → npm run dev: dev-сервер на :5173 + hot-reload
// → npm run build: склейка + минификация + хеширование → ./public/
// → npm run preview: локальный просмотр прод-сборки
```

После `npm run build`:
```
public/
├── index.html                      ← переписан, ссылается на хешированный бандл
└── assets/
    └── index-Cj04efL0.js           ← весь JS склеен и минифицирован
```

Хеш в имени файла (`Cj04efL0`) — это для кеширования. При изменении кода хеш меняется → браузер видит новое имя → перекачивает. Старый кеш не путается с новым.

---

## 8. Раздача статики бэкендом

```js
// example-express/src/index.js
app.use(express.static(path.join(__dirname, '..', 'public')));
// → GET /                        → public/index.html
// → GET /assets/index-XXX.js     → public/assets/index-XXX.js
// → GET /products                → не файл, идёт в API-роут
```

`path.join(__dirname, '..', 'public')` — устойчивый абсолютный путь, не зависит от того, из какой директории запущен `node`. Методичка показывает аналог для NestJS: `useStaticAssets(resolve(__dirname, '..', 'public'))` — для Express это `express.static(...)`, то же самое.

После сборки и копирования `public/` в бэкенд:
```
http://localhost:3000/             ← фронт (бандл от Vite)
http://localhost:3000/products     ← API
                                   → один origin → CORS не нужен в prod
                                   → DevTools Network: PATCH/DELETE без preflight OPTIONS
```

---

## 9. Отличия от ЛР5

| | ЛР5 | ЛР6 |
|---|---|---|
| HTTP-клиент | `XMLHttpRequest` | `fetch` |
| Стиль | колбэки `onload/onerror` | `async/await` |
| Обработка ошибок | вторая функция-колбэк | `try/catch` |
| Доставка фронта | Live Server (отдельно :5500) | Vite билд → `express.static` |
| URL пользователя | `127.0.0.1:5500/index.html` | `localhost:3000/` |
| `<script src>` | твой `main.js` | минифицированный `assets/index-XXX.js` |
| CORS | обязателен на сервере | не нужен в prod (один origin) |

UI визуально идентичен ЛР5 — лаба про **инженерное качество**, а не про функционал.

---

## 10. Запуск

**Dev-режим** (с hot-reload, два процесса):
```bash
# терминал 1 — бэкенд
cd example-express
npm install                       # один раз
npm start                         # → :3000 (только API)

# терминал 2 — Vite dev-server
cd ..
npm install                       # один раз
npm run dev                       # → http://localhost:5173/
```

**Production-режим** (всё на одном порту, без CORS):
```bash
npm run build                                    # → ./public/
rm -rf example-express/public
cp -r public example-express/public
cd example-express && npm start                  # → http://localhost:3000/
```

---

## 11. Об авторе

Разработка выполнена в рамках курса **«Принципы построения программных систем»**.
**Студент:** Емельянов Пётр
**Группа:** ИУ5-42Б
**Учебное заведение:** МГТУ им. Н. Э. Баумана
