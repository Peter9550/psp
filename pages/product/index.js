import { BackButtonComponent } from "../../components/back-button/index.js";
import { MainPage } from "../main/index.js";
import { Ajax } from "../../modules/ajax.js";
import { Urls } from "../../modules/stockUrls.js";

export class ProductPage {
    constructor(parent, id) {
        this.parent = parent;
        this.id = id;
    }

    render() {
        this.parent.innerHTML = `<div class="container py-5" id="product-container"></div>`;
        const root = document.getElementById('product-container');
        const self = this;

        new BackButtonComponent(root).render(function () {
            new MainPage(self.parent).render();
        });

        root.insertAdjacentHTML('beforeend', `
            <div class="state-block" id="product-loading">
                <i class="bi bi-arrow-clockwise spinner-icon"></i>
                <div>Загрузка...</div>
            </div>
        `);

        Ajax.get(
            Urls.product(this.id),
            function (response) {
                self._renderProduct(root, response.data);
            },
            function (err) {
                console.error('Не удалось загрузить карточку', err);
                self._renderError(root);
            }
        );
    }

    _renderProduct(root, item) {
        const loading = document.getElementById('product-loading');
        if (loading) loading.remove();

        if (!item) {
            this._renderError(root);
            return;
        }

        const safeTitle = encodeURIComponent(item.title || 'Товар');
        const fallback = `https://placehold.co/600x600/004077/FFFFFF/png?text=${safeTitle}`;

        root.insertAdjacentHTML('beforeend', `
            <div class="row g-5 mt-2">
                <div class="col-md-6">
                    <img src="${item.src}" alt="${item.title}" class="product-detail-img"
                         onerror="this.onerror=null;this.src='${fallback}';">
                </div>
                <div class="col-md-6">
                    <h1 class="fw-bold mb-4" style="color: #004077;">${item.title}</h1>
                    <div class="detail-card">
                        <h5 class="mb-4">Состав продукта</h5>
                        <table class="table table-borderless m-0">
                            <tr><td class="ps-0 text-muted">Калории</td>
                                <td class="text-end fw-bold">${item.cal} ккал</td></tr>
                            <tr><td class="ps-0 text-muted">Белки</td>
                                <td class="text-end fw-bold">${item.p}</td></tr>
                            <tr><td class="ps-0 text-muted">Жиры</td>
                                <td class="text-end fw-bold">${item.f}</td></tr>
                            <tr><td class="ps-0 text-muted">Углеводы</td>
                                <td class="text-end fw-bold">${item.c}</td></tr>
                            <tr class="border-top">
                                <td class="ps-0 text-muted pt-3">Срок годности</td>
                                <td class="text-end fw-bold pt-3">${item.exp}</td>
                            </tr>
                        </table>
                        <h3 class="mt-4 fw-bold" style="color: #004077;">${item.price}</h3>
                    </div>
                </div>
            </div>
        `);
    }

    _renderError(root) {
        const loading = document.getElementById('product-loading');
        if (loading) loading.remove();

        root.insertAdjacentHTML('beforeend', `
            <div class="state-block error mt-3">
                <i class="bi bi-exclamation-triangle"></i>
                <div>Карточка не найдена или сервер недоступен.</div>
            </div>
        `);
    }
}
