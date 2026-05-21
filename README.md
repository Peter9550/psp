# ЛР 5. AJAX на XMLHttpRequest

**Студент:** Емельянов Пётр, ИУ5-42Б
**Вариант:** 1 (фильтрация по названию + удаление)
**Цель:** Заменить захардкоженные данные ЛР3 реальными HTTP-запросами к серверу через XHR.

## План
1. Класс `Ajax` (XHR-обёртка на колбэках)
2. URL-константы в `modules/stockUrls.js`
3. Загрузка списка карточек с сервера
4. Фильтрация по названию (GET `?title=`)
5. Удаление через DELETE
6. Доп: 3 режима PATCH для демонстрации асинхронности

## 1. Запуск

```bash
# бэкенд
cd example-express
npm install
npm start
# → http://localhost:3000

# фронтенд: открыть index.html через Live Server в VS Code
# → http://127.0.0.1:5500
```

## 2. Класс Ajax

```js
Ajax.get('http://localhost:3000/products',
  (response) => console.log(response.data),
  (err)      => console.error(err)
);
// → XHR GET /products
// → 2xx: вызывает onSuccess({status, data}) с распарсенным JSON
// → не-2xx или сетевой сбой: вызывает onError({status, statusText})
// → DELETE/204: data = null (тела нет, не парсим пустую строку)
```

Файл: [`modules/ajax.js`](modules/ajax.js)

## 3. URL-константы

```js
import { Urls } from "./modules/stockUrls.js";

Urls.products()              // → http://localhost:3000/products
Urls.productsByTitle('сни')  // → http://localhost:3000/products?title=%D1%81%D0%BD%D0%B8
Urls.product(5)              // → http://localhost:3000/products/5
// → encodeURIComponent для кириллицы в query
// → BASE_URL вынесен в одну константу — поменять адрес = 1 строка
```

Файл: [`modules/stockUrls.js`](modules/stockUrls.js)

## 4. Загрузка списка

```js
Ajax.get(Urls.products(),
  (response) => self._renderProducts(response.data),
  (err) => grid.innerHTML = '<div>Сервер недоступен</div>'
);
// → Захардкоженные массивы из ЛР3 удалены
// → Состояние карточек теперь полностью на бэке (products.json)
```

Файл: [`pages/main/index.js`](pages/main/index.js)

## 5. Фильтрация (на сервере)

```js
input.addEventListener('input', (e) => {
  self.filter = e.target.value.trim();
  clearTimeout(self._debounce);
  self._debounce = setTimeout(() => self.renderGrid(), 300);
});
// → debounce 300мс — не дёргаем сервер на каждую букву
// → renderGrid собирает Urls.productsByTitle(self.filter)
// → Сервер фильтрует через .filter(p => p.title.toLowerCase().includes(...))
```

## 6. Удаление

```js
// в карточке:
delBtn.addEventListener("click", (e) => {
  e.stopPropagation();                          // не открыть детальную случайно
  if (confirm(`Удалить «${data.title}»?`)) onDelete(data.id);
});

// в MainPage:
Ajax.delete(Urls.product(id),
  () => self.renderGrid(),                      // успех → перечитать список
  (err) => alert('Не удалось удалить')
);
// → DELETE /products/5
// → preflight OPTIONS — CORS middleware отвечает 204
// → основной DELETE → сервер пишет урезанный JSON, возвращает 204
// → onSuccess → renderGrid() с актуальным состоянием
// → F5: удалённая карточка не возвращается (данные стёрты с диска)
```

## 7. CORS

```js
// example-express/src/index.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
// → Фронт на :5500 (Live Server), бэк на :3000 — разные origin
// → Same-Origin Policy блокирует cross-origin запросы по умолчанию
// → Заголовки разрешают, OPTIONS обрабатывается для preflight (PATCH/DELETE)
// → Вместо костыля "CORS Unblock extension" — решение на сервере
```

## 8. Доп задание: 3 режима PATCH

На детальной странице рядом с ценой кнопка «Изменить» → input + 3 кнопки:

```js
// modules/priceScheduler.js
saveImmediate(id, price, onOk, onErr);
// → PATCH улетает сразу
// → в Network видно сразу после клика

saveWithTimeout(id, price, onOk, onErr);
// → setTimeout(15000) → потом PATCH
// → в Network появляется через 15 секунд
// → ticket сохраняется в pendingDelayed для режима 3

saveAfterDelayed(id, price, onOk, onErr);
// → если pendingDelayed.done === false → ждёт в очереди listeners
// → когда PATCH из режима 1 завершится — fireListeners() запускает PATCH
// → если активного отложенного нет — улетает сразу
```

Демо в DevTools → Network:
```
T+0с    │ PATCH /products/3   ← режим 2 (моментально)
T+15с   │ PATCH /products/3   ← режим 1 (был с таймаутом)
T+15.1с │ PATCH /products/3   ← режим 3 (ждал режима 1)
```

JS-поток не блокируется ожиданием → асинхронность видна как разнесённые во времени запросы.

Файлы: [`modules/priceScheduler.js`](modules/priceScheduler.js), [`pages/product/index.js`](pages/product/index.js)

## 9. Структура проекта

```
psp/
├── index.html                       — SPA-каркас, один <div id="root">
├── main.js                          — точка входа, создаёт MainPage
├── modules/
│   ├── ajax.js                      — XHR + колбэки
│   ├── stockUrls.js                 — URL-константы
│   └── priceScheduler.js            — 3 режима PATCH (доп)
├── pages/
│   ├── main/index.js                — сетка карточек + поиск + удаление
│   └── product/index.js             — детальная + форма редактирования цены
├── components/
│   ├── product-card/index.js        — плитка с кнопкой ✕ и CSS-фолбэком img
│   └── back-button/index.js
└── example-express/
    ├── package.json                 — express, nodemon
    └── src/
        ├── index.js                 — запуск, CORS, статика, роутер /products
        ├── routes/products.js       — REST: GET/POST/PATCH/DELETE
        ├── controllers/             — req/res ↔ сервис
        ├── services/                — бизнес-логика + чтение/запись файла
        └── data/products.json       — "база"
```

## 10. Задание

- [x] Класс Ajax с методами get/post/patch/delete (на колбэках, без Promise)
- [x] URL-константы (Urls.products, Urls.product(id), Urls.productsByTitle)
- [x] Загрузка списка через GET /products
- [x] Загрузка одной карточки через GET /products/:id
- [x] Фильтрация по названию (GET /products?title=) с debounce
- [x] Удаление карточки (DELETE /products/:id) с подтверждением
- [x] CORS решён на сервере через middleware + обработка preflight
- [x] Доп: 3 режима PATCH (моментально, через 15с, после первого) для демо асинхронности
