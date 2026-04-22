import {ProductComponent} from "../../components/product/index.js";
import {BackButtonComponent} from "../../components/back-button/index.js";
import {MainPage} from "../main/index.js";

export class ProductPage {
    constructor(parent, id) {
        this.parent = parent;
        this.id = id;
    }

    getData() {
        // Здесь в идеале искать по массиву, но для ЛР можно просто имитировать
        return {
            id: this.id,
            src: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500",
            title: `Продукт №${this.id}`,
            text: "Подробное описание продукта. Срок годности в норме, ГОСТ соблюден.",
            price: "Уточняйте на кассе"
        };
    }

    clickBack() {
        new MainPage(this.parent).render();
    }

    render() {
        this.parent.innerHTML = '';
        this.parent.insertAdjacentHTML('beforeend', '<div id="product-page" class="container mt-5"></div>');

        const root = document.getElementById('product-page');

        new BackButtonComponent(root).render(this.clickBack.bind(this));

        const data = this.getData();
        new ProductComponent(root).render(data);
    }
}
