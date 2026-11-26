import Car from './car.js';
import Part from './part.js';

const STORAGE_KEY = 'time-for-change:cars';

export function loadCars() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    return JSON.parse(saved).map((data) => new Car({
        ...data,
        parts: data.parts.map((part) => new Part(part)),
    }));
}

export function saveCars(cars) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}
