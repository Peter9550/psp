export class BadgeComponent {
    constructor(parent) {
        this.parent = parent;
    }

    getHTML(text, color = 'primary') {
        return `<span class="badge bg-${color} mb-2 me-1">${text}</span>`;
    }

    render(text, color) {
        const html = this.getHTML(text, color);
        this.parent.insertAdjacentHTML('beforeend', html);
    }
}
