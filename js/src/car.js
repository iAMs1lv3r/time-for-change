import Part from './part.js';
import { createId } from './utils.js';

export default class Car {
    constructor({ id, govId, brand, model, name, mileage, parts = [] } = {}) {
        this.id = id ?? createId();
        this.govId = govId ?? '';
        this.brand = brand ?? '';
        this.model = model ?? '';
        this.name = name ?? '';
        this.mileage = Math.max(0, Number(mileage) || 0);
        this.parts = parts.map((part) => (part instanceof Part ? part : new Part(part)));
    }

    get fullModel() {
        return [this.brand, this.model].filter(Boolean).join(' ');
    }

    addPart(part) {
        this.parts.push(part);
    }

    removePart(id) {
        this.parts = this.parts.filter((part) => part.id !== id);
    }

    updateMileage(mileage) {
        this.mileage = Math.max(0, Number(mileage) || 0);
    }
}
