// ЛР5: XMLHttpRequest + колбэки (без Promise, без async/await — это ЛР6)
export class Ajax {
    static request({ method, url, body }, onSuccess, onError) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                let data = null;
                if (xhr.responseText) {
                    try { data = JSON.parse(xhr.responseText); }
                    catch (_) { data = xhr.responseText; }
                }
                onSuccess({ status: xhr.status, data: data });
            } else {
                if (onError) {
                    onError({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        response: xhr.responseText
                    });
                }
            }
        };

        xhr.onerror = function () {
            if (onError) onError({ status: 0, statusText: 'Сетевая ошибка' });
        };

        xhr.send(body ? JSON.stringify(body) : null);
    }

    static get(url, onSuccess, onError) {
        Ajax.request({ method: 'GET', url: url }, onSuccess, onError);
    }

    static post(url, body, onSuccess, onError) {
        Ajax.request({ method: 'POST', url: url, body: body }, onSuccess, onError);
    }

    static patch(url, body, onSuccess, onError) {
        Ajax.request({ method: 'PATCH', url: url, body: body }, onSuccess, onError);
    }

    static delete(url, onSuccess, onError) {
        Ajax.request({ method: 'DELETE', url: url }, onSuccess, onError);
    }
}
