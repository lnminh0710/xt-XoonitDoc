import { Component, ElementRef, AfterViewChecked, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {
    DomHandler
} from '@app/services';
import { Uti } from '@app/utilities';

@Component({
    selector: 'xn-galleria-vertical',
    templateUrl: './xn-galleria-vertical.component.html',
    styleUrls: ['./xn-galleria-vertical.component.scss']
})
export class XnGalleriaVertical implements AfterViewChecked, AfterViewInit, OnDestroy {
    @Input() zoomWindowId: string;
    private zoomWindowWidth = 400;

    @Input() style: any;
    @Input() styleClass: string;
    @Input() panelWidth = 600;
    @Input() panelHeight = 400;
    @Input() frameWidth = 40;
    @Input() frameHeight = 40;
    @Input() activeIndex = 0;
    @Input() showFilmstrip = true;

    private container: any;
    private panelWrapper: any;
    private stripWrapper: any;
    private imagesChanged: boolean;
    private stripHeight: number;
    private thumbnailHeight: number;
    private numofThumbnailDisplay: number;

    public stripTop = 0;

    constructor(public el: ElementRef,
        public domHandler: DomHandler,
        private detectorRef: ChangeDetectorRef) { }

    //is called every time Angular has finished running change detection on a component and it's children
    ngAfterViewChecked() {
        if (this.imagesChanged) {
            this.activeIndex = 0;
            this.imagesChanged = false;
            this.stripTop = 0;

            this.calculateSize();
            this.render();
            this.initEzPlus();
        }
    }

    private _images: any[];
    @Input() get images(): any[] {
        return this._images;
    }
    set images(value: any[]) {
        if (!value) return;

        this._images = value;
        this.activeIndex = 0;
        for (let i = 0, length = this.images.length; i < length; i++) {
            this.images[i].id = (new Date()).getTime() + 1;

            this.images[i].thumbnailImageUrl = this.getRightImageURL(this.images[i].source, 300);
            this.images[i].bigImageUrl = this.getRightImageURL(this.images[i].source, 700);
            this.images[i].fullImageUrl = this.getRightImageURL(this.images[i].source);

            if (this.images[i].isSelected) {
                this.activeIndex = i;
            }
        }
        this.imagesChanged = true;
    }

    ngAfterViewInit() {
        this.container = this.el.nativeElement.children[0];
        this.panelWrapper = this.domHandler.findSingle(this.container, 'ul.ui-galleria-panel-wrapper');

        if (this.showFilmstrip) {
            this.stripWrapper = this.domHandler.findSingle(this.container, 'div.ui-galleria-filmstrip-wrapper');
        }

        const that = this;
        $(window).resize(function () {
            that.setImageSize();
        });
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
        $(window).unbind('resize');
    }

    render() {
        if (!this.container || !this.panelWrapper) return;

        if (this.showFilmstrip) {
            if (this.images && this.images.length > 1) {
                this.panelWrapper.style['margin-left'] = (this.frameWidth + 10) + 'px';
                this.stripWrapper.style['display'] = 'block';
            }
            else {
                this.panelWrapper.style['margin-left'] = '0px';
                this.stripWrapper.style['display'] = 'none';
            }
        }

        this.container.style.visibility = 'visible';
    }

    clickNavDown() {
        if (!this.images || !this.images.length) return;

        let index = 0;
        if (this.activeIndex < this.images.length - 1)
            index = this.activeIndex + 1;

        this.select(index);
    }

    clickNavUp() {
        let index = 0;
        if (this.activeIndex > 1)
            index = this.activeIndex - 1;

        this.select(index);
    }

    frameClick(index: number, isMouseenter?: boolean) {
        this.select(index, isMouseenter);
    }

    private selectTimeout: any = null;
    select(index: number, isMouseenter?: boolean) {
        if (!this.images || !this.images.length || index == this.activeIndex) return;

        clearTimeout(this.selectTimeout);
        this.selectTimeout = null;
        this.selectTimeout = setTimeout(() => {
            if (this.showFilmstrip) {
                if (index == 0) {
                    this.stripTop = 0;
                }
                else {
                    const isScrollDown: boolean = index > this.activeIndex,
                        isScrollUp: boolean = !isScrollDown;

                    const stepFactor = this.thumbnailHeight;
                    let numofThumbnailTopHidden: number = 0;
                    if (this.stripTop < 0) {
                        const stripTopHeight = this.stripTop * -1;
                        numofThumbnailTopHidden = Math.floor(stripTopHeight / this.thumbnailHeight);
                    }

                    if (isScrollDown && (index >= this.numofThumbnailDisplay + numofThumbnailTopHidden))
                        this.stripTop -= stepFactor;//scroll down
                    else if (isScrollUp && index < numofThumbnailTopHidden)
                            this.stripTop += stepFactor;//scroll up
                }
            }

            this.activeIndex = index;
            this.initEzPlus();

            if (isMouseenter)
                this.detectorRef.detectChanges();
        }, 100);
    }

    public getRightImageURL(source: string, width?: number) {
        if (source.startsWith('http://') || source.startsWith('https://')) return source;
        if (source.startsWith('data:image')) return source;
        if (width) return source + '&w=' + width;

        return source
    }

    public itemsTrackBy(index, item) {
        return item ? item.id : undefined;
    }

    private setImageSizeTimeout: any = null;
    public setImageSize(timeout?: number, isDetectChanges?: boolean) {
        timeout = timeout || 200;

        clearTimeout(this.setImageSizeTimeout);
        this.setImageSizeTimeout = null;
        this.setImageSizeTimeout = setTimeout(() => {
            this.calculateSize();
            this.render();
            this.initEzPlus();
            if (isDetectChanges) {
                this.detectorRef.detectChanges();
            }
        }, timeout);
    }

    private initEzPlusTimeout: any = null;
    public initEzPlus(timeout?: number) {
        this.destroyEzPlus();

        if (!this.images || !this.images.length) return;

        //http://igorlino.github.io/elevatezoom-plus/api.htm
        timeout = timeout || 200;

        clearTimeout(this.initEzPlusTimeout);
        this.initEzPlusTimeout = null;
        this.initEzPlusTimeout = setTimeout(() => {
            const $bigImg = $(this.panelWrapper).find('.big-image-active');
            if ($bigImg.length) {

                const options: any = {
                    zoomWindowWidth: this.getZoomWindowWidth(),
                    zoomWindowHeight: this.panelHeight - 5,
                    borderSize: 1,
                    borderColour: '#e4e3e3',
                    lensBorderSize: 1,
                    lensBorderColour: '#e4e3e3',
                    containLensZoom: true,
                    lensOpacity: 0.6,
                    zoomWindowPosition: '#' + this.zoomWindowId,
                    loadingIcon: 'public/assets/img/loading-spinner.gif'
                };
                ($bigImg as any).ezPlus(options);
            }
        }, timeout);
    }

    private destroyEzPlus() {
        const $bigImg = $(this.panelWrapper).find('.big-image-active');
        if ($bigImg.length) {
            $.removeData($bigImg[0], 'ezPlus');
            $('.zoomWindowContainer').remove();
        }
    }

    private calculateSize() {
        this.foundZoomWindowWidth = false;

        const $boxDetailContainer = $(this.container).closest('.box-detail-container');
        if ($boxDetailContainer.length) {
            this.panelWidth = this.domHandler.width(this.container) - 50;// - margin-left: 50px
            this.panelHeight = $boxDetailContainer.height();
            this.panelHeight -= 13;//-13px to remove scroll of widget
        }

        if (this.showFilmstrip) {
            this.stripWrapper.style.width = this.frameWidth + 'px';
            this.stripWrapper.style.height = this.panelHeight + 'px';

            this.stripHeight = this.panelHeight - 40;//- 2 nav buttons
            $(this.stripWrapper).find('ul.ui-galleria-filmstrip').height(this.stripHeight);

            const $thumbnailFirst = $(this.stripWrapper).find('.ui-galleria-frame:first');
            if ($thumbnailFirst.length) {
                this.thumbnailHeight = Number($thumbnailFirst.outerHeight(true));
                this.numofThumbnailDisplay = Math.floor(this.stripHeight / this.thumbnailHeight);

                const navHeight = this.stripHeight - (Math.floor(this.stripHeight / this.thumbnailHeight) * this.thumbnailHeight) + 40;
                $(this.stripWrapper).find('.ui-galleria-nav').height(navHeight);
            }
        }

        $(this.container).find('.ui-galleria-panel-wrapper div.ui-panel-content').css({ 'height': this.panelHeight, 'width': this.panelWidth })
            .find('div.ui-panel-content').css({ 'max-width': this.panelWidth - 1, 'max-height': this.panelHeight - 1 });
    }

    private foundZoomWindowWidth: boolean = false;
    private getZoomWindowWidth() {
        if (this.foundZoomWindowWidth) return this.zoomWindowWidth;

        if (this.zoomWindowId) {
            const zoomWindowWidth = $('#' + this.zoomWindowId).width();
            if (zoomWindowWidth) {
                this.foundZoomWindowWidth = true;
                this.zoomWindowWidth = zoomWindowWidth - 5;
            }
        }
        return this.zoomWindowWidth;
    }
}
