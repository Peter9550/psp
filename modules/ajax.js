// ЛР6: вместо XMLHttpRequest используем fetch + async/await + try/catch
export class Ajax {
    static async request({ method, url, body }) {
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                throw {
                    status: response.status,
                    statusText: response.statusText,
                };
            }

            // 204 No Content (например, после DELETE) тела не имеет
            const data = response.status === 204 ? null : await response.json();
            return { status: response.status, data };
        } catch (e) {
            // прокидываем ошибку дальше — её ловит вызывающий код (pages/main, pages/product)
            throw e;
        }
    }

    static async get(url) {
        return Ajax.request({ method: 'GET', url });
    }

    static async post(url, body) {
        return Ajax.request({ method: 'POST', url, body });
    }

    static async patch(url, body) {
        return Ajax.request({ method: 'PATCH', url, body });
    }

    static async delete(url) {
        return Ajax.request({ method: 'DELETE', url });
    }
}
