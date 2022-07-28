import {
    Output, EventEmitter
} from '@angular/core';

/**
 * BaseWidget
 */
export abstract class BaseWidget {

    @Output() isCompletedRender: EventEmitter<any> = new EventEmitter();

    constructor() {
    }

    public emitCompletedRenderEvent() {
        setTimeout(() => {
            this.isCompletedRender.emit(true);
        });
    }
}
