import {ProductCardComponent} from "../../components/product-card/index.js";
import {ProductPage} from "../product/index.js";

export class MainPage {
    constructor(parent) {
        this.parent = parent;
    }

    getData() {
        return [
            {
                id: 1,
                src: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500",
                title: "Молоко Бауманское",
                text: "Придаёт сил перед сопроматом. 3.2% жирности.",
                category: "Молочка",
                price: "89 ₽"
            },
            {
                id: 2,
                src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500",
                title: "Булка из Столовой",
                text: "Та самая легендарная выпечка из ГЗ.",
                category: "Выпечка",
                price: "45 ₽"
            },
            {
                id: 3,
                src: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500",
                title: "Яблоко Знаний",
                text: "Помогает сконцентрироваться на лабах.",
                category: "Фрукты",
                price: "25 ₽"
            }
        ];
    }

    get pageRoot() {
        return document.getElementById('main-page');
    }

    render() {
        this.parent.innerHTML = '';
        this.parent.insertAdjacentHTML('beforeend', `
            <div class="container mt-4">
                <h2 class="mb-4 text-center" style="color: #004077;">Маркет МГТУ: Продукты</h2>
                <div id="main-page" class="d-flex flex-wrap justify-content-center"></div>
            </div>
        `);

        this.getData().forEach((item) => {
            const productCard = new ProductCardComponent(this.pageRoot);
            productCard.render(item, this.clickCard.bind(this));
        });
    }

    clickCard(e) {
        const cardId = e.target.dataset.id;
        const productPage = new ProductPage(this.parent, cardId);
        productPage.render();
    }
}
