export class BadgeComponent {
    constructor(parent) {
        this.parent = parent;
    }
    getHTML(text, color = 'primary') {
        return `<span class="badge rounded-pill bg-${color} mb-2 me-1" style="font-weight: 500; padding: 5px 12px;">${text}</span>`;
    }
    render(text, color) {
        this.parent.insertAdjacentHTML('beforeend', this.getHTML(text, color));
    }
}
