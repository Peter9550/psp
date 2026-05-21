// Планировщик PATCH-запросов для демонстрации асинхронности (доп задание к ЛР5).
// Три режима отправки одного и того же запроса «изменить цену»:
//   1. saveWithTimeout    — PATCH улетит через 15 секунд
//   2. saveImmediate      — PATCH улетит сразу
//   3. saveAfterDelayed   — PATCH улетит, когда завершится отложенный (режим 1)
//
// Если в момент вызова режима 3 нет активного отложенного запроса — он уходит сразу.
// Реализация на чистых колбэках (без Promise, чтобы соответствовать ЛР5).

import { Ajax } from "./ajax.js";
import { Urls } from "./stockUrls.js";

// Указатель на активный отложенный (режим 1) запрос.
// null — если ничего не запланировано.
// Структура: { done: boolean, listeners: [callback, ...] }
let pendingDelayed = null;

function patchPrice(id, price, onSuccess, onError) {
    Ajax.patch(
        Urls.product(id),
        { price: price },
        function (response) { if (onSuccess) onSuccess(response); },
        function (err)      { if (onError)   onError(err); }
    );
}

function fireListeners(ticket) {
    const cbs = ticket.listeners;
    ticket.listeners = [];
    for (let i = 0; i < cbs.length; i++) {
        try { cbs[i](); }
        catch (e) { console.error('Ошибка в зависимом колбэке:', e); }
    }
}

// === Режим 1: с задержкой 15 секунд ===
export function saveWithTimeout(id, price, onSuccess, onError) {
    const ticket = { done: false, listeners: [] };
    pendingDelayed = ticket;
    const DELAY_MS = 15000;

    console.log(`[priceScheduler] Режим 1: PATCH запланирован через ${DELAY_MS / 1000}с (id=${id}, price=${price})`);

    setTimeout(function () {
        console.log(`[priceScheduler] Режим 1: PATCH уходит сейчас (id=${id})`);
        patchPrice(id, price,
            function (resp) {
                ticket.done = true;
                console.log(`[priceScheduler] Режим 1: PATCH успешно завершён (id=${id})`);
                fireListeners(ticket);
                if (onSuccess) onSuccess(resp);
            },
            function (err) {
                ticket.done = true;
                console.warn(`[priceScheduler] Режим 1: PATCH упал (id=${id})`, err);
                fireListeners(ticket); // зависимых всё равно отпускаем
                if (onError) onError(err);
            }
        );
    }, DELAY_MS);
}

// === Режим 2: сразу ===
export function saveImmediate(id, price, onSuccess, onError) {
    console.log(`[priceScheduler] Режим 2: PATCH уходит сразу (id=${id}, price=${price})`);
    patchPrice(id, price, onSuccess, onError);
}

// === Режим 3: после завершения отложенного (режим 1) ===
export function saveAfterDelayed(id, price, onSuccess, onError) {
    if (pendingDelayed && !pendingDelayed.done) {
        console.log(`[priceScheduler] Режим 3: PATCH ждёт завершения отложенного (id=${id}, price=${price})`);
        pendingDelayed.listeners.push(function () {
            console.log(`[priceScheduler] Режим 3: отложенный завершён — отправляю PATCH (id=${id})`);
            patchPrice(id, price, onSuccess, onError);
        });
    } else {
        console.log(`[priceScheduler] Режим 3: нет активного отложенного, PATCH уходит сразу (id=${id}, price=${price})`);
        patchPrice(id, price, onSuccess, onError);
    }
}

// Утилита для UI: есть ли сейчас активный отложенный запрос
export function hasPendingDelayed() {
    return !!(pendingDelayed && !pendingDelayed.done);
}
