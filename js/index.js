const cars = document.getElementsByClassName('car-list')
const addCarBtn = document.getElementById('car-add-btn')
const addPartBtn = document.getElementById('part-add-btn')

addCarBtn.addEventListener('click', () => {
    alert('You\'ve just pressed a button to add a car');
});

addPartBtn.addEventListener('click', () => {
    alert('You\'ve just pressed a button to add a part');
});
