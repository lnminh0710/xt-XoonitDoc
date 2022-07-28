import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, TemplateRef } from "@angular/core";
import { UploadFileMode } from '@app/app.constants';

@Component({
    selector: 'article-template-image-upload',
    templateUrl: './article-template-image-upload.component.html',
    styleUrls: ['./article-template-image-upload.component.scss'],
})
export class ArticleTemplateImageUploadComponent implements OnInit, OnDestroy, AfterViewInit {

    public uploadFileMode: UploadFileMode = UploadFileMode.ArticleMediaZipImport;
    @ViewChild('statusTemplate') statusTemplateRef: TemplateRef<any>;

    constructor(private _eref: ElementRef) {

    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {

    }

    /**
     * ngAfterViewInit
     */
    public ngAfterViewInit() {

    }

    /**
     * onCompleteUploadItem
     * @param data
     */
    onCompleteUploadItem(data) {

    }
}
