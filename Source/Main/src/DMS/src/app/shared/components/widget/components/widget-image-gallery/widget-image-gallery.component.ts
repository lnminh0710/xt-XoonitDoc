import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { CustomAction, LayoutInfoActions, PreissChildActions } from '@app/state-management/store/actions';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ImageAttachmentViewerComponent } from '../widget-attachment-viewer/image-attachment-viewer';
import { AttachmentType } from '../widget-attachment-viewer/models';
import { get } from 'lodash-es';
import { DocumentImageOcrService } from '@app/pages/private/modules/image-control/services';
import { DownloadFileService } from '@app/services';
import { AppState } from '@app/state-management/store';

const headerToolbar = 50;

@Component({
    selector: 'widget-image-gallery',
    templateUrl: 'widget-image-gallery.component.html',
    styleUrls: ['widget-image-gallery.component.scss'],
})
export class WidgetImageGallery extends BaseComponent implements OnInit, AfterViewInit {
    readonly AttachmentType = AttachmentType;

    width: number = 0;
    height: number = 0;

    indexSelected = 0;

    destroy$: Subject<void> = new Subject<void>();
    @ViewChild('image') image: ImageAttachmentViewerComponent;

    @Output() onMaximizeWidget = new EventEmitter<any>();

    constructor(
        protected router: Router,
        private element: ElementRef,
        private dispatcher: ReducerManagerDispatcher,

        private _downloadFileService: DownloadFileService,
        private documentService: DocumentImageOcrService,
        private store: Store<AppState>,
        private preissChildAction: PreissChildActions,
        private ref: ChangeDetectorRef,
    ) {
        super(router);
    }

    slides = [];
    slideConfig = {
        arrows: true,
        infinite: false,
        variableWidth: true,
        prevArrow: '<div><i class="fa fa-chevron-left"></i></div>',
        nextArrow: '<div><i class="fa fa-chevron-right"></i></div>',
    };

    ngOnInit() {
        this.parseConfigToWidthHeight();
        this.onSubscribe();
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    ngAfterViewInit() {
        this.store.dispatch(this.preissChildAction.galleryPictureFinishLoad());
    }

    private onSubscribe() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === LayoutInfoActions.RESIZE_SPLITTER;
                }),
                takeUntil(this.destroy$),
            )
            .subscribe((action: CustomAction) => {
                setTimeout(() => {
                    this.parseConfigToWidthHeight();
                }, 10);
            });
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === PreissChildActions.SELECT_CAR;
                }),
                map((action: CustomAction) => action.payload),
                takeUntil(this.destroy$),
            )
            .subscribe((payload: any) => {
                this.slides = get(payload, 'property.Picture', []).map((_p) => `data:image/png;base64,${_p}`);
                // this.slideConfig.slidesToShow = Math.min(this.slides.length, 4);
                this.indexSelected = 0;
                this.ref.detectChanges();
            });
    }

    private parseConfigToWidthHeight() {
        try {
            this.width = $(this.element.nativeElement).parent().width();
            this.height = $(this.element.nativeElement).parent().height() - headerToolbar;
        } catch (error) {
            this.width = 0;
            this.height = 0;
        }
    }

    public expandWidget(event) {
        this.onMaximizeWidget.emit({
            isMaximized: event,
        });
    }

    public goToImage(index) {
        if (this.indexSelected === 0 && index === -1) {
            this.indexSelected = this.slides.length - 1;
        } else if (this.indexSelected >= this.slides.length - 1 && index === 1) {
            this.indexSelected = 0;
        } else this.indexSelected = this.indexSelected + index;
    }

    zoomIn($event) {
        if (this.image) {
            this.image.viewer.zoom(0.2, true);
        }
    }

    zoomOut($event) {
        if (this.image) {
            this.image.viewer.zoom(-0.2, true);
        }
    }

    rotate($event) {
        if (this.image) {
            this.image.viewer.rotate($event);
        }
    }

    viewActualSize() {
        if (this.image) {
            this.image.viewer.reset();
        }
    }
}
