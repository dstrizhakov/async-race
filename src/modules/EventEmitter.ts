type Listener<T> = (event: T) => void;

export class EventEmitter<T> {
    private listeners: Listener<T>[] = [];

    public addListener(listener: Listener<T>): void {
        this.listeners.push(listener);
    }

    public removeListener(listener: Listener<T>): void {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    public clearListeners(): void {
        this.listeners = [];
    }

    public emit(event: T): void {
        this.listeners.forEach((listener) => {
            listener(event);
        });
    }
}
