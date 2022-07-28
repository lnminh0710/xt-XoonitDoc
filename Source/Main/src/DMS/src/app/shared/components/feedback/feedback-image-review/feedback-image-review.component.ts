import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    EventEmitter
} from '@angular/core';
import {
    Router
} from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';

@Component({
    selector: 'feedback-image-review',
    styleUrls: ['./feedback-image-review.component.scss'],
    templateUrl: './feedback-image-review.component.html'
})
export class FeedbackImageReviewComponent extends BaseComponent implements OnInit, OnDestroy {

    public description: string = '';
    public perfectScrollbarConfig: any;
    public currentIndex: number = -1;
    private _images: any[];
    @Input() dataUrl: string;
    @Input() config: any;
    @Input() imageTemps: any = [];
    @Input() set images(value: any[]) {
        this._images = [];
        for (let item of value) {
            this._images.push({
                id: item.id,
                source: item.image,
                title: '',
                alt: '',
                description: item.text,
                isSelected: (this.config && item.id === this.config.item.id)
            });
        }
    }

    get images(): any[] {
        return this._images;
    }
    @Output() closeImageReview = new EventEmitter<any>();

    constructor(
        protected router: Router
    ) {
        super(router);
    }

    public ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };
    }

    public ngOnDestroy() {
    }

    public onImageClickedHandle($event: any) {
        for(let i=0; i<this.imageTemps.length; i++) {
            if (this.imageTemps[i].id  === $event.image.id) {
                this.currentIndex = i;
                return;
            }
        }
    }
    public close() {
        this.closeImageReview.emit();
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/
}