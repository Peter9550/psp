import { ProductCardComponent } from "../../components/product-card/index.js";
import { ProductPage } from "../product/index.js";
import { Ajax } from "../../modules/ajax.js";
import { Urls } from "../../modules/stockUrls.js";

export class MainPage {
    constructor(parent) {
        this.parent = parent;
        this.filter = "";
        this._debounce = null;
    }

    renderGrid() {
        const grid = document.getElementById('products-grid');
        const counter = document.getElementById('products-counter');
        if (!grid) return;

        grid.innerHTML = `
            <div class="col-12 state-block">
                <i class="bi bi-arrow-clockwise spinner-icon"></i>
                <div>Загрузка карточек...</div>
            </div>`;
        if (counter) counter.textContent = '';

        const url = this.filter ? Urls.productsByTitle(this.filter) : Urls.products();
        const self = this;

        Ajax.get(
            url,
            function (response) {
                self._renderProducts(response.data);
            },
            function (err) {
                console.error('Не удалось загрузить карточки', err);
                grid.innerHTML = `
                    <div class="col-12 state-block error">
                        <i class="bi bi-exclamation-triangle"></i>
                        <div>Сервер недоступен.</div>
                        <small class="text-muted">Проверь, что бэкенд запущен на <code>http://localhost:3000</code></small>
                    </div>`;
            }
        );
    }

    _renderProducts(data) {
        const grid = document.getElementById('products-grid');
        const counter = document.getElementById('products-counter');
        if (!grid) return;

        const products = Array.isArray(data) ? data : [];

        if (counter) {
            counter.textContent = this.filter
                ? `Найдено по запросу «${this.filter}»: ${products.length}`
                : `Всего карточек: ${products.length}`;
        }

        grid.innerHTML = '';
        if (products.length === 0) {
            grid.innerHTML = `
                <div class="col-12 state-block">
                    <i class="bi bi-search"></i>
                    <div>Ничего не найдено</div>
                </div>`;
            return;
        }

        const self = this;
        products.forEach(function (item) {
            new ProductCardComponent(grid).render(
                item,
                function (id) { new ProductPage(self.parent, id).render(); },
                function (id) { self.deleteProduct(id); }
            );
        });
    }

    deleteProduct(id) {
        const self = this;
        Ajax.delete(
            Urls.product(id),
            function () {
                self.renderGrid();
            },
            function (err) {
                console.error(err);
                alert('Не удалось удалить карточку: ' + (err.statusText || 'сетевая ошибка'));
            }
        );
    }

    render() {
        this.parent.innerHTML = `
            <div class="container py-5">
                <div class="row align-items-center mb-4 g-4">
                    <div class="col-md-6 logo-box text-center text-md-start">
                        <div class="mgtu-badge mb-3">МГТУ</div>
                        <h1>БУФЕТ<br>МГТУ им. Баумана</h1>
                    </div>
                    <div class="col-md-6 filter-wrapper">
                        <div class="input-group input-group-lg">
                            <span class="input-group-text">
                                <i class="bi bi-search" style="color: #004077;"></i>
                            </span>
                            <input id="filter-input" type="text"
                                   class="form-control"
                                   placeholder="Поиск по названию..."
                                   value="${this.filter.replace(/"/g, '&quot;')}">
                        </div>
                        <div id="products-counter" class="mt-2 small text-muted text-md-end"></div>
                    </div>
                </div>
                <div class="row" id="products-grid"></div>
            </div>
        `;

        const input = document.getElementById('filter-input');
        const self = this;
        input.addEventListener('input', function (e) {
            self.filter = e.target.value.trim();
            clearTimeout(self._debounce);
            self._debounce = setTimeout(function () { self.renderGrid(); }, 300);
        });

        this.renderGrid();
    }
}
