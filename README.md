# ЛР 6. Fetch API + Vite

**Студент:** Емельянов Пётр, ИУ5-42Б
**Цель:** Заменить XHR на fetch + async/await и собрать фронт через Vite, чтобы бэкенд раздавал его как статику.

## План
1. Класс `Ajax` на fetch (вместо XHR)
2. async/await + try/catch в страницах
3. Vite: конфиг и скрипты
4. Сборка → `./public/` → раздача бэкендом

## 1. Запуск

```bash
# === dev (с hot-reload) ===
cd example-express && npm install && npm start   # → :3000 (API)
cd .. && npm install && npm run dev              # → :5173 (Vite dev-server)

# === production (всё на :3000, без CORS) ===
npm run build                                    # → ./public/
rm -rf example-express/public
cp -r public example-express/public
cd example-express && npm start                  # → http://localhost:3000/
```

## 2. fetch вместо XHR

```js
// Было (ЛР5, XHR + колбэки):
Ajax.get(url, (response) => render(response.data), console.error);

// Стало (ЛР6, fetch + await):
const { data } = await Ajax.get(url);
render(data);
// → нет вложенных колбэков
// → ошибки через try/catch, не через onError-параметр
```

## 3. Класс Ajax

```js
// modules/ajax.js
static async request({ method, url, body }) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw { status: response.status, statusText: response.statusText };
  // → fetch не считает 4xx/5xx за провал — проверяем response.ok сами
  const data = response.status === 204 ? null : await response.json();
  // → DELETE → 204 No Content, тела нет, response.json() упадёт на пустой строке
  return { status: response.status, data };
}

static async get(url)         { return Ajax.request({ method: 'GET',    url }); }
static async post(url, body)  { return Ajax.request({ method: 'POST',   url, body }); }
static async patch(url, body) { return Ajax.request({ method: 'PATCH',  url, body }); }
static async delete(url)      { return Ajax.request({ method: 'DELETE', url }); }
```

Внешний API класса не изменился — страницы переписывать не пришлось. Сменили низкоуровневую технологию в одном файле, остальное продолжает работать.

Файл: [`modules/ajax.js`](modules/ajax.js)

## 4. async/await в страницах

```js
// pages/main/index.js
async renderGrid() {
  try {
    const { data } = await Ajax.get(url);
    const products = Array.isArray(data) ? data : [];
    products.forEach(item => new ProductCardComponent(grid).render(item, ...));
  } catch (e) {
    grid.innerHTML = '<div>Сервер недоступен</div>';
  }
}
// → async помечает функцию → она автоматически возвращает Promise
// → await "ждёт" промис → возвращает значение из fulfilled / бросает из rejected
// → try/catch ловит и сетевые сбои, и наш throw из !response.ok
```

## 5. Vite

```js
// vite.config.js
export default {
  build: {
    outDir: './public',
    emptyOutDir: true,
  },
};
// → outDir переопределён с ./dist на ./public (под методичку)
// → emptyOutDir очищает папку перед каждой сборкой
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
├── index.html                      ← переписанный, со ссылкой на бандл
└── assets/
    └── index-Cj04efL0.js           ← весь JS склеен и минифицирован
```

## 6. Раздача статики бэкендом

```js
// example-express/src/index.js
app.use(express.static(path.join(__dirname, '..', 'public')));
// → GET /                       → public/index.html
// → GET /assets/index-XXX.js    → public/assets/index-XXX.js
// → GET /products               → не файл, идёт в API-роут
// → path.join(__dirname, '..', 'public') — устойчивый абсолютный путь
//   (методичка показывает useStaticAssets для NestJS, для Express — то же самое)
```

После сборки и копирования `public/` в бэкенд:
```
http://localhost:3000/           ← фронт (бандл от Vite)
http://localhost:3000/products   ← API
                                 → один origin, CORS не нужен
                                 → DevTools Network: PATCH без preflight OPTIONS
```

## 7. Отличия от ЛР5

| | ЛР5 | ЛР6 |
|---|---|---|
| HTTP | XMLHttpRequest | fetch |
| Стиль | колбэки `onload/onerror` | `async/await` |
| Ошибки | вторая функция-колбэк | `try/catch` |
| Доставка фронта | Live Server (отдельно :5500) | Vite билд → `express.static` |
| URL пользователя | `127.0.0.1:5500/index.html` | `localhost:3000/` |
| `<script src>` | твой `main.js` | минифицированный `assets/index-XXX.js` |
| CORS | обязателен на сервере | не нужен в prod (один origin) |

UI визуально идентичен ЛР5 — лаба про инженерию, не про функционал.

## 8. Задание

- [x] Модуль `ajax.js` переписан на `fetch` + `async/await` + `try/catch`
- [x] Проверка `response.ok` (fetch не бросает на 4xx/5xx)
- [x] Обработка 204 No Content (DELETE)
- [x] Внешний API класса сохранён — страницы не правились
- [x] `pages/main` и `pages/product` используют `async/await`
- [x] Vite добавлен в `devDependencies`
- [x] `vite.config.js` с `outDir: './public'`, `emptyOutDir: true`
- [x] Скрипты `dev`/`build`/`preview` в `package.json`
- [x] `express.static(path.join(__dirname, '..', 'public'))` в бэкенде
- [x] В prod-режиме CORS не задействован (один origin)
