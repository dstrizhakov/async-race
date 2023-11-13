import carTemplate from './data/carTemplate';
import { carBrands } from './data/carBrands';
import { Query, ICarData, Cars, IApp, IGarage, RaceEvent, Winner } from './types';
import { getRandomColor } from './utils/getRandomColor';
import getRandomName from './utils/getRandomElement';
import { Car } from './Car';
import { carModels } from './data/carModels';

export class Garage implements IGarage {
    private page: number;

    private limit: number;

    private total: number;

    private selectedCarId: number;

    public app: IApp;

    public cars: Car[];

    public currentCars: Car[];

    public winner: Winner | null;

    public carWinner: Car | null;

    constructor(app: IApp) {
        this.app = app;
        this.page = 1;
        this.limit = 7;
        this.total = 1;
        this.selectedCarId = 1;
        this.cars = [];
        this.currentCars = [];
        this.winner = null;
        this.carWinner = null;
    }

    public async init() {
        // получаем с сервера все Cars и создаем массив инстансов
        await this.getCars({}).then((cars: Cars) => {
            this.cars = [];
            cars.items.forEach((car) => {
                const { id, color, name } = car;
                this.cars.unshift(new Car(id, color, name, this.app.eventEmitter));
            });
        });
    }

    public renderPage() {
        const main = document.querySelector('main') as HTMLElement;
        const storedPage = Number(localStorage.getItem('garagePage'));
        main.innerHTML = '';
        const race = document.createElement('div');
        race.classList.add('race');
        race.innerHTML = this.app.html.race;
        main.append(race);
        this.page = storedPage || 1;

        const updateNameInput = document.getElementById('update-name') as HTMLInputElement;
        const updateColorInput = document.getElementById('update-color') as HTMLInputElement;
        const updateButton = document.getElementById('update-button') as HTMLButtonElement;
        updateNameInput.setAttribute('disabled', '');
        updateColorInput.setAttribute('disabled', '');
        updateNameInput.value = '';
        updateColorInput.value = '';
        updateButton.setAttribute('disabled', '');

        const createColorInput = document.getElementById('create-color') as HTMLInputElement;
        const createNameInput = document.getElementById('create-name') as HTMLInputElement;
        createColorInput.value = getRandomColor();
        createNameInput.value = `${getRandomName(carBrands)} ${getRandomName(carModels)}`;

        const totalCars = document.getElementById('total-cars') as HTMLElement;
        totalCars.innerText = this.cars.length.toString();
        this.total = Number(this.cars.length);

        const start = (this.page - 1) * this.limit;
        const end = start + this.limit;
        const currentCars = this.cars.slice(start, end);
        this.currentCars = currentCars;
        currentCars.forEach((carInstance) => {
            carInstance.render();
        });

        document.body.addEventListener('click', this.listener);
        const paginationSpan = document.getElementById('pagination-page') as HTMLElement;
        paginationSpan.innerText = `${this.page.toString()} / ${Math.ceil(this.total / this.limit)}`;
    }

    public async render() {
        await this.init();
        this.renderPage();
    }

    public listener = (event: MouseEvent): void => {
        const target = event.target as HTMLElement;
        const id = Number(target.dataset.id);
        if (target.closest('.button__create')) {
            this.createCar();
        } else if (target.closest('.button__update')) {
            this.updateCar();
        } else if (target.closest('.button__race')) {
            this.raceAll();
        } else if (target.closest('.button__reset')) {
            this.resetAll();
        } else if (target.closest('.button__generate')) {
            this.generateCars();
        } else if (target.closest('.button__select')) {
            if (Number.isNaN(id)) return;
            this.selectCar(id);
        } else if (target.closest('.button__remove') && !Number.isNaN(id)) {
            this.deleteCar(id);
            this.render();
        } else if (target.closest('.pagination__next') && Math.ceil(this.total / this.limit) > this.page) {
            this.page += 1;
            localStorage.setItem('garagePage', this.page.toString());
            this.renderPage();
        } else if (target.closest('.pagination__prev') && this.page > 0) {
            this.page -= 1;
            localStorage.setItem('garagePage', this.page.toString());
            this.renderPage();
        }
    };

    public renderCars(cars: Car[]): void {
        const garageContent = document.getElementById('race-content') as HTMLElement;
        garageContent.innerHTML = '';
        cars.forEach((car: Car) => {
            const carElement = document.createElement('div');
            carElement.classList.add('race__car');
            carElement.classList.add('car');
            carElement.setAttribute('data-id', car.id.toString());
            const currentCarTemplate = carTemplate(car.color, car.name, car.id);
            carElement.innerHTML = currentCarTemplate;
            garageContent.append(carElement);
        });
    }

    public selectCar(id: number) {
        this.getCar(id).then((response) => {
            const updateNameInput = document.getElementById('update-name') as HTMLInputElement;
            const updateColorInput = document.getElementById('update-color') as HTMLInputElement;
            const updateButton = document.getElementById('update-button') as HTMLButtonElement;
            updateNameInput.value = response.name;
            updateColorInput.value = response.color;
            updateNameInput.removeAttribute('disabled');
            updateColorInput.removeAttribute('disabled');
            updateButton.removeAttribute('disabled');
            this.selectedCarId = id;
        });
    }

    public getCars(params: Partial<Query>): Promise<Cars> {
        return this.app.api.getPage('garage', params);
    }

    private getCar(id: number): Promise<ICarData> {
        return this.app.api.get(`garage/${id}`);
    }

    private registerWinner() {
        if (this.winner !== null) {
            this.app.score.addWinner(this.winner);
            // this.app.api.post<Winner>('winners', {
            //     id: this.winner.id,
            //     wins: 1,
            //     time: this.winner.time,
            // });
            const winnerHeading = document.getElementById('race-winner') as HTMLElement;
            winnerHeading.innerText = `${this.carWinner?.name} is win!!! Time ${this.winner?.time}`;
        }
    }

    private async raceAll() {
        const promises = this.currentCars.map((car) => car.race());
        await Promise.all(promises).then(() => {
            const buttonRaceElement = document.querySelector('.button__race') as HTMLButtonElement;
            buttonRaceElement.setAttribute('disabled', '');
            const buttonResetElement = document.querySelector('.button__reset') as HTMLButtonElement;
            buttonResetElement.removeAttribute('disabled');
            const buttonCreateElement = document.querySelector('.button__create') as HTMLButtonElement;
            buttonCreateElement.setAttribute('disabled', '');
            const buttongenerateElement = document.querySelector('.button__generate') as HTMLButtonElement;
            buttongenerateElement.setAttribute('disabled', '');
        });

        const currentListener = (event: RaceEvent) => {
            if (!event.isBroken) {
                this.app.eventEmitter.clearListeners();
                [this.carWinner] = this.currentCars.filter((car) => car.id === event.id);
                this.winner = {
                    id: event.id,
                    wins: 1,
                    time: +(event.time / 1000).toFixed(2),
                };
                this.registerWinner();
            }
        };

        this.app.eventEmitter.addListener(currentListener);
    }

    private async resetAll() {
        const promises = this.currentCars.map((car) => car.reset());
        await Promise.all(promises).then(() => {
            const buttonRaceElement = document.querySelector('.button__race') as HTMLButtonElement;
            buttonRaceElement.removeAttribute('disabled');
            const buttonResetElement = document.querySelector('.button__reset') as HTMLButtonElement;
            buttonResetElement.setAttribute('disabled', '');
            const buttonCreateElement = document.querySelector('.button__create') as HTMLButtonElement;
            buttonCreateElement.removeAttribute('disabled');
            const buttongenerateElement = document.querySelector('.button__generate') as HTMLButtonElement;
            buttongenerateElement.removeAttribute('disabled');
        });
    }

    private createCar() {
        const createNameInput = document.getElementById('create-name') as HTMLInputElement;
        const createColorInput = document.getElementById('create-color') as HTMLInputElement;
        const name = createNameInput.value;
        const color = createColorInput.value;
        this.app.api
            .post('garage', {
                name: name || 'Some car',
                color,
            })
            .then(() => {
                this.render();
            });
    }

    private async generateCars() {
        const promisesArray = [];
        for (let i = 0; i < 100; i += 1) {
            promisesArray.push(
                this.app.api.post('garage', {
                    name: `${getRandomName(carBrands)} ${getRandomName(carModels)}`,
                    color: getRandomColor(),
                })
            );
        }
        await Promise.all(promisesArray);
        this.render();
    }

    public async deleteCar(id: number) {
        try {
            await this.app.api.delete('garage', id);
            await this.app.api.delete('winners', id);
        } catch (error) {
            console.error('Error while deleting a car:', error);
        }
    }

    private updateCar() {
        const updateNameInput = document.getElementById('update-name') as HTMLInputElement;
        const updateColorInput = document.getElementById('update-color') as HTMLInputElement;

        this.app.api
            .put(`garage/${this.selectedCarId}`, { name: updateNameInput.value, color: updateColorInput.value })
            .then(() => {
                this.render();
            });
    }
}
