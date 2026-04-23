import {CarouselComponent} from "../../components/carousel/index.js";
import {ProductPage} from "../product/index.js";

export class MainPage {
    constructor(parent) {
        this.parent = parent;
    }

    getData() {
        return [
            { id: 1, title: "Сникерс", price: "65 ₽", src: "https://main-cdn.sbermegamarket.ru/big1/hlr-system/-20/619/310/204/418/45/100059257403b0.jpg" },
            { id: 2, title: "Марс", price: "60 ₽", src: "https://main-cdn.sbermegamarket.ru/big2/hlr-system/-25/151/444/811/201/541/100074853804b0.png" },
            { id: 3, title: "Липтон Лимон", price: "85 ₽", src: "https://basket-29.wbbasket.ru/vol5552/part555289/555289822/images/c516x688/1.webp" },
            { id: 4, title: "Булка с сыром", price: "45 ₽", src: "https://www.cobsbread.com/cdn/shop/files/CAPROD000012_000_001_73569f71-6dfd-4cbe-87fd-beeb75996844.webp?v=1762887158&width=1920" }
        ];
    }

    render() {
        this.parent.innerHTML = `
            <div class="container-fluid vh-100 d-flex align-items-center">
                <div class="container">
                    <div class="row align-items-center g-5">
                        <div class="col-lg-5 logo-box text-center text-lg-start">
                            <img src="https://brandslogo.net/wp-content/uploads/2021/11/bmstu-logo.png" alt="МГТУ">
                            <h1>БУФЕТ<br>МГТУ им. Баумана</h1>
                        </div>
                        <div class="col-lg-7" id="carousel-root"></div>
                    </div>
                </div>
            </div>
        `;

        const carousel = new CarouselComponent(document.getElementById('carousel-root'));
        carousel.render(this.getData(), (id) => {
            new ProductPage(this.parent, id).render();
        });
    }
}
