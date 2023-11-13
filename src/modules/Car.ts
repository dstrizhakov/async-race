import { Engine } from './Engine';
import carTemplate from './data/carTemplate';
import { IEngineStatus, IEngine, RaceEvent, EngineResponce, CarClass } from './types';
import { EventEmitter } from './EventEmitter';

export class Car implements CarClass {
    private engine: IEngine;

    private timeToFinish: number;

    private carElement: HTMLDivElement | null;

    public status: IEngineStatus;

    public animationId: number;

    public color: string;

    public name: string;

    constructor(public id: number, color: string, name: string, eventEmitter: EventEmitter<RaceEvent>) {
        this.carElement = null;
        this.id = id;
        this.engine = new Engine(id, eventEmitter);
        this.color = color;
        this.name = name;
        this.timeToFinish = 0;
        this.status = this.engine.status;
        this.animationId = 0;
    }

    public render() {
        const garageContent = document.getElementById('race-content') as HTMLElement;
        const carElement = document.createElement('div');
        carElement.classList.add('race__car');
        carElement.classList.add('car');
        carElement.setAttribute('data-id', this.id.toString());
        const currentCarTemplate = carTemplate(this.color, this.name, this.id);
        carElement.innerHTML = currentCarTemplate;
        garageContent.append(carElement);
        carElement.addEventListener('click', this.listener);
        this.carElement = carElement;

        const buttonStopElement = document.querySelector(`.button__back[data-id="${this.id}"]`) as HTMLButtonElement;
        buttonStopElement.setAttribute('disabled', '');
    }

    public listener = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.closest('.button__start')) {
            this.race();
        } else if (target.closest('.button__back')) {
            this.engine.stop().then(() => {
                cancelAnimationFrame(this.animationId);
                this.reset();
            });
        }
    };

    public async race() {
        if (this.carElement === null) return;
        await this.engine
            .start()
            .then(() => {
                this.timeToFinish = this.status.distance / this.status.velocity;
                this.engine.drive();

                const buttonElement = document.querySelector(
                    `.button__back[data-id="${this.id}"]`
                ) as HTMLButtonElement;
                buttonElement.removeAttribute('disabled');

                const buttonStartElement = document.querySelector(
                    `.button__start[data-id="${this.id}"]`
                ) as HTMLButtonElement;
                buttonStartElement.setAttribute('disabled', '');

                const buttonSelectElement = document.querySelector(
                    `.button__select[data-id="${this.id}"]`
                ) as HTMLButtonElement;
                buttonSelectElement.setAttribute('disabled', '');

                const buttonRemoveElement = document.querySelector(
                    `.button__remove[data-id="${this.id}"]`
                ) as HTMLButtonElement;
                buttonRemoveElement.setAttribute('disabled', '');
            })
            .then(() => {
                this.animate(this.timeToFinish);
            });
    }

    public async reset(): Promise<EngineResponce | undefined> {
        const res = await this.engine.stop();

        if (this.carElement !== null) {
            const element = this.carElement.querySelector(`#car-${this.id}`) as HTMLElement;

            cancelAnimationFrame(this.animationId);
            element.style.transform = `translateX(0px)`;

            const buttonStopElement = document.querySelector(
                `.button__back[data-id="${this.id}"]`
            ) as HTMLButtonElement;
            buttonStopElement.setAttribute('disabled', '');

            const buttonStartElement = document.querySelector(
                `.button__start[data-id="${this.id}"]`
            ) as HTMLButtonElement;
            buttonStartElement.removeAttribute('disabled');

            const buttonSelectElement = document.querySelector(
                `.button__select[data-id="${this.id}"]`
            ) as HTMLButtonElement;
            buttonSelectElement.removeAttribute('disabled');

            const buttonRemoveElement = document.querySelector(
                `.button__remove[data-id="${this.id}"]`
            ) as HTMLButtonElement;
            buttonRemoveElement.removeAttribute('disabled');
        }
        return res;
    }

    private getWidth(): number {
        const roadElement = document.querySelectorAll('.car__road')[0];
        return parseInt(getComputedStyle(roadElement).width, 10);
    }

    public animate(duration: number): void {
        const distance = this.getWidth() - 120;
        console.log(distance);
        if (this.carElement === null) return;
        const element = this.carElement.querySelector(`#car-${this.id}`) as HTMLElement;

        let start: number;
        let previousTimeStamp: number;
        let done = false;
        const step = (timeStamp: number) => {
            if (start === undefined) {
                start = timeStamp;
            }

            const elapsed = ((timeStamp - start) / duration) * 1000;
            if (previousTimeStamp !== timeStamp) {
                const count = Math.min(elapsed, distance);
                element.style.transform = `translateX(${count}px)`;
                if (count === distance) done = true;
            }
            if (elapsed < distance && !this.status.isBroken) {
                previousTimeStamp = timeStamp;
                if (!done) {
                    this.animationId = window.requestAnimationFrame(step);
                }
            }
        };
        this.animationId = window.requestAnimationFrame(step);
    }
}
