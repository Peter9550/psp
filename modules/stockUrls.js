const BASE_URL = 'http://localhost:3000';

export const Urls = {
    products: () => `${BASE_URL}/products`,
    productsByTitle: (title) => `${BASE_URL}/products?title=${encodeURIComponent(title)}`,
    product: (id) => `${BASE_URL}/products/${id}`,
};
