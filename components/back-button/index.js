export class BackButtonComponent {
    constructor(parent) {
        this.parent = parent;
    }
    addListeners(listener) {
        document.getElementById("back-btn").addEventListener("click", listener);
    }
    render(listener) {
        this.parent.insertAdjacentHTML('beforeend', `
            <button id="back-btn" class="btn btn-link text-decoration-none p-0 mb-4" style="color: #004077;">
                <i class="bi bi-chevron-left"></i> Назад
            </button>
        `);
        this.addListeners(listener);
    }
}
