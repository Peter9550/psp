// ЛР6, часть 2: сборка фронтенда через Vite
// Билд кладётся в ./public, эта папка потом копируется в example-express/public/
export default {
    build: {
        outDir: './public',
        emptyOutDir: true,
    },
};
