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

    async renderGrid() {
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
        let products;
        try {
            const { data } = await Ajax.get(url);
            products = Array.isArray(data) ? data : [];
        } catch (e) {
            console.error('Не удалось загрузить карточки', e);
            grid.innerHTML = `
                <div class="col-12 state-block error">
                    <i class="bi bi-exclamation-triangle"></i>
                    <div>Сервер недоступен.</div>
                    <small class="text-muted">Проверь, что бэкенд запущен на <code>http://localhost:3000</code></small>
                </div>`;
            return;
        }

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

        products.forEach(item => {
            new ProductCardComponent(grid).render(
                item,
                (id) => new ProductPage(this.parent, id).render(),
                (id) => this.deleteProduct(id)
            );
        });
    }

    async deleteProduct(id) {
        try {
            await Ajax.delete(Urls.product(id));
            await this.renderGrid();
        } catch (e) {
            console.error(e);
            alert('Не удалось удалить карточку: ' + (e.statusText || 'сетевая ошибка'));
        }
    }

    async render() {
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
        input.addEventListener('input', (e) => {
            this.filter = e.target.value.trim();
            clearTimeout(this._debounce);
            this._debounce = setTimeout(() => this.renderGrid(), 300);
        });

        await this.renderGrid();
    }
}
