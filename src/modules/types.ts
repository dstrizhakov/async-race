import { type } from 'os';
import { EventEmitter } from './EventEmitter';

export type BaseObject = Partial<Record<string, string | number | boolean | number[]>>;

export interface ICarData {
    id: number;
    name: string;
    color: string;
    status?: 'started' | 'stopped' | 'drive';
}

export interface IWinner {
    id: number;
    wins: number;
    time: number;
}

export interface Page<T> {
    total: number;
    items: T[];
}

export type Cars = Page<ICarData>;
export type Winners = Page<IWinner>;

export interface IApp {
    garage: IGarage;
    score: IScore;
    api: IApi;
    eventEmitter: EventEmitter<RaceEvent>;
    root: HTMLElement;
    html: IHtml;
    currentPage: 'race' | 'winners';
}

export interface CarClass {
    id: number;
    color: string;
    name: string;
    status: IEngineStatus;
    animationId: number;
    render(): void;
    listener(event: MouseEvent): void;
    race(): Promise<void>;
    reset(): Promise<EngineResponce | undefined>;
    animate(duration: number): void;
}

export interface IGarage {
    render: () => void;
    cars: CarClass[];
    // getCars: (params: BaseObject) => Promise<Cars>;
    // getCar: (id: number) => Promise<Car>;
    // createCar: () => void;
    deleteCar: (id: number) => void;
}

export interface IEngine {
    id: number;
    status: IEngineStatus;
    start: () => Promise<EngineResponce | undefined>;
    stop: () => Promise<EngineResponce | undefined>;
    drive: () => Promise<void>;
}

export interface IEngineStatus {
    isBroken: boolean;
    isStarted: boolean;
    isStopped: boolean;
    isDrive: boolean;
    velocity: number;
    distance: number;
}

export interface IScore {
    render: () => void;
    addWinner: (winner: Winner) => Promise<Partial<Winner>>;
}

export interface IApi {
    baseUrl: string;
    send: (url: URL, method: string, data?: BaseObject) => Promise<Response>;
    get: <T>(url: string, params?: BaseObject) => Promise<T>;
    post: <T>(url: string, data: BaseObject) => Promise<T>;
    put: <T>(url: string, data: BaseObject) => Promise<T>;
    patch: <T>(url: string, params?: BaseObject) => Promise<T>;
    delete: <T>(url: string, id: number) => Promise<T>;
    getPage: <T>(url: string, params?: BaseObject) => Promise<Page<T>>;
}

export interface IHtml {
    header: string;
    footer: string;
    race: string;
    winners: string;
}

export type Query = {
    id: number;
    status: 'started' | 'stopped' | 'drive';
    page: number;
    limit: number;
    sort: 'id' | 'wins' | 'time';
    order: 'ASC' | 'DESC';
};

export type EngineResponce = {
    velocity: number;
    distance: number;
};

export type RaceEvent = {
    id: number;
    isBroken: boolean;
    time: number;
};

export interface Winner {
    id: number;
    wins: number;
    time: number;
}

export type Sort = 'id' | 'wins' | 'time';
export type Asc = 'ASC' | 'DESC';
