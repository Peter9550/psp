export class CarouselComponent {
    constructor(parent) {
        this.parent = parent;
    }

    getHTML(data) {
        const slides = data.map((item, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}" data-bs-interval="5000" id="slide-${item.id}">
                <div class="carousel-card mx-auto" style="max-width: 500px; cursor: pointer;">
                    <img src="${item.src}" class="d-block w-100" alt="${item.title}">
                    <div class="p-4 text-center">
                        <h3 class="mb-3" style="font-weight: 700; color: #004077;">${item.title}</h3>
                        <span class="price-badge" style="background-color: #004077; color: white; padding: 8px 15px; border-radius: 10px; font-weight: 700;">${item.price}</span>
                        <p class="text-muted mt-3 small">Нажми, чтобы узнать подробнее</p>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div class="progress-container" style="height: 4px; width: 100%; background-color: rgba(0, 64, 119, 0.1); border-radius: 2px; margin-bottom: 20px; overflow: hidden;">
                <div id="carousel-progress" class="progress-bar-fill animating"></div>
            </div>

            <div id="buffetCarousel" class="carousel slide">
                <div class="carousel-inner">
                    ${slides}
                </div>

                <button class="carousel-control-prev" type="button" data-bs-target="#buffetCarousel" data-bs-slide="prev" style="width: 10%; z-index: 10;">
                    <span class="carousel-control-prev-icon" aria-hidden="true" style="filter: invert(1) grayscale(100) brightness(0.5); transform: scale(1.2);"></span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#buffetCarousel" data-bs-slide="next" style="width: 10%; z-index: 10;">
                    <span class="carousel-control-next-icon" aria-hidden="true" style="filter: invert(1) grayscale(100) brightness(0.5); transform: scale(1.2);"></span>
                </button>
            </div>
        `;
    }

    render(data, onCardClick) {
        this.parent.innerHTML = this.getHTML(data);

        const carouselEl = document.getElementById('buffetCarousel');
        const progressBar = document.getElementById('carousel-progress');

        // Инициализация карусели
        const carousel = new bootstrap.Carousel(carouselEl, {
            interval: 5000,
            ride: 'carousel',
            pause: false
        });

        // Клик по карточкам
        data.forEach(item => {
            const slide = document.getElementById(`slide-${item.id}`);
            slide.addEventListener('click', () => onCardClick(item.id));
        });

        // Обработка переключения (и авто, и по стрелкам)
        carouselEl.addEventListener('slide.bs.carousel', () => {
            // Мгновенный сброс полоски
            progressBar.classList.remove('animating');
            void progressBar.offsetWidth; // Магия для сброса анимации
            progressBar.classList.add('animating');
        });
    }
}
