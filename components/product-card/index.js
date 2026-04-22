import {BadgeComponent} from "../badge/index.js";

export class ProductCardComponent {
    constructor(parent) {
        this.parent = parent;
    }

    getHTML(data) {
        return `
            <div class="card shadow-sm" style="width: 18rem; margin: 15px; border-radius: 10px; overflow: hidden;">
                <img class="card-img-top" src="${data.src}" alt="${data.title}" style="height: 200px; object-fit: cover;">
                <div class="card-body" id="card-body-${data.id}">
                    <h5 class="card-title">${data.title}</h5>
                    <p class="card-text text-muted" style="font-size: 0.9rem;">${data.text}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <button class="btn btn-outline-primary btn-sm" id="click-card-${data.id}" data-id="${data.id}">Просмотр</button>
                    </div>
                </div>
            </div>
        `;
    }

    addListeners(data, listener) {
        document.getElementById(`click-card-${data.id}`).addEventListener("click", listener);
    }

    render(data, listener) {
        const html = this.getHTML(data);
        this.parent.insertAdjacentHTML('beforeend', html);

        const cardBody = document.getElementById(`card-body-${data.id}`);
        const badgeContainer = new BadgeComponent(cardBody);

        // Рисуем два значка: категорию и цену
        badgeContainer.render(data.category, 'primary');
        badgeContainer.render(data.price, 'secondary');

        this.addListeners(data, listener);
    }
}
