import { Output, EventEmitter, Input, HostListener, Directive, HostBinding } from '@angular/core';
import { DragService } from '@app/services';

export interface DropTargetOptions {
    zone?: string;
}

@Directive({
    selector: '[xnDropTarget]'
})
export class DropTargetDirective {

    constructor(private dragService: DragService) {

    }

    @Input()
    set xnDropTarget(options: DropTargetOptions) {
        if (options) {
            this.options = options;
        }
    }

    @Output() xnDrop = new EventEmitter();
    @Output() xnDragEnter = new EventEmitter();
    @Output() xnDragOver = new EventEmitter();
    @Output() xnDragLeave = new EventEmitter();

    private options: DropTargetOptions = {};

    @HostListener('dragenter', ['$event'])
    onDragEnter(event) {
        const { zone = 'zone' } = this.options;
        if (this.dragService.accepts(zone)) {
            event.preventDefault();
            this.xnDragEnter.emit(this.dragService.data);
        }
    }

    @HostListener('dragover', ['$event'])
    onDragOver(event) {
        const { zone = 'zone' } = this.options;
        if (this.dragService.accepts(zone)) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            this.xnDragOver.emit(this.dragService.data);
        }
    }

    @HostListener('dragleave', ['$event'])
    onDragLeave(event) {        
        this.xnDragLeave.emit();
    }

    @HostListener('drop', ['$event'])
    onDrop(event) {
        const { zone = 'zone' } = this.options;
        if (this.dragService.accepts(zone)) {
            this.xnDrop.emit(Object.assign({}, {
                data: this.dragService.data,
                callBack: this.dragService.callBack
            }));
            this.dragService.reset();
        }        
    }
}
