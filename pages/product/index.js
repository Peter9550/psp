import {BackButtonComponent} from "../../components/back-button/index.js";
import {MainPage} from "../main/index.js";

export class ProductPage {
    constructor(parent, id) {
        this.parent = parent;
        this.id = id;
    }
    // В реальности данные ищутся по ID, здесь имитируем поиск
    getProductData(id) {
        const data = {
            1: { title: "Сникерс", price: "65 ₽", src: "https://ir.ozone.ru/s3/multimedia-k/6063354584.jpg", cal: "280", p: "4г", f: "14г", c: "33г", exp: "12 месяцев" },
            2: { title: "Марс", price: "60 ₽", src: "https://main-cdn.sbermegamarket.ru/big2/hlr-system/-25/151/444/811/201/541/100074853804b0.png", cal: "230", p: "3г", f: "11г", c: "29г", exp: "12 месяцев" },
            3: { title: "Липтон", price: "85 ₽", src: "https://basket-29.wbbasket.ru/vol5552/part555289/555289822/images/c516x688/1.webp", cal: "80", p: "0г", f: "0г", c: "20г", exp: "6 месяцев" },
            4: { title: "Сырная булочка", price: "45 ₽", src: "https://www.cobsbread.com/cdn/shop/files/CAPROD000012_000_001_73569f71-6dfd-4cbe-87fd-beeb75996844.webp?v=1762887158&width=1920", cal: "210", p: "6г", f: "8г", c: "25г", exp: "24 часа" }
        };
        return data[id] || data[1];
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
                    <h1 class="fw-bold mb-4" style="color: #004077;">${item.title}</h1>
                    <div class="p-4 bg-white rounded-4 shadow-sm">
                        <h5 class="fw-bold mb-3">Состав продукта</h5>
                        <table class="table table-borderless m-0">
                            <tr><td class="ps-0 text-muted">Калории</td><td class="text-end fw-bold">${item.cal} ккал</td></tr>
                            <tr><td class="ps-0 text-muted">Белки</td><td class="text-end fw-bold">${item.p}</td></tr>
                            <tr><td class="ps-0 text-muted">Жиры</td><td class="text-end fw-bold">${item.f}</td></tr>
                            <tr><td class="ps-0 text-muted">Углеводы</td><td class="text-end fw-bold">${item.c}</td></tr>
                            <tr class="border-top"><td class="ps-0 text-muted pt-3">Срок годности</td><td class="text-end fw-bold pt-3">${item.exp}</td></tr>
                        </table>
                        <h3 class="mt-4 fw-bold" style="color: #004077;">${item.price}</h3>
                    </div>
                </div>
            </div>
        `);
    }
}
