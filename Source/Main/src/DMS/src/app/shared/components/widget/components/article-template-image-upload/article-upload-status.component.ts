import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ElementRef   } from "@angular/core";

@Component({
    selector: 'article-upload-status',
    templateUrl: './article-upload-status.component.html',
    styleUrls: ['./article-upload-status.component.scss']
})
export class ArticleUploadStatusComponent implements OnInit, OnDestroy, AfterViewInit {
    private failedArticleNrIndex: number = 1;
    public failedArticleList: Array<string> = [];
    public item: any;

    @Input() set data(data) {
        if (data) {
            this.item = data.item;
            if (data.response && data.response.data) {
                if (data.response.data[this.failedArticleNrIndex] && data.response.data[this.failedArticleNrIndex].length) {
                    this.failedArticleList = data.response.data[this.failedArticleNrIndex].map(p => p.FileName);
                }
            }
        }
    }

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
}
