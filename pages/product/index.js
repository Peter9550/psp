import { BackButtonComponent } from "../../components/back-button/index.js";
import { MainPage } from "../main/index.js";
import { Ajax } from "../../modules/ajax.js";
import { Urls } from "../../modules/stockUrls.js";
import { saveWithTimeout, saveImmediate, saveAfterDelayed, hasPendingDelayed } from "../../modules/priceScheduler.js";

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

                        <div class="d-flex align-items-center justify-content-between mt-4">
                            <h3 class="fw-bold m-0" id="price-display" style="color: #004077;">${item.price}</h3>
                            <button class="btn btn-sm btn-outline-primary" id="edit-price-btn">
                                <i class="bi bi-pencil"></i> Изменить
                            </button>
                        </div>

                        <div id="edit-form" class="mt-3" style="display: none;">
                            <label class="form-label small text-muted">Новая цена</label>
                            <input type="text" class="form-control mb-3" id="new-price-input" placeholder="Например: 70 ₽">

                            <div class="d-grid gap-2">
                                <button class="btn btn-warning" id="save-timeout">
                                    <i class="bi bi-clock"></i> Сохранить через 15 секунд (режим 1)
                                </button>
                                <button class="btn btn-success" id="save-immediate">
                                    <i class="bi bi-lightning"></i> Сохранить сразу (режим 2)
                                </button>
                                <button class="btn btn-info" id="save-after">
                                    <i class="bi bi-link-45deg"></i> Сохранить после режима 1 (режим 3)
                                </button>
                                <button class="btn btn-link" id="cancel-edit">Отмена</button>
                            </div>

                            <div id="edit-status" class="mt-3 small fw-bold"></div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        this._wireEditForm(item);
    }

    _wireEditForm(item) {
        const editBtn   = document.getElementById('edit-price-btn');
        const editForm  = document.getElementById('edit-form');
        const cancelBtn = document.getElementById('cancel-edit');
        const input     = document.getElementById('new-price-input');
        const statusEl  = document.getElementById('edit-status');

        function setStatus(msg, color) {
            statusEl.textContent = msg;
            statusEl.style.color = color || '#198754';
        }

        function readPrice() {
            const val = input.value.trim();
            if (!val) {
                setStatus('Введите цену', '#dc3545');
                return null;
            }
            return val;
        }

        editBtn.addEventListener('click', function () {
            editForm.style.display = 'block';
            input.value = item.price;
            input.focus();
            input.select();
            statusEl.textContent = '';
        });

        cancelBtn.addEventListener('click', function () {
            editForm.style.display = 'none';
            statusEl.textContent = '';
        });

        // === Режим 1: с задержкой 15 секунд ===
        document.getElementById('save-timeout').addEventListener('click', function () {
            const price = readPrice();
            if (price === null) return;
            setStatus('Режим 1: PATCH запланирован через 15 секунд... (можешь выйти из карточки)', '#fd7e14');
            saveWithTimeout(item.id, price,
                function () { setStatus('Режим 1: PATCH успешно выполнен ✓', '#198754'); },
                function (err) { setStatus('Режим 1: ошибка — ' + (err.statusText || 'сеть'), '#dc3545'); }
            );
        });

        // === Режим 2: моментально ===
        document.getElementById('save-immediate').addEventListener('click', function () {
            const price = readPrice();
            if (price === null) return;
            setStatus('Режим 2: PATCH отправлен...', '#fd7e14');
            saveImmediate(item.id, price,
                function () { setStatus('Режим 2: цена обновлена сразу ✓', '#198754'); },
                function (err) { setStatus('Режим 2: ошибка — ' + (err.statusText || 'сеть'), '#dc3545'); }
            );
        });

        // === Режим 3: после завершения отложенного (режим 1) ===
        document.getElementById('save-after').addEventListener('click', function () {
            const price = readPrice();
            if (price === null) return;
            if (hasPendingDelayed()) {
                setStatus('Режим 3: жду завершения режима 1...', '#fd7e14');
            } else {
                setStatus('Режим 3: нет активного отложенного — PATCH ушёл сразу', '#fd7e14');
            }
            saveAfterDelayed(item.id, price,
                function () { setStatus('Режим 3: PATCH выполнен ✓', '#198754'); },
                function (err) { setStatus('Режим 3: ошибка — ' + (err.statusText || 'сеть'), '#dc3545'); }
            );
        });
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
