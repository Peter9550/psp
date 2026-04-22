import {ProductCardComponent} from "../../components/product-card/index.js";
import {ProductPage} from "../product/index.js";

export class MainPage {
    constructor(parent) {
        this.parent = parent;
    }
    getData() {
        return [
            { id: 1, title: "Сникерс", price: "65 ₽", category: "Шоколад", src: "https://ir.ozone.ru/s3/multimedia-k/6063354584.jpg", text: "Classic peanut energy boost." },
            { id: 2, title: "Марс", price: "60 ₽", category: "Шоколад", src: "https://main-cdn.sbermegamarket.ru/big2/hlr-system/-25/151/444/811/201/541/100074853804b0.png", text: "Soft nougat and caramel." },
            { id: 3, title: "Липтон", price: "85 ₽", category: "Напитки", src: "https://basket-29.wbbasket.ru/vol5552/part555289/555289822/images/c516x688/1.webp", text: "Refreshing lemon green tea." },
            { id: 4, title: "Сырная булочка", price: "45 ₽", category: "Выпечка", src: "https://www.cobsbread.com/cdn/shop/files/CAPROD000012_000_001_73569f71-6dfd-4cbe-87fd-beeb75996844.webp?v=1762887158&width=1920", text: "Legendary BMSTU cheese bun." }
        ];
    }
    render() {
        this.parent.innerHTML = `
            <div class="container py-5">
                <h2 class="text-center mb-5" style="font-weight: 800; color: #004077;">Буфет МГТУ</h2>
                <div id="main-page" class="d-flex flex-wrap justify-content-center"></div>
            </div>
        `;
        const root = document.getElementById('main-page');
        this.getData().forEach(item => {
            new ProductCardComponent(root).render(item, () => {
                new ProductPage(this.parent, item.id).render();
            });
        });
    }
}
