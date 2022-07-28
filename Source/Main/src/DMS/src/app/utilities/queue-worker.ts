export interface IQueueWorker<T> {
    isEmpty(): boolean;
    enqueue(item: T);
    dequeue(): T;
    clear();
}

export abstract class QueueWorkerBase implements IQueueWorker<any> {
    protected _queue: any[];

    constructor() {
        this._queue = [];
    }

    public get queue(): any[] {
        return this._queue;
    }

    public abstract enqueue(item: any);
    public abstract dequeue(): any;

    public isEmpty(): boolean {
        return this._queue.length <= 0;
    }

    public clear() {
        this._queue.splice(0, this._queue.length);
    }
}

export class QueueWorker<T> extends QueueWorkerBase {

    constructor(queue?: T[]) {
        super();
        this._queue = queue || this._queue;
    }

    public enqueue(item: T) {
        this._queue.push(item);
    }

    public dequeue(): T {
        if (this.isEmpty()) return null;
        const item = this._queue.shift();
        return item;
    }
}
