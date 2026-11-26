import Car from './src/car.js';
import Part from './src/part.js';
import { loadCars, saveCars } from './src/storage.js';
import { formatNumber } from './src/utils.js';

const carList = document.getElementById('car-list');
const addCarBtn = document.getElementById('car-add-btn');
const partsGrid = document.getElementById('parts-grid');
const addPartBtn = document.getElementById('part-add-btn');
const partsTitle = document.getElementById('parts-title');

const carDialog = document.getElementById('car-dialog');
const partDialog = document.getElementById('part-dialog');
const carForm = document.getElementById('car-form');
const partForm = document.getElementById('part-form');
const partError = document.getElementById('part-error');

const LEVEL_LABELS = {
    ok: 'В норме',
    warn: 'Скоро замена',
    danger: 'Требуется замена',
};

const storedCars = loadCars();
let cars = storedCars ?? starterCars();
let selectedId = cars[0]?.id ?? null;

function starterCars() {
    const monthsAgo = (months) => {
        const date = new Date();
        date.setMonth(date.getMonth() - months);
        return date.toISOString().slice(0, 10);
    };

    const part = (name, mileageLimit, timeLimit, usedKm, usedMonths) => new Part({
        name,
        mileageLimit,
        timeLimit,
        replacedAtMileage: 124500 - usedKm,
        replacedAtDate: monthsAgo(usedMonths),
    });

    return [new Car({
        id: '1',
        govId: 'A816OK 161',
        brand: 'Renault',
        model: 'Sandero Stepway I',
        name: 'Ласточка',
        mileage: 124500,
        parts: [
            part('Масло в ДВС (5W-40)', 10000, 12, 2000, 6),
            part('Масляный фильтр', 10000, 12, 2000, 6),
            part('Воздушный фильтр', 30000, 24, 15000, 12),
            part('Салонный фильтр', 20000, 12, 17000, 11),
            part('Передние тормозные колодки', 40000, 24, 20000, 18),
            part('Комплект ГРМ и помпа', 100000, 60, 60000, 36),
            part('Свечи зажигания', 40000, 24, 30000, 12),
        ],
    })];
}

function getSelectedCar() {
    return cars.find((car) => car.id === selectedId) ?? null;
}

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function commit() {
    saveCars(cars);
    render();
}

function render() {
    renderCars();
    renderParts();
}

function renderCars() {
    carList.querySelectorAll('.car-card, .empty-state').forEach((node) => node.remove());

    if (!cars.length) {
        carList.insertBefore(element('p', 'empty-state', 'У Вас еще нет автомобилей — добавьте первый'), addCarBtn);
        return;
    }

    cars.forEach((car) => {
        const card = element('article', 'car-card');
        card.dataset.id = car.id;
        if (car.id === selectedId) card.classList.add('car-card--active');

        const info = element('div', 'car-card__info');
        info.append(element('span', 'car-card__gov-id', car.govId || '—'));
        info.append(element('h2', 'car-card__model', car.fullModel));

        if (car.name) info.append(element('p', 'car-card__name', car.name));

        const mileageLabel = element('label', 'car-card__mileage');
        mileageLabel.append(element('span', 'car-card__mileage-label', 'Пробег'));

        const mileageField = element('span', 'car-card__mileage-field');
        const mileageInput = element('input', 'car-card__mileage-input');
        mileageInput.type = 'number';
        mileageInput.min = '0';
        mileageInput.step = '1';
        mileageInput.value = String(car.mileage);
        mileageField.append(mileageInput, element('span', 'car-card__mileage-unit', 'км'));
        mileageLabel.append(mileageField);
        info.append(mileageLabel);

        const deleteBtn = element('button', 'car-card__delete', '×');
        deleteBtn.type = 'button';
        deleteBtn.title = 'Удалить автомобиль';
        deleteBtn.setAttribute('aria-label', 'Удалить автомобиль');

        card.append(element('div', 'car-card__image-placeholder'), info, deleteBtn);
        carList.insertBefore(card, addCarBtn);
    });
}

function renderParts() {
    partsGrid.querySelectorAll('.part-card, .empty-state').forEach((node) => node.remove());

    const car = getSelectedCar();
    partsTitle.textContent = car ? `Запчасти · ${car.fullModel}` : 'Запчасти';

    if (!car) {
        partsGrid.insertBefore(element('p', 'empty-state', 'Добавьте автомобиль, чтобы вести список деталей'), addPartBtn);
        return;
    }

    if (!car.parts.length) {
        partsGrid.insertBefore(element('p', 'empty-state', 'Для этого автомобиля пока нет деталей'), addPartBtn);
        return;
    }

    car.parts.forEach((part) => {
        const status = part.getStatus(car.mileage);
        const card = element('article', 'part-card');
        card.dataset.id = part.id;

        const indicator = element('span', `part-card__indicator part-card__indicator--${status.level}`);
        indicator.title = LEVEL_LABELS[status.level];
        indicator.setAttribute('aria-label', `Состояние: ${LEVEL_LABELS[status.level]}`);

        const progress = element('progress', `part-card__progress part-card__progress--${status.level}`);
        progress.max = 100;
        progress.value = status.health;

        const metrics = element('dl', 'part-card__metrics');
        metrics.append(
            metric('Пробег', status.mileageLeft === null ? '—' : `${formatNumber(status.mileageLeft)} км`),
            metric('Время', status.monthsLeft === null ? '—' : `${formatNumber(status.monthsLeft)} мес.`),
        );

        const replaceBtn = element('button', 'part-card__replace', 'Заменить');
        replaceBtn.type = 'button';
        replaceBtn.dataset.action = 'replace';
        replaceBtn.title = 'Отметить замену';

        const deleteBtn = element('button', 'part-card__delete', '×');
        deleteBtn.type = 'button';
        deleteBtn.dataset.action = 'delete';
        deleteBtn.title = 'Удалить деталь';
        deleteBtn.setAttribute('aria-label', 'Удалить деталь');

        const actions = element('div', 'part-card__actions');
        actions.append(replaceBtn, deleteBtn);

        card.append(indicator, element('h3', 'part-card__name', part.name), progress, metrics, actions);
        partsGrid.insertBefore(card, addPartBtn);
    });
}

function metric(label, value) {
    const wrapper = element('div', 'part-card__metric');
    wrapper.append(element('dt', '', label), element('dd', '', value));
    return wrapper;
}

carList.addEventListener('click', (event) => {
    const card = event.target.closest('.car-card');
    if (!card) return;

    if (event.target.closest('.car-card__delete')) {
        const car = cars.find((item) => item.id === card.dataset.id);
        if (!car || !confirm(`Удалить ${car.fullModel}?`)) return;

        cars = cars.filter((item) => item.id !== car.id);
        if (selectedId === car.id) selectedId = cars[0]?.id ?? null;
        commit();
        return;
    }

    if (event.target.closest('input')) return;
    selectedId = card.dataset.id;
    render();
});

carList.addEventListener('change', (event) => {
    if (!event.target.matches('.car-card__mileage-input')) return;

    const car = cars.find((item) => item.id === event.target.closest('.car-card')?.dataset.id);
    if (!car) return;

    car.updateMileage(event.target.value);
    event.target.value = String(car.mileage);
    commit();
});

partsGrid.addEventListener('click', (event) => {
    const card = event.target.closest('.part-card');
    if (!card) return;

    const action = event.target.closest('button')?.dataset.action;
    const part = getSelectedCar()?.parts.find((item) => item.id === card.dataset.id);
    if (!action || !part) return;

    if (action === 'replace') {
        part.replace(getSelectedCar().mileage);
    } else if (action === 'delete') {
        if (!confirm(`Удалить «${part.name}»?`)) return;
        getSelectedCar().removePart(part.id);
    }

    commit();
});

document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => button.closest('dialog').close());
});

[carDialog, partDialog].forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => dialog.querySelector('form').reset());
});

partDialog.addEventListener('close', () => {
    partError.hidden = true;
});

addCarBtn.addEventListener('click', () => carDialog.showModal());

addPartBtn.addEventListener('click', () => {
    const car = getSelectedCar();
    if (!car) {
        alert('Сначала добавьте автомобиль');
        return;
    }

    partForm.elements.replacedAtMileage.value = car.mileage;
    partForm.elements.replacedAtDate.value = new Date().toISOString().slice(0, 10);
    partDialog.showModal();
});

carForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const car = new Car(Object.fromEntries(new FormData(carForm)));
    cars.push(car);
    selectedId = car.id;
    commit();
    carDialog.close();
});

partForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(partForm));

    if (!Number(data.mileageLimit) && !Number(data.timeLimit)) {
        partError.hidden = false;
        return;
    }

    getSelectedCar().addPart(new Part(data));
    commit();
    partDialog.close();
});

if (!storedCars) saveCars(cars);
render();
