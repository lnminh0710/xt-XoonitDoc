import {
    Directive,
    ElementRef,
    Input,
    Output,
    HostListener,
    EventEmitter
} from '@angular/core';
import {
    FileUploader
} from './file-uploader.class';
import { Uti } from '@app/utilities';
// todo: filters
@Directive({
    selector: '[ng2FileSelect]'
})
export class FileSelectDirective {
    @Input() public uploader: FileUploader;
    @Input() public acceptExtensionFiles: string = '';
    @Input() public allowSelectDuplicateFile = true;
    @Input() public checkFileCorrect: any;
    @Input() public maxSizeLimit: number;

    @Output() public dontAllowFileExtension: EventEmitter < any > = new EventEmitter();
    @Output() public fileDuplicateAction: EventEmitter < any > = new EventEmitter();
    @Output() public fileDuplicateOnQueueAction: EventEmitter < any > = new EventEmitter();
    @Output() public onFileSelected: EventEmitter<File[]> = new EventEmitter<File[]>();
    @Output() public dontAllowFileSize: EventEmitter<any> = new EventEmitter();

    protected element: ElementRef;
    public constructor(element: ElementRef) {
        this.element = element;
    }
    public getOptions(): any {
        return this.uploader.options;
    }
    public getFilters(): any {
        return void 0;
    }
    public isEmptyAfterSelection(): boolean {
        return !!this.element.nativeElement.attributes.multiple;
    }
    @HostListener('change')
    public onChange(): any {
        // let files = this.uploader.isHTML5 ? this.element.nativeElement[0].files : this.element.nativeElement[0];
        const files = this.element.nativeElement.files;
        if (!files || !files.length || !Uti.checkFileExtension(this.acceptExtensionFiles, files[0].name)) {
            this.dontAllowFileExtension.emit();
            this.element.nativeElement.value = '';
            return;
        }
        if (this.maxSizeLimit && files[0].size > this.maxSizeLimit) {
            this.dontAllowFileSize.emit();
            this.element.nativeElement.value = '';
            return;
        }
        if (this.checkFileCorrect && typeof this.checkFileCorrect == 'function' && !this.checkFileCorrect(files[0])) {
            this.fileDuplicateAction.emit(files[0]);
            this.element.nativeElement.value = '';
            return;
        }
        if (!this.allowSelectDuplicateFile && Uti.isDuplicateFile(this.uploader, files[0])) {
            this.fileDuplicateOnQueueAction.emit(files[0]);
            this.element.nativeElement.value = '';
            return;
        }
        const options = this.getOptions();
        const filters = this.getFilters();
        // if(!this.uploader.isHTML5) this.destroy();
        this.uploader.addToQueue(files, options, filters);
        this.onFileSelected.emit(files);
        this.element.nativeElement.value = '';
        // if (this.isEmptyAfterSelection()) {
            // todo
            // this.element.nativeElement.value = '';
            /*this.element.nativeElement
             .replaceWith(this.element = this.element.nativeElement.clone(true)); // IE fix*/
        // }
    }
}
