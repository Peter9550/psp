# ЛР 3. Компонентная архитектура и SPA на ванильном JavaScript

**Тема проекта**
**Буфет МГТУ им. Н. Э. Баумана.** В ЛР1–ЛР2 был калькулятор-«вышибалка» — две HTML-страницы со ссылками друг на друга. ЛР3 совершает качественный скачок: теперь это **single-page application** с компонентами, ES-модулями, переходами между «страницами» без перезагрузки и интеграцией с Bootstrap 5. Данные пока захардкожены в JS — серверная часть появится в ЛР4.

---

## Оглавление

1. [Введение и назначение](#1-введение-и-назначение)
2. [Общая структура проекта](#2-общая-структура-проекта)
3. [Описание разделов](#3-описание-разделов)
4. [SPA на одном HTML-файле](#4-spa-на-одном-html-файле)
5. [Компонентный подход](#5-компонентный-подход)
6. [Главная страница и карусель](#6-главная-страница-и-карусель)
7. [Детальная страница товара](#7-детальная-страница-товара)
8. [Переходы между страницами](#8-переходы-между-страницами)
9. [Запуск](#9-запуск)
10. [Об авторе](#10-об-авторе)

---

## 1. Введение и назначение

Третья лабораторная работа знакомит с **компонентной архитектурой** на чистом JavaScript (без React/Vue/Angular). Каждый блок интерфейса — это **класс** с методом `render()`, который рисует HTML и навешивает обработчики. Композиция компонентов даёт сложные страницы, а единая точка входа управляет тем, какая «страница» сейчас активна.

Дополнительно вводятся:
* **ES-модули** (`import` / `export`) — для разделения кода на файлы;
* **Bootstrap 5** — готовая CSS-библиотека для красивой вёрстки без писания стилей с нуля;
* **SPA** (single-page application) — один HTML-файл, JS перерисовывает содержимое.

Тематика проекта меняется с калькулятора на **буфет МГТУ**: главная страница с каруселью товаров, детальная с фото, ценой и сведениями. Эта же тема будет использоваться во всех последующих лабах.

---

## 2. Общая структура проекта

```
psp/
├── index.html                       — единственный HTML, точка входа SPA
├── main.js                          — стартовый скрипт, создаёт MainPage
├── package.json                     — Bootstrap 5 как npm-зависимость
├── pages/
│   ├── main/index.js                — MainPage: логотип + карусель товаров
│   └── product/index.js             — ProductPage: детальная карточка
└── components/
    ├── carousel/index.js            — обёртка над Bootstrap-каруселью
    ├── product-card/index.js        — карточка-плитка (на будущее)
    ├── product/index.js             — альтернативный вариант детальной
    ├── badge/index.js               — мини-бейджик-тег
    └── back-button/index.js         — кнопка «назад в каталог»
```

---

## 3. Описание разделов

Приложение состоит из двух «страниц» (рендерящихся в один контейнер) и нескольких переиспользуемых компонентов:

* **`MainPage` (`pages/main/index.js`)** — главный экран: слева логотип и заголовок «БУФЕТ МГТУ», справа карусель из четырёх товаров. Клик по слайду открывает детальную.
* **`ProductPage` (`pages/product/index.js`)** — детальная страница одного товара: фото, цена, пищевая ценность (БЖУ), срок годности. Сверху — кнопка «Назад в каталог».
* **`CarouselComponent` (`components/carousel/index.js`)** — обёртка над `bootstrap.Carousel` с автопереключением, прогресс-баром и кликом по слайдам.
* **`BackButtonComponent`** — переиспользуемая кнопка возврата с поддерживаемым колбэком.

---

## 4. SPA на одном HTML-файле

```html
<!-- index.html — всего один <div> для всего приложения -->
<body>
  <div id="root"></div>
  <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
  <script src="main.js" type="module"></script>
</body>
```

```js
// main.js — стартовая точка, 3 строки
import { MainPage } from "./pages/main/index.js";

const root = document.getElementById('root');
const mainPage = new MainPage(root);
mainPage.render();
// → создаёт первую страницу и просит её отрисоваться внутри #root
// → все переходы потом будут переписывать innerHTML того же #root
```

`type="module"` обязателен для работы `import` / `export`. Без него браузер выдаст ошибку синтаксиса. Файл `main.js` сам импортирует `MainPage`, которая в свою очередь импортирует `CarouselComponent` и `ProductPage` — образуется граф модулей.

---

## 5. Компонентный подход

Каждый компонент — **класс** с двумя обязательными частями: конструктор принимает родительский DOM-элемент, метод `render()` рисует HTML и навешивает обработчики.

```js
// components/back-button/index.js
export class BackButtonComponent {
  constructor(parent) { this.parent = parent; }

  render(listener) {
    this.parent.insertAdjacentHTML('beforeend', `
      <button id="back-btn" class="btn btn-link text-decoration-none p-0 mb-4"
              style="color: #004077; font-weight: 600;">
        <i class="bi bi-chevron-left"></i> НАЗАД В КАТАЛОГ
      </button>
    `);
    document.getElementById("back-btn").addEventListener("click", listener);
    // → колбэк listener вызывается при клике
    // → компонент не знает что произойдёт — это решает родитель
  }
}
```

Главные принципы:
* **Никакого `innerHTML +=`** — это бы убило ранее навешанные обработчики. Используем `insertAdjacentHTML('beforeend', ...)` для добавления HTML без затирания.
* **Компонент не знает, что произойдёт по клику** — он получает функцию-колбэк от родителя и просто её вызывает. Это делает компоненты переиспользуемыми.

---

## 6. Главная страница и карусель

```js
// pages/main/index.js
import { CarouselComponent } from "../../components/carousel/index.js";
import { ProductPage } from "../product/index.js";

export class MainPage {
  constructor(parent) { this.parent = parent; }

  getData() {
    return [
      { id: 1, title: "Сникерс",       price: "65 ₽", src: "..." },
      { id: 2, title: "Марс",          price: "60 ₽", src: "..." },
      { id: 3, title: "Липтон Лимон",  price: "85 ₽", src: "..." },
      { id: 4, title: "Булка с сыром", price: "45 ₽", src: "..." },
    ];
    // → данные захардкожены — в ЛР5 их перенесём на сервер
  }

  render() {
    this.parent.innerHTML = `
      <div class="container-fluid vh-100 d-flex align-items-center">
        <div class="row align-items-center g-5">
          <div class="col-lg-5 logo-box">
            <img src=".../bmstu-logo.png" alt="МГТУ">
            <h1>БУФЕТ<br>МГТУ им. Баумана</h1>
          </div>
          <div class="col-lg-7" id="carousel-root"></div>
        </div>
      </div>
    `;

    const carousel = new CarouselComponent(document.getElementById('carousel-root'));
    carousel.render(this.getData(), (id) => {
      new ProductPage(this.parent, id).render();
      // → клик по слайду создаёт ProductPage и просит её перерисовать this.parent
    });
  }
}
```

`CarouselComponent` внутри использует **Bootstrap Carousel API**: `new bootstrap.Carousel(el, {interval: 5000, ride: 'carousel'})`. Дополнительно навешен CSS-`@keyframes` прогресс-бар, который сбрасывается при каждом событии `slide.bs.carousel`.

---

## 7. Детальная страница товара

```js
// pages/product/index.js
import { BackButtonComponent } from "../../components/back-button/index.js";
import { MainPage } from "../main/index.js";

export class ProductPage {
  constructor(parent, id) {
    this.parent = parent;
    this.id = id;
  }

  getProductData(id) {
    const data = {
      1: { title: "Сникерс", price: "65 ₽", cal: "280", p: "4г", f: "14г", c: "33г", exp: "12 месяцев" },
      2: { title: "Марс",    price: "60 ₽", cal: "230", ... },
      3: { ... }, 4: { ... },
    };
    return data[id] || data[1];
    // → имитация поиска по id; в ЛР5 заменим на GET /products/:id
  }

  render() {
    const item = this.getProductData(this.id);
    this.parent.innerHTML = `<div class="container py-5" id="product-container"></div>`;
    const root = document.getElementById('product-container');

    new BackButtonComponent(root).render(() => new MainPage(this.parent).render());
    // → колбэк "назад" пересоздаёт MainPage в том же контейнере

    root.insertAdjacentHTML('beforeend', `
      <div class="row g-5">
        <div class="col-md-6"><img src="${item.src}" class="img-fluid rounded-4 shadow-sm"></div>
        <div class="col-md-6">
          <h1>${item.title}</h1>
          <table class="table table-borderless">
            <tr><td>Калории</td><td>${item.cal} ккал</td></tr>
            <tr><td>Белки</td>  <td>${item.p}</td></tr>
            <tr><td>Жиры</td>   <td>${item.f}</td></tr>
            <tr><td>Углеводы</td><td>${item.c}</td></tr>
            <tr><td>Срок годности</td><td>${item.exp}</td></tr>
          </table>
          <h3>${item.price}</h3>
        </div>
      </div>
    `);
  }
}
```

---

## 8. Переходы между страницами

Никакого роутера/`history.pushState` — переход = **просто пересоздание класса страницы и вызов `render()`** в том же `#root`.

```
[Главная]
  ↓ клик по слайду
new ProductPage(parent, id).render()
  → this.parent.innerHTML = '<div id="product-container">'
  → рендерится детальная страница

[Детальная]
  ↓ клик «Назад»
new MainPage(parent).render()
  → this.parent.innerHTML = '...логотип + карусель...'
  → снова главная, как будто и не уходили
```

**Плюсы:** простота, мгновенные переходы, никакого мерцания.
**Минусы:** URL в адресной строке не меняется, кнопка «Назад» в браузере не работает. Для прода нужен полноценный роутер (`history.pushState` + `popstate`), но это уже выходит за рамки ЛР3.

---

## 9. Запуск

Bootstrap раздаётся локально из `node_modules` — нужно один раз поставить зависимости:

```bash
npm install                # → ставит bootstrap@5.3.8

# Открыть index.html через Live Server в VS Code
# Правый клик по index.html → Open with Live Server
```

ES-модули требуют HTTP-протокол, поэтому открытие напрямую через `file://` не работает — обязательно через Live Server или любой статический сервер.

---

## 10. Об авторе

Разработка выполнена в рамках курса **«Принципы построения программных систем»**.
**Студент:** Емельянов Пётр
**Группа:** ИУ5-42Б
**Учебное заведение:** МГТУ им. Н. Э. Баумана
