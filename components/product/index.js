import {BackButtonComponent} from "../../components/back-button/index.js";
import {MainPage} from "../main/index.js";

export class ProductPage {
    constructor(parent, id) {
        this.parent = parent;
        this.id = id;
    }

    getProductData(id) {
        const data = {
            1: { title: "Сникерс", price: "65 ₽", src: "https://images.unsplash.com/photo-1627311139418-4981fcae9581?w=800", cal: "280", p: "4г", f: "14г", c: "33г", exp: "12 месяцев" },
            2: { title: "Марс", price: "60 ₽", src: "https://images.unsplash.com/photo-1510103289066-51d08e9a2656?w=800", cal: "230", p: "3г", f: "11г", c: "29г", exp: "12 месяцев" },
            3: { title: "Липтон Лимон", price: "85 ₽", src: "https://images.unsplash.com/photo-1634638777176-591a27e3668b?w=800", cal: "80", p: "0г", f: "0г", c: "20г", exp: "6 месяцев" },
            4: { title: "Булка с сыром", price: "45 ₽", src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800", cal: "210", p: "6г", f: "8г", c: "25г", exp: "24 часа" }
        };
        return data[Number(id)] || data[1];
    }

    render() {
        const item = this.getProductData(this.id);
        this.parent.innerHTML = `<div class="container py-5" id="product-container"></div>`;
        const root = document.getElementById('product-container');

        new BackButtonComponent(root).render(() => new MainPage(this.parent).render());

        root.insertAdjacentHTML('beforeend', `
            <div class="row g-5 mt-2">
                <div class="col-md-6"><img src="${item.src}" class="img-fluid rounded-4 shadow" style="max-height: 500px; width: 100%; object-fit: cover;"></div>
                <div class="col-md-6">
                    <h1 class="display-5 fw-bold mb-4">${item.title}</h1>
                    <div class="bg-white p-4 rounded-4 shadow-sm border-start border-primary border-5">
                        <h5 class="fw-bold mb-4 text-uppercase text-primary">Пищевая ценность (100г)</h5>
                        <table class="table table-borderless m-0">
                            <tr><td class="ps-0">Калории</td><td class="text-end fw-bold text-primary">${item.cal} ккал</td></tr>
                            <tr><td class="ps-0">Белки</td><td class="text-end fw-bold">${item.p}</td></tr>
                            <tr><td class="ps-0">Жиры</td><td class="text-end fw-bold">${item.f}</td></tr>
                            <tr><td class="ps-0">Углеводы</td><td class="text-end fw-bold">${item.c}</td></tr>
                        </table>
                        <h2 class="mt-5 fw-extrabold text-primary">${item.price}</h2>
                    </div>
                </div>
            </div>
        `);
    }
}
