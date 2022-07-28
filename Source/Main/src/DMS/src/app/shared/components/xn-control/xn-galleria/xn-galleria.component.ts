import { Component, ElementRef, AfterViewChecked, AfterViewInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import {
    DomHandler
} from '@app/services';
import { Uti } from '@app/utilities';

@Component({
    selector: 'xn-galleria',
    templateUrl: './xn-galleria.component.html',
    styleUrls: ['./xn-galleria.component.scss']
})
export class XnGalleria implements AfterViewChecked, AfterViewInit, OnDestroy {

    @Input() style: any;
    @Input() styleClass: string;
    @Input() panelWidth = 600;
    @Input() panelHeight = 400;
    @Input() frameWidth = 60;
    @Input() frameHeight = 40;
    @Input() activeIndex = 0;
    @Input() showFilmstrip = true;
    @Input() autoPlay = true;
    @Input() transitionInterval = 4000;
    @Input() showCaption = true;
    @Input() imageShowPrefixId = '';
    @Input() sourceIsBase64: boolean = false;

    @Output() onImageClicked = new EventEmitter<any>();

    _images: any[];
    slideshowActive: boolean;
    public container: any;
    public panelWrapper: any;
    public panels: any;
    public caption: any;
    public stripWrapper: any;
    public strip: any;
    public frames: any;
    public interval: any;
    public stripLeft = 0;
    public imagesChanged: boolean;
    public initialized: boolean;

    private ratioOfImage: number;//height / width

    constructor(public el: ElementRef, public domHandler: DomHandler) { }

    ngAfterViewChecked() {
        if (this.imagesChanged) {
            this.stopSlideshow();
            this.render();
            this.imagesChanged = false;
        }
    }

    @Input() get images(): any[] {
        return this._images;
    }

    set images(value: any[]) {
        this._images = value;
        this.activeIndex = 0;
        for (let i = 0; i < this.images.length; i++) {
            this.images[i].thumbnailImageUrl = this.getRightImageURL(this.images[i].source, 300);
            this.images[i].bigImageUrl = this.getRightImageURL(this.images[i].source, 700);
            this.images[i].fullImageUrl = this.getRightImageURL(this.images[i].source);

            if (this.images[i].isSelected) {
                this.activeIndex = i;
                //break;
            }
        }
        this.imagesChanged = true;
        this.onImageClicked.emit({ originalEvent: null, image: this.images[this.activeIndex], index: this.activeIndex });
    }

    ngAfterViewInit() {
        this.container = this.el.nativeElement.children[0];
        this.panelWrapper = this.domHandler.findSingle(this.el.nativeElement, 'ul.ui-galleria-panel-wrapper');
        this.initialized = true;

        if (this.showFilmstrip) {
            this.stripWrapper = this.domHandler.findSingle(this.container, 'div.ui-galleria-filmstrip-wrapper');
            this.strip = this.domHandler.findSingle(this.stripWrapper, 'ul.ui-galleria-filmstrip');
        }

        if (this.images && this.images.length) {
            this.render();
        }

        //set Image Size
        this.ratioOfImage = this.panelHeight / this.panelWidth;
        this.setImageSize(0);
        const that = this;
        $(window).resize(function () {
            that.setImageSize();
        });
    }

    ngOnDestroy() {
        this.stopSlideshow();
        Uti.unsubscribe(this);
        $(window).unbind('resize');
    }

    render() {
        this.panels = this.domHandler.find(this.panelWrapper, 'li.ui-galleria-panel');

        if (this.showFilmstrip) {
            this.frames = this.domHandler.find(this.strip, 'li.ui-galleria-frame');
            this.stripWrapper.style.width = this.domHandler.width(this.panelWrapper) - 50 + 'px';
            this.stripWrapper.style.height = this.frameHeight + 'px';
        }

        if (this.showCaption) {
            this.caption = this.domHandler.findSingle(this.container, 'div.ui-galleria-caption');
            this.caption.style.bottom = this.showFilmstrip ? this.domHandler.getOuterHeight(this.stripWrapper, true) + 'px' : 0 + 'px';
            this.caption.style.width = this.domHandler.width(this.panelWrapper) + 'px';
        }

        if (this.autoPlay) {
            this.startSlideshow();
        }

        this.container.style.visibility = 'visible';
    }

    startSlideshow() {
        this.interval = setInterval(() => {
            this.next();
        }, this.transitionInterval);

        this.slideshowActive = true;
    }

    stopSlideshow() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.slideshowActive = false;
    }

    clickNavRight() {
        if (this.slideshowActive) {
            this.stopSlideshow();
        }
        this.next();
    }

    clickNavLeft() {
        if (this.slideshowActive) {
            this.stopSlideshow();
        }
        this.prev();
    }

    frameClick(frame, image) {
        if (this.slideshowActive) {
            this.stopSlideshow();
        }

        this.select(this.domHandler.index(frame), false);
        this.onImageClicked.emit({ originalEvent: null, image: this.images[this.activeIndex], index: this.activeIndex });
    }

    prev() {
        if (this.activeIndex !== 0) {
            this.select(this.activeIndex - 1, true);
            this.onImageClicked.emit({ originalEvent: null, image: this.images[this.activeIndex], index: this.activeIndex });
        }
    }

    next() {
        if (this.activeIndex !== (this.panels.length - 1)) {
            this.select(this.activeIndex + 1, true);
        } else {
            this.select(0, false);
            this.stripLeft = 0;
        }
        this.onImageClicked.emit({ originalEvent: null, image: this.images[this.activeIndex], index: this.activeIndex });
    }

    select(index, reposition) {
        if (index !== this.activeIndex) {
            const newPanel = this.panels[index];

            this.domHandler.fadeIn(newPanel, 500);

            if (this.showFilmstrip) {
                const newFrame = this.frames[index];

                if (reposition === undefined || reposition === true) {
                    const frameLeft = newFrame.offsetLeft,
                        stepFactor = this.frameWidth + parseInt(getComputedStyle(newFrame)['margin-right'], 10),
                        stripLeft = this.strip.offsetLeft,
                        frameViewportLeft = frameLeft + stripLeft,
                        frameViewportRight = frameViewportLeft + this.frameWidth;

                    if (frameViewportRight > this.domHandler.width(this.stripWrapper))
                        this.stripLeft -= stepFactor;
                    else if (frameViewportLeft < 0)
                        this.stripLeft += stepFactor;
                }
            }

            this.activeIndex = index;
        }
    }

    clickImage(event, image, i) {
        this.onImageClicked.emit({ originalEvent: event, image: image, index: i });
    }

    public getRightImageURL(source: string, width?: number) {
        if (this.sourceIsBase64) return source;
        if (source.startsWith('http://') || source.startsWith('https://')) return source;
        if (width) return source + '&w=' + width;

        return source
    }

    private setImageSizeTimeout: any = null;
    public setImageSize(timeout?: number) {
        timeout = timeout || 300;

        clearTimeout(this.setImageSizeTimeout);
        this.setImageSizeTimeout = null;
        this.setImageSizeTimeout = setTimeout(() => {
            const $elmGalleria = $(this.el.nativeElement).find('.ui-galleria');
            if (!$elmGalleria.length) return;

            let ratioOfImage: number = this.ratioOfImage || 0.64;
            let width: number = $elmGalleria.width() || 1;
            let height: number = parseInt((width * ratioOfImage) + '');
            width = parseInt(width + '');
            if (height > width) height = width;

            $elmGalleria.find('.ui-galleria-panel-wrapper').css({
                'width': '100%',
                'height': height + 'px'
            });

            this.stripWrapper.style.width = (width - 55) + 'px'
        }, timeout);
    }
}
