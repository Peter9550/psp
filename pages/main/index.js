import {ProductCardComponent} from "../../components/product-card/index.js";
import {CarouselComponent} from "../../components/carousel/index.js";
import {ProductPage} from "../product/index.js";

export class MainPage {
    constructor(parent) {
        this.parent = parent;
    }

    getData() {
        return [
            { id: 1, title: "Сникерс", price: "65 ₽", category: "Шоколад", src: "https://images.unsplash.com/photo-1627311139418-4981fcae9581?w=600", text: "Классический арахисовый батончик." },
            { id: 2, title: "Марс", price: "60 ₽", category: "Шоколад", src: "https://images.unsplash.com/photo-1510103289066-51d08e9a2656?w=600", text: "Мягкая нуга и густая карамель." },
            { id: 3, title: "Липтон Лимон", price: "85 ₽", category: "Напитки", src: "https://images.unsplash.com/photo-1634638777176-591a27e3668b?w=600", text: "Освежающий зеленый чай." },
            { id: 4, title: "Булка с сыром", price: "45 ₽", category: "Выпечка", src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", text: "Свежая бауманская выпечка." }
        ];
    }

    render() {
        this.parent.innerHTML = `
            <div class="container py-5">
                <div class="row align-items-center mb-5 bg-white p-4 shadow-sm rounded-4">
                    <div class="col-md-4 text-center text-md-start mb-4 mb-md-0">
                        <img src="https://brandslogo.net/wp-content/uploads/2021/11/bmstu-logo.png" class="logo-img mb-3">
                        <h1 class="display-6 mb-0">БУФЕТ<br>МГТУ</h1>
                    </div>
                    <div class="col-md-8" id="carousel-container"></div>
                </div>
                <div id="main-page" class="d-flex flex-wrap justify-content-center"></div>
            </div>
        `;

        const data = this.getData();

        // Рендерим карусель
        new CarouselComponent(document.getElementById('carousel-container')).render(data);

        // Рендерим карточки
        const cardsRoot = document.getElementById('main-page');
        data.forEach(item => {
            new ProductCardComponent(cardsRoot).render(item, () => {
                new ProductPage(this.parent, item.id).render();
            });
        });
    }
}
