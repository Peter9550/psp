export class ProductCardComponent {
    constructor(parent) { this.parent = parent; }
    render(data, listener) {
        this.parent.insertAdjacentHTML('beforeend', `
            <div class="card product-card m-3" id="card-${data.id}" style="width: 17rem; cursor: pointer;">
                <img src="${data.src}" class="card-img-top" style="height: 180px;">
                <div class="card-body">
                    <h6 class="text-muted small mb-1 uppercase">${data.category}</h6>
                    <h5 class="card-title mb-3" style="color: #004077; font-weight: 700;">${data.title}</h5>
                    <div class="d-flex justify-content-between align-items-center mt-4">
                        <span class="fw-bold" style="font-size: 1.2rem;">${data.price}</span>
                        <i class="bi bi-plus-circle-fill" style="color: #004077; font-size: 1.5rem;"></i>
                    </div>
                </div>
            </div>
        `);
        document.getElementById(`card-${data.id}`).addEventListener("click", listener);
    }
}
