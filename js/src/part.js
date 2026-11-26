import { createId } from './utils.js';

const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

export default class Part {
    constructor({ id, name, mileageLimit, timeLimit, replacedAtMileage, replacedAtDate } = {}) {
        this.id = id ?? createId();
        this.name = name ?? 'Новая деталь';
        this.mileageLimit = Math.max(0, Number(mileageLimit) || 0);
        this.timeLimit = Math.max(0, Number(timeLimit) || 0);
        this.replacedAtMileage = Math.max(0, Number(replacedAtMileage) || 0);
        this.replacedAtDate = replacedAtDate || new Date().toISOString().slice(0, 10);
    }

    getStatus(carMileage) {
        const usedKm = Math.max(0, Number(carMileage) - this.replacedAtMileage);
        const replacedAt = new Date(this.replacedAtDate);
        const elapsed = Number.isFinite(replacedAt.getTime()) ? Date.now() - replacedAt.getTime() : 0;
        const usedMonths = Math.max(0, elapsed / MONTH_IN_MS);

        let mileageLeft = null;
        let monthsLeft = null;
        let health = 100;

        if (this.mileageLimit > 0) {
            mileageLeft = Math.max(0, this.mileageLimit - usedKm);
            health = Math.min(health, (mileageLeft / this.mileageLimit) * 100);
        }

        if (this.timeLimit > 0) {
            monthsLeft = Math.max(0, this.timeLimit - usedMonths);
            health = Math.min(health, (monthsLeft / this.timeLimit) * 100);
        }

        health = Math.round(Math.max(0, health));
        const level = health >= 50 ? 'ok' : health >= 20 ? 'warn' : 'danger';

        return { health, level, mileageLeft, monthsLeft };
    }

    replace(carMileage) {
        this.replacedAtMileage = Math.max(0, Number(carMileage) || 0);
        this.replacedAtDate = new Date().toISOString().slice(0, 10);
    }
}
