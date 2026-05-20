export class ProductCardComponent {
    constructor(parent) { this.parent = parent; }

    render(data, onClick, onDelete) {
        const safeTitle = encodeURIComponent(data.title || 'Товар');
        const fallback = `https://placehold.co/600x400/004077/FFFFFF/png?text=${safeTitle}`;

        this.parent.insertAdjacentHTML('beforeend', `
            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4">
                <div class="card product-card position-relative h-100" id="card-${data.id}">
                    <button class="delete-btn" id="delete-${data.id}" title="Удалить">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="img-box">
                        <img src="${data.src}" alt="${data.title}"
                             onerror="this.onerror=null;this.src='${fallback}';">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${data.title}</h5>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="price">${data.price}</span>
                            <i class="bi bi-plus-circle-fill plus-icon"></i>
                        </div>
                    </div>
                </div>
            </div>
        `);
        document.getElementById(`card-${data.id}`).addEventListener("click", () => onClick(data.id));
        document.getElementById(`delete-${data.id}`).addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm(`Удалить «${data.title}»?`)) onDelete(data.id);
        });
    }
}
