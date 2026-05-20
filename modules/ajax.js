export class Ajax {
    static request({ method, url, body }) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    let data = null;
                    if (xhr.responseText) {
                        try { data = JSON.parse(xhr.responseText); }
                        catch (_) { data = xhr.responseText; }
                    }
                    resolve({ status: xhr.status, data });
                } else {
                    reject({ status: xhr.status, statusText: xhr.statusText, response: xhr.responseText });
                }
            };

            xhr.onerror = () => reject(new Error('Сетевая ошибка'));

            xhr.send(body ? JSON.stringify(body) : null);
        });
    }

    static get(url) {
        return Ajax.request({ method: 'GET', url });
    }

    static post(url, body) {
        return Ajax.request({ method: 'POST', url, body });
    }

    static patch(url, body) {
        return Ajax.request({ method: 'PATCH', url, body });
    }

    static delete(url) {
        return Ajax.request({ method: 'DELETE', url });
    }
}
