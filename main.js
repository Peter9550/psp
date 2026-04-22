import {MainPage} from "./pages/main/index.js";

const root = document.getElementById('root'); // Нашли ли мы тот самый div?
const mainPage = new MainPage(root); // Создали страницу
mainPage.render(); // Сказали ей отрисоваться
