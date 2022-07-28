import { Directive, EventEmitter, ElementRef, HostListener, Input, Output } from '@angular/core';
import { FileUploader } from './file-uploader.class';
import { Uti } from '@app/utilities';

@Directive({ selector: '[ng2FileDrop]' })
export class FileDropDirective {
    @Input() public uploader: FileUploader;
    @Input() public acceptExtensionFiles: string = '';
    @Input() public allowSelectDuplicateFile = true;
    @Input() public checkFileCorrect: any;
    @Input() public maxSizeLimit: number;

    @Output() public fileOver: EventEmitter<any> = new EventEmitter();
    @Output() public dontAllowFileExtension: EventEmitter<any> = new EventEmitter();
    @Output() public fileDuplicateAction: EventEmitter < any > = new EventEmitter();
    @Output() public fileDuplicateOnQueueAction: EventEmitter < any > = new EventEmitter();
    @Output() public onFileDrop: EventEmitter<File[]> = new EventEmitter<File[]>();
    @Output() public dontAllowFileSize: EventEmitter<any> = new EventEmitter();

    protected element: ElementRef;

    public constructor(element: ElementRef) {
        this.element = element;
    }

    public getOptions(): any {
        return this.uploader.options;
    }

    public getFilters(): any {
        return {};
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: any): void {
        const transfer = this._getTransfer(event);
        if (!transfer || !transfer.files) {
            return;
        }
        this._preventAndStop(event);
        if (!Uti.checkFileExtension(this.acceptExtensionFiles, transfer.files[0].name)) {
            this.element.nativeElement.value = '';
            this.dontAllowFileExtension.emit();
            return;
        }
        if (this.maxSizeLimit && transfer.files[0].size > this.maxSizeLimit) {
            this.dontAllowFileSize.emit();
            this.element.nativeElement.value = '';
            return;
        }
        if (this.checkFileCorrect && typeof this.checkFileCorrect == 'function' && !this.checkFileCorrect(transfer.files[0])) {
            this.fileDuplicateAction.emit(transfer.files[0]);
            this.element.nativeElement.value = '';
            return;
        }
        if (!this.allowSelectDuplicateFile && Uti.isDuplicateFile(this.uploader, transfer.files[0])) {
            this.fileDuplicateOnQueueAction.emit(transfer.files[0]);
            this.element.nativeElement.value = '';
            return;
        }
        if (this.uploader && !this.uploader.isUploading) {
            const options = this.getOptions();
            const filters = this.getFilters();
            this.uploader.addToQueue(transfer.files, options, filters);
        }
        this.fileOver.emit(false);
        this.onFileDrop.emit(transfer.files);
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event: any): void {
        const transfer = this._getTransfer(event);
        if (!this._haveFiles(transfer.types)) {
            return;
        }

        transfer.dropEffect = 'copy';
        this._preventAndStop(event);
        this.fileOver.emit(true);
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: any): any {
        if ((this as any).element && event.currentTarget === (this as any).element[0]) {
            return;
        }

        this._preventAndStop(event);
        this.fileOver.emit(false);
    }

    protected _getTransfer(event: any): any {
        return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
    }

    protected _preventAndStop(event: any): any {
        event.preventDefault();
        event.stopPropagation();
    }

    protected _haveFiles(types: any): any {
        if (!types) {
            return false;
        }

        if (types.indexOf) {
            return types.indexOf('Files') !== -1;
        } else if (types.contains) {
            return types.contains('Files');
        } else {
            return false;
        }
    }
}
