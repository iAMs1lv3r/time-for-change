export function createId() {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function formatNumber(value) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(value));
}
