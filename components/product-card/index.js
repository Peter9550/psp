function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export class ProductCardComponent {
    constructor(parent) { this.parent = parent; }

    render(data, onClick, onDelete) {
        const titleHtml = escapeHtml(data.title);

        this.parent.insertAdjacentHTML('beforeend', `
            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4">
                <div class="card product-card position-relative h-100" id="card-${data.id}">
                    <button class="delete-btn" id="delete-${data.id}" title="Удалить">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="img-box" id="imgbox-${data.id}">
                        <img src="${escapeHtml(data.src)}" alt="${titleHtml}"
                             onerror="this.classList.add('img-failed');this.parentNode.classList.add('img-fallback-active');">
                        <div class="img-fallback-text">${titleHtml}</div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${titleHtml}</h5>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="price">${escapeHtml(data.price)}</span>
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
