# ЛР 5. AJAX-взаимодействие с API через XMLHttpRequest

**Тема проекта**
**Буфет МГТУ им. Н. Э. Баумана** — каталог продуктов буфета с возможностью поиска, просмотра состава (БЖУ, калории, срок годности) и удаления карточек. Данные хранятся на отдельном бэкенд-сервере, фронтенд получает их асинхронно по HTTP.

---

## Оглавление

1. [Введение и назначение](#1-введение-и-назначение)
2. [Общая структура проекта](#2-общая-структура-проекта)
3. [Описание разделов](#3-описание-разделов)
4. [Класс Ajax и URL-константы](#4-класс-ajax-и-url-константы)
5. [Главная страница и фильтрация](#5-главная-страница-и-фильтрация)
6. [Удаление через DELETE](#6-удаление-через-delete)
7. [Решение CORS](#7-решение-cors)
8. [Дополнительное задание: 3 режима PATCH](#8-дополнительное-задание-3-режима-patch)
9. [Запуск](#9-запуск)
10. [Об авторе](#10-об-авторе)

---

## 1. Введение и назначение

Лабораторная работа посвящена освоению взаимодействия с внешним API через `XMLHttpRequest`. В отличие от предыдущих работ, где данные были захардкожены в JS-массивах, здесь карточки буфета хранятся на отдельном Node.js-сервере и подгружаются в браузер асинхронно по сети.

Реализованный **вариант 1**: фильтрация карточек по названию (с серверной стороны через query-параметр) и удаление через HTTP-метод `DELETE`. Дополнительно реализованы три режима отправки `PATCH`-запросов для наглядной демонстрации асинхронности в DevTools → Network.

Приложение соответствует требованиям методички ИУ5: используется паттерн «класс-обёртка» над XHR с колбэками, URL-константы вынесены в отдельный модуль, бэкенд построен по слоёной архитектуре (routes → controllers → services).

---

## 2. Общая структура проекта

Проект состоит из двух независимых процессов, общающихся по HTTP: фронтенд (браузер) и бэкенд (Node.js + Express).

```
psp/
├── index.html                       — каркас SPA: один <div id="root">
├── main.js                          — точка входа, создаёт MainPage
├── modules/
│   ├── ajax.js                      — класс Ajax (XHR + колбэки)
│   ├── stockUrls.js                 — URL-константы API
│   └── priceScheduler.js            — 3 режима PATCH (доп. задание)
├── pages/
│   ├── main/index.js                — главная: сетка карточек, поиск
│   └── product/index.js             — детальная: одна карточка + редактирование
├── components/
│   ├── product-card/index.js        — карточка-плитка с кнопкой удаления
│   └── back-button/index.js         — кнопка «назад»
└── example-express/                 — бэкенд (отдельный процесс)
    ├── package.json                 — express, nodemon
    └── src/
        ├── index.js                 — запуск, CORS, регистрация роутера
        ├── routes/products.js       — REST-маршруты GET/POST/PATCH/DELETE
        ├── controllers/             — обработчики эндпоинтов
        ├── services/                — бизнес-логика и работа с файлом
        └── data/products.json       — «база данных»
```

---

## 3. Описание разделов

В состав приложения входят следующие функциональные страницы и модули:

* **Главная (`pages/main/index.js`)** — сетка карточек товаров буфета, поле поиска с серверной фильтрацией, кнопки удаления.
* **Детальная (`pages/product/index.js`)** — состав одного товара (калории, БЖУ, срок годности, цена) с формой редактирования цены.
* **Модуль `Ajax` (`modules/ajax.js`)** — единственное место в коде, где упоминается `XMLHttpRequest`. Класс со статическими методами `get`, `post`, `patch`, `delete`, принимающими URL и колбэки `onSuccess` / `onError`.
* **Модуль `Urls` (`modules/stockUrls.js`)** — централизованный реестр всех URL'ов API. Базовый адрес вынесен в одну константу.
* **Бэкенд (`example-express/`)** — REST API на пять эндпоинтов, данные в JSON-файле, CORS-middleware для разрешения cross-origin запросов.

---

## 4. Класс Ajax и URL-константы

```js
// modules/ajax.js
Ajax.get('http://localhost:3000/products',
  (response) => console.log(response.data),  // → 2xx: распарсенный JSON в data
  (err)      => console.error(err)           // → не-2xx или сетевой сбой
);
// → XHR на колбэках, без Promise (это уже ЛР6)
// → DELETE/204: data = null (тела нет, не парсим пустую строку)
```

```js
// modules/stockUrls.js
const BASE_URL = 'http://localhost:3000';

export const Urls = {
  products:        ()       => `${BASE_URL}/products`,
  productsByTitle: (title)  => `${BASE_URL}/products?title=${encodeURIComponent(title)}`,
  product:         (id)     => `${BASE_URL}/products/${id}`,
};
// → encodeURIComponent для кириллицы в query: 'сни' → '%D1%81%D0%BD%D0%B8'
// → Сменить BASE_URL = 1 строка → весь код продолжит работать
```

---

## 5. Главная страница и фильтрация

Загрузка карточек — GET-запрос на `/products`. Фильтрация выполняется **на сервере** через query-параметр `?title=`, что соответствует паттернам реальных API (нельзя гонять миллион записей на клиент).

```js
// pages/main/index.js
Ajax.get(
  this.filter ? Urls.productsByTitle(this.filter) : Urls.products(),
  (response) => self._renderProducts(response.data),
  (err) => grid.innerHTML = '<div>Сервер недоступен</div>'
);
// → Хардкод массива из ЛР3 удалён — состояние полностью на бэке

input.addEventListener('input', (e) => {
  self.filter = e.target.value.trim();
  clearTimeout(self._debounce);
  self._debounce = setTimeout(() => self.renderGrid(), 300);
});
// → debounce 300мс — на «Сникерс» уходит 1 запрос вместо 7
```

---

## 6. Удаление через DELETE

```js
// components/product-card/index.js
delBtn.addEventListener("click", (e) => {
  e.stopPropagation();                          // → не открыть детальную случайно
  if (confirm(`Удалить «${data.title}»?`)) onDelete(data.id);
});

// pages/main/index.js
Ajax.delete(Urls.product(id),
  () => self.renderGrid(),                      // → перечитать список с сервера
  (err) => alert('Не удалось удалить')
);
// → preflight OPTIONS → CORS-middleware отвечает 204
// → основной DELETE → сервер пишет урезанный JSON, возвращает 204 No Content
// → renderGrid() показывает актуальное состояние
// → F5: удалённая карточка не возвращается (данные стёрты с диска)
```

---

## 7. Решение CORS

Фронт открывается через Live Server на `http://127.0.0.1:5500`, бэк — на `http://localhost:3000`. Разные origin → браузер блокирует cross-origin запросы по умолчанию (Same-Origin Policy).

```js
// example-express/src/index.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
// → middleware ставит CORS-заголовки на каждый ответ
// → OPTIONS-запросы (preflight перед PATCH/DELETE) обрабатываются вручную
// → Вместо костыля «CORS Unblock extension» из методички — серверное решение
```

---

## 8. Дополнительное задание: 3 режима PATCH

На детальной странице рядом с ценой — кнопка «Изменить», открывающая форму ввода новой цены и три кнопки сохранения. Каждая использует свой режим планирования `PATCH`-запроса.

```js
// modules/priceScheduler.js

saveImmediate(id, price, onOk, onErr);
// → PATCH улетает сразу после клика
// → в Network видно мгновенно

saveWithTimeout(id, price, onOk, onErr);
// → setTimeout(15000) → потом PATCH
// → в Network появляется через 15 секунд
// → ticket сохраняется в pendingDelayed для связи с режимом 3

saveAfterDelayed(id, price, onOk, onErr);
// → если pendingDelayed.done === false → ждёт в очереди listeners
// → когда PATCH из режима 1 завершится — fireListeners() запускает PATCH
// → если активного отложенного нет — улетает сразу
```

**Что видит препод в Network (waterfall):**

```
T+0с    │ PATCH /products/3   ← режим 2 (моментально)
T+15с   │ PATCH /products/3   ← режим 1 (был с таймаутом)
T+15.1с │ PATCH /products/3   ← режим 3 (ждал режима 1)
```

JS-поток не блокируется ожиданием — все три клика обработаны мгновенно, запросы расставлены по таймлайну. Это и есть **асинхронность**: одна последовательность выполнения, несколько операций «в полёте» одновременно.

---

## 9. Запуск

```bash
# 1. Бэкенд (один раз — установка зависимостей)
cd example-express
npm install

# 2. Запустить сервер
npm start
# → http://localhost:3000

# 3. Открыть index.html через Live Server в VS Code
# → http://127.0.0.1:5500
```

Проверка API:
```bash
curl http://localhost:3000/products              # список всех
curl http://localhost:3000/products/1            # одна по id
curl -X DELETE http://localhost:3000/products/1  # удаление (204)
curl -X PATCH http://localhost:3000/products/1 \
     -H "Content-Type: application/json" \
     -d '{"price":"99 ₽"}'                       # изменение цены
```

---

## 10. Об авторе

Разработка выполнена в рамках курса **«Принципы построения программных систем»**.
**Студент:** Емельянов Пётр
**Группа:** ИУ5-42Б
**Учебное заведение:** МГТУ им. Н. Э. Баумана
