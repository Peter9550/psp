export class CarouselComponent {
    constructor(parent) {
        this.parent = parent;
    }

    getHTML(data) {
        const items = data.map((item, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}" data-bs-interval="5000">
                <img src="${item.src}" class="d-block w-100" alt="${item.title}">
                <div class="carousel-caption d-none d-md-block" style="background: rgba(0,64,119,0.7); border-radius: 10px; padding: 10px;">
                    <h5 class="m-0">${item.title}</h5>
                </div>
            </div>
        `).join('');

        return `
            <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">${items}</div>
                <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon"></span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon"></span>
                </button>
            </div>
        `;
    }

    render(data) {
        this.parent.innerHTML = this.getHTML(data);
    }
}
