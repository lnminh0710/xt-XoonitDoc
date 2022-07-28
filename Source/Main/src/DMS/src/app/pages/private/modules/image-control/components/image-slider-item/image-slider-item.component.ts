import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ImageThumbnailModel, ImageThumbnailType } from '../../models/image.model';
import { Uti } from '../../../../../../utilities';
import { UploadFileMode } from '../../../../../../app.constants';

@Component({
    selector: 'image-slider-item',
    templateUrl: './image-slider-item.component.html',
    styleUrls: ['../../styles/icon.scss', './image-slider-item.component.scss'],
})
export class ImageSliderItemComponent implements OnInit, OnDestroy {
    @Input() image: ImageThumbnailModel;
    @Input() width: number;
    @Input() height: number;
    @Input() index: number;
    @Input() isSelected: boolean;
    @Input() type: any;
    @Input() hideTitle: boolean;
    @Input() isBase64: boolean;
    @Input() isLoading: boolean;
    @Input() isConfirmInside: boolean;
    @Input() isChecked: boolean;

    //Output

    @Output() viewThumbnailDetail: EventEmitter<any> = new EventEmitter();
    @Output() clickItem: EventEmitter<any> = new EventEmitter();
    @Output() dblClickItem: EventEmitter<any> = new EventEmitter();
    @Output() deleteThumbnail: EventEmitter<any> = new EventEmitter();
    @Output() onCheckedChanged: EventEmitter<any> = new EventEmitter();
    // Variable
    public ImageThumbnailType = ImageThumbnailType;
    public imageSrc = '';
    public ExtractedFields = 0;
    public TotalFields = 0;
    public typeHeight = 0;
    public isShowDialog = false;
    public isConfirmDelete = false;

    ngOnInit() {
        if (this.type === this.ImageThumbnailType.scanningList || this.isBase64) {
            this.imageSrc = this.image.Base64;
        } else {
            const name = `${this.image.ScannedPath}\\${this.image.DocumentName || this.image.FileName}`;
            this.imageSrc = Uti.getFileUrl(name, UploadFileMode.Path);
            //this.imageSrc = `/api/FileManager/GetFile?name=${this.image.ScannedPath}\\${this.image.DocumentName || this.image.FileName}&mode=6`;
            this.ExtractedFields = parseInt(this.image.ExtractedFields, 10);
            this.TotalFields = parseInt(this.image.TotalFields, 10);
        }

        this.typeHeight = this.type === ImageThumbnailType.info ? 35 : 71;
    }

    ngOnDestroy() {
        this.imageSrc = '';
    }

    public viewImageDetail() {
        this.viewThumbnailDetail.emit(this.image);
    }

    public onClickItem() {
        this.clickItem.emit({ item: this.image, index: this.index });
    }

    public onDblClickItem() {
        if (this.isLoading) return;
        // prevent click on group
        // if (this.type === ImageThumbnailType.info) {
        //     // this.isShowDialog = true;
        //     return;
        // }
        this.dblClickItem.emit({ item: this.image, index: this.index });
    }

    public onClickDangerButton() {
        if (this.isLoading) return;
        this.deleteThumbnail.emit({ item: this.image, index: this.index });
    }

    public onClickCheckbox() {
        if (this.isLoading) return;
        this.onCheckedChanged.emit(this.image);
    }
}
