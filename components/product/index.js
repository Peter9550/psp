import {BackButtonComponent} from "../../components/back-button/index.js";
import {MainPage} from "../main/index.js";

export class ProductPage {
    constructor(parent, id) {
        this.parent = parent;
        this.id = id;
    }

    getProductData(id) {
        const data = {
            1: { title: "Сникерс", price: "65 ₽", src: "https://images.unsplash.com/photo-1627311139418-4981fcae9581?w=600", cal: "280", p: "4г", f: "14г", c: "33г", exp: "12 мес" },
            2: { title: "Марс", price: "60 ₽", src: "https://images.unsplash.com/photo-1510103289066-51d08e9a2656?w=600", cal: "230", p: "3г", f: "11г", c: "29г", exp: "12 мес" },
            3: { title: "Липтон Лимон", price: "85 ₽", src: "https://images.unsplash.com/photo-1634638777176-591a27e3668b?w=600", cal: "80", p: "0г", f: "0г", c: "20г", exp: "6 мес" },
            4: { title: "Булка с сыром", price: "45 ₽", src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", cal: "210", p: "6г", f: "8г", c: "25г", exp: "24 ч" }
        };
        return data[Number(id)] || data[1];
    }

    render() {
        const item = this.getProductData(this.id);
        this.parent.innerHTML = `<div class="container py-5" id="product-container"></div>`;
        const root = document.getElementById('product-container');

        new BackButtonComponent(root).render(() => new MainPage(this.parent).render());

        root.insertAdjacentHTML('beforeend', `
            <div class="row g-5">
                <div class="col-md-6"><img src="${item.src}" class="img-fluid rounded-4 shadow-sm"></div>
                <div class="col-md-6">
                    <h1 class="mb-4">${item.title}</h1>
                    <div class="p-4 bg-white rounded-4 shadow-sm">
                        <h5 class="fw-bold mb-3 border-bottom pb-2">Пищевая ценность (100г)</h5>
                        <table class="table table-borderless m-0">
                            <tr><td class="ps-0 text-muted">Калорийность</td><td class="text-end fw-bold">${item.cal} ккал</td></tr>
                            <tr><td class="ps-0 text-muted">Белки</td><td class="text-end fw-bold">${item.p}</td></tr>
                            <tr><td class="ps-0 text-muted">Жиры</td><td class="text-end fw-bold">${item.f}</td></tr>
                            <tr><td class="ps-0 text-muted">Углеводы</td><td class="text-end fw-bold">${item.c}</td></tr>
                            <tr class="border-top"><td class="ps-0 text-muted pt-3">Срок годности</td><td class="text-end fw-bold pt-3">${item.exp}</td></tr>
                        </table>
                        <h3 class="mt-4">${item.price}</h3>
                    </div>
                </div>
            </div>
        `);
    }
}
