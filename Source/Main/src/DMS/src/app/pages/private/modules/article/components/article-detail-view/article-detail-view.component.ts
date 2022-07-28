import { Component, OnInit, OnDestroy, ElementRef, Input, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { Uti } from '@app/utilities';
import sortBy from 'lodash-es/sortBy';
import { GalleryImage } from '@app/models';
import { UploadFileMode } from '@app/app.constants';
import {
    AppErrorHandler
} from '@app/services';
import {
    ArticleService
} from '@app/pages/private/modules/article/services';
import { ArticleDetailViewModel } from '../../models';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { CustomAction, LayoutInfoActions } from '@app/state-management/store/actions';
import { XnGalleriaVertical } from '@app/shared/components/xn-control/xn-galleria/xn-galleria-vertical.component';
import { GuidHelper } from '@app/utilities/guild.helper';
import * as tabButtonReducer from '@app/state-management/store/reducer/tab-button';
import { AppState } from '@app/state-management/store';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'article-detail-view',
    styleUrls: ['./article-detail-view.component.scss'],
    templateUrl: './article-detail-view.component.html'
})
export class ArticleDetailViewComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public galleryImages: Array<GalleryImage> = [];
    public articleDetail: ArticleDetailViewModel = new ArticleDetailViewModel();
    private resizeSplitterStateSubscription: Subscription;
    @ViewChild('galleryCtrl') galleryCtrl: XnGalleriaVertical;

    private isShowTabButtonState: Observable<any>;
    private isShowTabButtonStateSubscription: Subscription;

    private isTabCollapsedState: Observable<boolean>;
    private isTabCollapsedStateSubscription: Subscription;

    private _widgetDetail: any;
    @Input() set widgetDetail(data: any) {
        if (!data) return;

        this._widgetDetail = data;
        this.mapData();
    }

    public zoomWindowId: string = 'zoomWindowId_' + GuidHelper.generateGUID();

    private isAfterViewInit: boolean = false;

    constructor(
        private store: Store<AppState>,
        protected router: Router,
        protected elRef: ElementRef,
        protected uti: Uti,
        private articleService: ArticleService,
        private appErrorHandler: AppErrorHandler,
        private dispatcher: ReducerManagerDispatcher,
        private detectorRef: ChangeDetectorRef
    ) {
        super(router);

        this.isShowTabButtonState = store.select(state => tabButtonReducer.getTabButtonState(state, this.ofModule.moduleNameTrim).isShow);
        this.isTabCollapsedState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).isTabCollapsed);
    }

    ngOnInit(): void {
        this.subscribeResizeSplitterState();
        this.subscribeIsShowTabButtonState();
        this.subcribeIsTabCollapsedState();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    ngAfterViewInit() {
        this.isAfterViewInit = true;
    }

    private subscribeResizeSplitterState() {
        this.resizeSplitterStateSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === LayoutInfoActions.RESIZE_SPLITTER && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe((data: CustomAction) => {
            this.appErrorHandler.executeAction(() => {
                if (this.isAfterViewInit) {
                    if (!data) return;

                    // if widget element is not visible, do nothing
                    if (this.elRef && this.elRef.nativeElement && this.elRef.nativeElement.offsetParent == null) return;

                    this.galleryResize(300);
                }
            });
        });
    }

    private subscribeIsShowTabButtonState() {
        this.isShowTabButtonStateSubscription = this.isShowTabButtonState.subscribe((isShowTabButtonState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                if (isShowTabButtonState) {
                    this.galleryResize(300);
                }
            });
        });
    }

    private subcribeIsTabCollapsedState() {
        this.isTabCollapsedStateSubscription = this.isTabCollapsedState.subscribe((isTabCollapsedState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.galleryResize(300);
            });
        });
    }

    private mapData() {
        if (!this._widgetDetail || !this._widgetDetail.contentDetail ||
            !this._widgetDetail.contentDetail.data || this._widgetDetail.contentDetail.data.length < 2) {
            this.galleryImages.length = 0;
            this.articleDetail = new ArticleDetailViewModel();
            return;
        }

        const data = this._widgetDetail.contentDetail.data[1];
        for (let i = 0, length = data.length; i < length; i++) {
            const item = data[i];
            switch (item['OriginalColumnName']) {
                case 'B00Article_IdArticle':
                    this.articleDetail.idArticle = item.Value;
                    break;
                case 'B00Article_ArticleNr':
                    this.articleDetail.artilceNr = item.Value;
                    break;
                case 'B00ArticleName_ArticleNameShort':
                    this.articleDetail.articleNameShort = item.Value;
                    break;
                case 'B00ArticleDescription_ArticleDescriptionLong':
                    this.articleDetail.articleDescription = item.Value;
                    break;
            }
        }//for

        if (this.articleDetail.idArticle)
            this.getArticleMedia(this.articleDetail.idArticle);
    }

    private getArticleMedia(idArticle) {
        if (!idArticle) return;

        this.articleService.getArticleMedia(idArticle).subscribe(rs => {
            this.appErrorHandler.executeAction(() => {

                if (this.articleDetail.idArticle != idArticle) return;

                if (!rs || !rs.item.collectionData) {
                    this.galleryImages.length = 0;
                    return;
                }
                const collectionData: Array<any> = rs.item.collectionData;

                let galleryImages: Array<GalleryImage> = [];
                collectionData.forEach(data => {
                    if (data.mediaName.value) {
                        const articleImage = new GalleryImage({
                            source: Uti.getFileUrl(data.mediaName.value, UploadFileMode.ArticleMedia),
                            title: data.mediaTitle.value,
                            description: data.mediaDescription.value,
                            isMain: data.isActive.value === 'True',
                            isDeleted: data.isDeleted.value === 'True'
                        });
                        articleImage['article'] = data;
                        galleryImages.push(articleImage);
                    }
                });

                if (galleryImages.length) {
                    galleryImages = galleryImages.filter(p => p.isDeleted === false);
                    galleryImages = sortBy(galleryImages, function (item) {
                        return item.isMain ? 0 : 1;
                    });
                }

                this.galleryImages = galleryImages;
                this.detectorRef.detectChanges();
            });
        });
    }

    private galleryResize(timeout?: number) {
        if (this.isAfterViewInit && this.galleryCtrl) {
            this.galleryCtrl.setImageSize(timeout, true);
        }
    }
}
