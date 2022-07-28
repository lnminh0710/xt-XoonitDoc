import {
    Component, Input, Output, EventEmitter, OnInit, OnDestroy,
    AfterViewInit, ElementRef, ViewChild
} from "@angular/core";
import {
    WidgetDetail
} from '@app/models';
import { WidgetArticleTranslationComponent } from './';
import { BaseWidget } from '@app/pages/private/base';

@Component({
    selector: 'widget-article-translation-dialog',
    templateUrl: './widget-article-translation-dialog.component.html',
    styleUrls: ['./widget-article-translation-dialog.component.scss']
})
export class WidgetArticleTranslationDialogComponent extends BaseWidget implements OnInit, OnDestroy, AfterViewInit {

    @Input()
    data: WidgetDetail;

    @Input()
    translatedDataGrid: any;

    @Input()
    idArticle: any;

    @ViewChild('articleTranslation')
    public articleTranslation: WidgetArticleTranslationComponent;

    @Output()
    onSuccessTranslated = new EventEmitter<any>();

    @Output()
    onItemsEditedTranslateData = new EventEmitter<any>();

    @Output()
    onCloseTranslationDialog = new EventEmitter<any>();

    public showDialog = false;
    
    constructor() {
        super();
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

    public open() {
        this.showDialog = true;
        this.emitCompletedRenderEvent();
    }

    public close() {
        this.showDialog = false;
        this.onCloseTranslationDialog.emit(true);
        //const itemsEdited = this.articleTranslation.getItemsEdited();
        //if (itemsEdited && itemsEdited.length) {
        //    this.onItemsEditedTranslateData.emit(itemsEdited);
        //}
    }

    public apply() {        
        const itemsEdited = this.articleTranslation.getItemsEdited();
        if (itemsEdited && itemsEdited.length) {
            this.onItemsEditedTranslateData.emit(itemsEdited);
        }
        this.onCloseTranslationDialog.emit(true);
        setTimeout(() => {
            this.showDialog = false;
        }, 250);
    }

    public save() {
        this.articleTranslation.submit();
        this.close();
        this.onSuccessTranslated.emit(this.data);
    }

}
