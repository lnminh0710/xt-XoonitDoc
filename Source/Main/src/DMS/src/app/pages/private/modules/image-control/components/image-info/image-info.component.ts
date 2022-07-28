import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
    OnChanges,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { ImageThumbnailModel, ImageThumbnailType } from '../../models/image.model';
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula';

import { filter, cloneDeep, some, includes, differenceBy } from 'lodash-es';

import { LocalStorageKey } from '@app/app.constants';
import { Uti } from '@app/utilities';

@Component({
    selector: 'image-info',
    templateUrl: './image-info.component.html',
    styleUrls: ['./image-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageInfoComponent implements OnInit, OnDestroy, OnChanges {
    @Input() pageList: ImageThumbnailModel[] = [];
    @Input() selectedIndex: number;
    @Input() isBase64: boolean;
    @Input() isLoading: boolean;
    //output
    @Output() dropImageThumbnail: EventEmitter<any> = new EventEmitter();
    @Output() selectItem: EventEmitter<any> = new EventEmitter();
    @Output() removePage: EventEmitter<any> = new EventEmitter();
    @Output() orderPage: EventEmitter<any> = new EventEmitter();

    // Variable
    public ImageThumbnailType = ImageThumbnailType;
    public perfectScrollbarConfig: any = {};
    private originalPageList: ImageThumbnailModel[] = [];
    // Subcription
    private subscribeDropModel: Subscription;
    constructor(private dragulaService: DragulaService, private ref: ChangeDetectorRef) {}

    ngOnInit() {
        this.initDragulaEvents();
        this.initPageList();
    }

    ngOnChanges() {
        this.initPageList();
    }

    ngOnDestroy() {
        if (this.dragulaService.find('imageInfo')) this.dragulaService.destroy('imageInfo');
        Uti.unsubscribe(this);
    }

    public onRemovePage(event) {
        this.removePage.emit(event);
    }

    public onDropImageThumbnails($event) {
        this.dropImageThumbnail.emit($event);
    }

    public onSelectImage(event: any) {
        this.selectItem.emit(event.index + 1);
    }

    private initDragulaEvents() {
        this.subscribeDropModel = this.dragulaService.drop.subscribe(this.onDropModel.bind(this));
    }

    private initPageList() {
        this.originalPageList = cloneDeep(this.pageList);
        const searchText = localStorage.getItem(LocalStorageKey.LocalStorageGSCaptureSearchText);
        if (!searchText) return;
        const searchList = searchText.split('+');
        this.pageList.forEach((page: ImageThumbnailModel) => {
            const OCRText: any = page.OCRText;
            page.IsFiltered =
                !!OCRText && some(searchList, (_text) => includes(OCRText.toLowerCase(), _text.toLowerCase()));
            return page;
        });
        this.ref.detectChanges();
    }

    private onDropModel(args: any) {
        const [bagName, elSource, bagTarget, bagSource] = args;
        if (bagName === 'imageInfo') {
            this.pageList = filter(this.pageList, (_p) => _p !== undefined);
            this.orderPage.emit(this.pageList);
        }
    }
}
