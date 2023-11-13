import { Api } from './Api';
import { EngineResponce, IEngineStatus, IEngine, IApi, RaceEvent } from './types';
import { EventEmitter } from './EventEmitter';

export class Engine implements IEngine {
    public id: number;

    public status: IEngineStatus;

    public eventEmitter: EventEmitter<RaceEvent>;

    private api: IApi;

    constructor(id: number, eventEmitter: EventEmitter<RaceEvent>) {
        this.api = new Api();
        this.id = id;
        this.eventEmitter = eventEmitter;
        this.status = {
            isBroken: false,
            isDrive: false,
            isStarted: false,
            isStopped: true,
            velocity: 0,
            distance: 50000,
        };
    }

    public async start() {
        try {
            const res = await this.api.patch<EngineResponce>('engine/', { id: this.id, status: 'started' });
            this.status.isStopped = true;
            this.status.isDrive = false;
            this.status.velocity = res.velocity;
            this.status.distance = res.distance;
            return res;
        } catch (error) {
            console.error('An error occurred while starting the engine:', error);
            return undefined;
        }
    }

    public async stop() {
        try {
            const res = await this.api.patch<EngineResponce>('engine/', { id: this.id, status: 'stopped' });
            this.status.isDrive = false;
            this.status.isBroken = false;
            return res;
        } catch (error) {
            console.error('An error occurred while stopping the engine:', error);
            return undefined;
        }
    }

    public async drive() {
        try {
            await this.api.patch<EngineResponce>('engine/', { id: this.id, status: 'drive' }).then((res) => {
                this.status.isStopped = false;
                this.status.isDrive = true;
                // Успешный финиш
                this.eventEmitter.emit({
                    id: this.id,
                    isBroken: this.status.isBroken,
                    time: this.status.distance / this.status.velocity,
                });
                return res;
            });
        } catch (error) {
            this.status.isBroken = true;
            // Двигатель вышел из строя
            this.eventEmitter.emit({
                id: this.id,
                isBroken: this.status.isBroken,
                time: this.status.distance / this.status.velocity,
            });
        }
    }
}
