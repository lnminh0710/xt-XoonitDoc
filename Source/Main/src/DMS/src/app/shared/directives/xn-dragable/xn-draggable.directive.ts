import { Input, HostListener, Directive, HostBinding, ElementRef } from '@angular/core';
import { DragService } from '@app/services';

export interface DraggableOptions {
    zone?: string;
    data?: any;
    callBack?: any;
}

@Directive({
    selector: '[xnDraggable]'
})

export class DraggableDirective {

    private options: DraggableOptions = {};

    constructor(private _elementRef: ElementRef, private dragService: DragService) {

    }

    @HostBinding('draggable')
    get draggable() {
        return true;
    }

    @Input()
    set xnDraggable(options: DraggableOptions) {
        if (options) {
            this.options = options;
        }
    }

    @HostListener('dragstart', ['$event'])
    onDragStart(event) {
        const { zone = 'zone', data = {}, callBack } = this.options;
        this.dragService.startDrag(zone, data, callBack);
    }

    @HostListener('dragend', ['$event'])
    onDragEnd(event) {
        this.dragService.reset();
    }
}