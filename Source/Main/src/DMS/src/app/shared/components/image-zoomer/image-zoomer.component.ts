import { Component, OnInit, OnDestroy, Input, ElementRef, AfterViewInit } from '@angular/core';
import {
    Store,
    ReducerManagerDispatcher
} from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import { AppErrorHandler } from '@app/services';
import {
    CustomAction
} from '@app/state-management/store/actions';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import * as uti from '@app/utilities';

@Component({
    selector: 'image-zoomer',
    styleUrls: ['./image-zoomer.component.scss'],
    templateUrl: './image-zoomer.component.html'
})
export class ImageZoomerComponent implements OnInit, OnDestroy, AfterViewInit {

    public serverApiUrl = '/api/FileManager/GetScanFile?name=';
    private lockedCursorShade: any = null;
    public imageUrl = '';
    public imageUrls: any[] = [];
    private preloadImagesList: any[] = [];
    public totalImages = 0;
    public currentImageIndex = 0;
    private changeImageInterval: any = null;

    private lockedCursorShadeState: Observable<any>;
    private scanningStatusDataState: Observable<any>;
    private scanningStatusDataCallSkipState: Observable<any>;
    private showSmallImageState: Observable<any>;

    private lockedCursorShadeStateSubscription: Subscription;
    private scanningStatusDataStateSubscription: Subscription;
    private scanningStatusDataCallSkipStateSubscription: Subscription;
    private requestDownloadSubscription: Subscription;
    private showSmallImageStateSubscription: Subscription;

    rotateCount = 0;
    rotateType = 'vertical';
    isManual = false;
    isLocked = false;
    loaded: any = {};
    smallImageCollapsed = false;

    @Input() zoomRange: number[] = [10, 30];
    @Input() magnifierSize: string[] = ['100%', '100%'];
    @Input() cursorShadeColor = '#fff';
    @Input() cursorShadeOpacity = 0.3;
    @Input() cursorShadeBorder = '2px solid red';
    @Input() disableWheel = false;
    @Input() tabID: string;

    constructor(
        private elmRef: ElementRef,
        private store: Store<AppState>,
        private appErrorHandler: AppErrorHandler,
        private dispatcher: ReducerManagerDispatcher,
    ) {
        //this.lockedCursorShadeState = store.select(state => dataEntryReducer.getDataEntryState(state, this.tabID).lockedCursorShade);
        //this.scanningStatusDataState = store.select(state => dataEntryReducer.getDataEntryState(state, this.tabID).scanningStatusData);
        //this.scanningStatusDataCallSkipState = store.select(state => dataEntryReducer.getDataEntryState(state, this.tabID).scanningStatusCallSkip);
        //this.showSmallImageState = store.select(state => dataEntryReducer.getDataEntryState(state, this.tabID).showSmallImage);
    }

    ngOnInit() {
        this.subscribeLockedCursorShadeState();
        this.subscribeScanningStatusDataState();
        this.subscribeScanningStatusDataCallSkipState();
        this.subscribeRequestDownloadState();
        this.subscribeShowSmallImageState();
    }

    ngOnDestroy() {
        $(this.elmRef.nativeElement).children().off();

        uti.Uti.unsubscribe(this);
    }

    ngAfterViewInit() {
    }

    public resizeImageZoomer() {
        this.initImageZoomer(0);
    }

    public initImageZoomer(timeoutValue?, resetToggle?) {
        //if (resetToggle && this.smallImageCollapsed) {
        //    this.toggleSmallImage();
        //}

        setTimeout(() => {
            this.destroy();

            const $smallImage = $('#small-image', this.elmRef.nativeElement);
            if ($smallImage && $smallImage.length) {
                $smallImage.css({ 'transform': 'rotate(0deg)' });
                const $container = $('#image-zoomer-display', this.elmRef.nativeElement);
                this.createZoomRange($smallImage, $container);

                this.init($smallImage);
                this.firstClickImage(timeoutValue);
            }
        }, !isNil(timeoutValue) ? timeoutValue : 1000);
    }

    private destroy() {
        $('div#zoomtracker', this.elmRef.nativeElement).remove();
        $('div#magnifyarea', this.elmRef.nativeElement).remove();
        $('div#cursorshade', this.elmRef.nativeElement).remove();
    }

    private createZoomRange($smallImage, $container) {
        if ($smallImage.height() > $smallImage.width()) {
            this.zoomRange[0] = $container.width() / $smallImage.width();
        } else {
            this.zoomRange[0] = $container.width() / $smallImage.height();
        }
    }

    public toggleLock() {
        this.isLocked = !this.isLocked;
        this.dispatchLock();
    }

    private dispatchLock() {
        if (this.isLocked) {
            const $cursorshade = $('div#cursorshade', this.elmRef.nativeElement);
            const $zoomtracker = $('div#zoomtracker', this.elmRef.nativeElement);
            //this.store.dispatch(this.dataEntryActions.lockCursorShade({
            //    left: $cursorshade.offset().left,
            //    top: $cursorshade.offset().top,
            //    power: $zoomtracker.data('specs').curpower
            //}, this.tabID));
        } else {
            // this.store.dispatch(this.dataEntryActions.unlockCursorShade(this.tabID));
        }
    }

    private firstClickImage(timeoutValue?) {
        const $tracker = $('div#zoomtracker', this.elmRef.nativeElement);
        const $magnifier = $('div#magnifyarea', this.elmRef.nativeElement);
        const $maginner = $magnifier.find('div:eq(0)');
        const $cursorshade = $('div#cursorshade', this.elmRef.nativeElement);
        let e: any = {};

        if ($tracker && !this.isManual) {
            $tracker.trigger('mousedown');
        }

        if (this.lockedCursorShade) {
            if ($tracker && $tracker.data('specs')) {
                $tracker.data('specs').curpower = this.lockedCursorShade.power;
            }

            this.keepImageZooming();

            e = {
                pageX: this.lockedCursorShade.left + $cursorshade.width() / 2 + 2,
                pageY: this.lockedCursorShade.top + $cursorshade.height() / 2 + 2
            }
        } else if ($cursorshade && $cursorshade.offset() &&
            $tracker && $tracker.offset()) {
            e = {
                pageX: this.isManual ? $cursorshade.offset().left + $cursorshade.width() / 2 + 2 : $tracker.offset().left,
                pageY: this.isManual ? $cursorshade.offset().top + $cursorshade.height() / 2 + 2 : $tracker.offset().top
            };
        }

        if (this.isManual) {
            this.manualFirstClickImage($tracker, $magnifier, $maginner, $cursorshade, e);
        } else {
            setTimeout(() => {
                this.manualFirstClickImage($tracker, $magnifier, $maginner, $cursorshade, e);
            }, !isNil(timeoutValue) ? timeoutValue : 1000);
        }
    }

    private manualFirstClickImage($tracker, $magnifier, $maginner, $cursorshade, e) {
        if (!$tracker || !$tracker.data('specs')) {
            return;
        }
        $tracker.data('specs').coords = { left: $tracker.offset().left, top: $tracker.offset().top };
        this.moveImage($tracker, $maginner, $cursorshade, e, null);
    }

    private subscribeLockedCursorShadeState() {
        this.lockedCursorShadeStateSubscription = this.lockedCursorShadeState.subscribe((lockedCursorShadeState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.lockedCursorShade = lockedCursorShadeState;

                this.isLocked = !isEmpty(lockedCursorShadeState);
            });
        });
    }

    private subscribeScanningStatusDataState() {
        this.scanningStatusDataStateSubscription = this.scanningStatusDataState.subscribe((scanningStatusDataState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (scanningStatusDataState) {

                    if (this.imageUrls.length) {
                        this.currentImageIndex = this.imageUrls[0].index;
                        this.totalImages = this.imageUrls.length;

                        this.preloadImages(this.imageUrls.map((imageUrl) => {
                            return imageUrl.url;
                        }));
                    }

                    if (!scanningStatusDataState.length) {
                        this.destroy();
                    }
                }
            });
        });
    }

    private subscribeScanningStatusDataCallSkipState() {
        this.scanningStatusDataCallSkipStateSubscription = this.scanningStatusDataCallSkipState.subscribe((scanningStatusDataCallSkipState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (scanningStatusDataCallSkipState && scanningStatusDataCallSkipState.skip) {
                    this.destroy();
                }
            });
        });
    }

    private subscribeShowSmallImageState() {
        this.requestDownloadSubscription = this.showSmallImageState.subscribe((showSmallImageState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (showSmallImageState && this.smallImageCollapsed != showSmallImageState.isCollapsed) {
                    this.toggleSmallImage();
                }
            });
        });
    }

    private subscribeRequestDownloadState() {
        //this.requestDownloadSubscription = this.dispatcher.filter((action: CustomAction) => {
        //    return action.type === DataEntryActions.DATA_ENTRY_REQUEST_DOWNLOAD_SCANNING_IMAGE && action.area == this.tabID;
        //}).subscribe(() => {
        //    this.appErrorHandler.executeAction(() => {
        //        this.downloadImage();
        //    });
        //});
    }

    private preloadImages(array) {
        if (!this.preloadImagesList) {
            this.preloadImagesList = [];
        }
        var list = this.preloadImagesList;
        for (var i = 0; i < array.length; i++) {
            var img = new Image();
            list.push(img);
            img.src = '/api/FileManager/GetScanFile?name=' + array[i];
        }
    }

    public onImageIndexChanged($event) {
        clearTimeout(this.changeImageInterval);
        this.changeImageInterval = setTimeout(() => {
            let value = parseInt($event.target.value);
            if (!isNil(value) && !isNaN(value) && value > 0 && value <= this.totalImages) {
                this.currentImageIndex = value;

                this.loadImageUrl(this.currentImageIndex);
            }
        }, 300);
    }

    public nextImage() {
        this.currentImageIndex++;

        this.loadImageUrl(this.currentImageIndex);
    }

    public prevImage() {
        this.currentImageIndex--;

        this.loadImageUrl(this.currentImageIndex);
    }

    private loadImageUrl(index) {
        let img = this.imageUrls.find(x => x.index == index);
        if (img) {
            this.imageUrl = img.url;
        }
    }

    private highestZindex($img) {
        let z = 0, elz;
        const $els = $img.parents().add($img);
        $els.each(function () {
            elz = $(this).css('zIndex');
            elz = isNaN(elz) ? 0 : +elz;
            z = Math.max(z, elz);
        });
        return z;
    }

    public rotateImage(rotateType) {
        this.isManual = true;

        const $smallImage = $('#small-image', this.elmRef.nativeElement),
            $smallImageParent = $smallImage.parent(),
            $bigImage = $('#big-image', this.elmRef.nativeElement),
            $tracker = $('#zoomtracker', this.elmRef.nativeElement),
            $magnifier = $('div#magnifyarea', this.elmRef.nativeElement),
            $maginner = $magnifier.find('div:eq(0)'),
            specs = $tracker.data('specs');
        let newSmallImageHeight = 0,
            rotateString = '',
            newSmallImageWidth = 0,
            marginValue = 0,
            maginnerWidth = 0,
            maginnerHeight = 0;

        switch (rotateType) {
            case 'right':
                this.rotateCount += 1;
                break;
            case 'left':
                this.rotateCount -= 1;
                break;
        }

        if (this.rotateCount === 4 || this.rotateCount === -4) {
            this.rotateCount = 0;
        }
        switch (this.rotateCount) {
            case 0:
                rotateString = 'rotate(0deg)';
                break;
            case 1:
                rotateString = 'rotate(90deg)';
                break;
            case 2:
                rotateString = 'rotate(180deg)';
                break;
            case 3:
                rotateString = 'rotate(270deg)';
                break;
            case -1:
                rotateString = 'rotate(-90deg)';
                break;
            case -2:
                rotateString = 'rotate(-180deg)';
                break;
            case -3:
                rotateString = 'rotate(-270deg)';
                break;
        }

        this.rotateType = (this.rotateCount === 0 || this.rotateCount === 2 || this.rotateCount === -2) ? 'vetical' : 'horizontal';

        switch (this.rotateType) {
            case 'vetical':
                newSmallImageHeight = $smallImage.height();
                newSmallImageWidth = $smallImage.width();
                maginnerWidth = $bigImage.width();
                maginnerHeight = $bigImage.height();
                break;
            case 'horizontal':
                newSmallImageHeight = $smallImage.width();
                newSmallImageWidth = $smallImage.height();
                maginnerWidth = $bigImage.height();
                maginnerHeight = $bigImage.width();

                marginValue = $bigImage.height() > $bigImage.width() ? ($bigImage.height() - $bigImage.width()) / 2 : ($bigImage.width() - $bigImage.height()) / 2;
                break;
        }

        $smallImage.css({ 'transform': rotateString });

        $maginner.css({
            'width': maginnerWidth,
            'height': maginnerHeight
        });

        $bigImage.css({
            'transform': rotateString
        });

        if (this.rotateType === 'horizontal') {
            $bigImage.css({
                'margin-left': marginValue + 'px',
                'margin-top': -marginValue + 'px'
            });
        } else {
            $bigImage.css({
                'margin-left': 'auto',
                'margin-top': 'auto'
            });
        }

        $tracker.css({
            top: $smallImageParent.position().top + $smallImage.position().top,
            left: $smallImageParent.position().left + $smallImage.position().left,
            width: newSmallImageWidth,
            height: newSmallImageHeight
        });
        specs.imagesize.h = newSmallImageHeight;
        specs.imagesize.w = newSmallImageWidth;

        this.firstClickImage();
    }

    private getBoundary(b, val, specs) {
        if (b === 'left') {
            const rb = -specs.imagesize.w * specs.curpower + specs.magsize.w
            return (val > 0) ? 0 : (val < rb) ? rb : val
        } else {
            const tb = -specs.imagesize.h * specs.curpower + specs.magsize.h
            return (val > 0) ? 0 : (val < tb) ? tb : val
        }
    }

    public manualMoveImage(moveType) {
        this.isManual = true;

        const $tracker = $('div#zoomtracker', this.elmRef.nativeElement);
        const $magnifier = $('div#magnifyarea', this.elmRef.nativeElement);
        const $maginner = $magnifier.find('div:eq(0)');
        const $cursorshade = $('div#cursorshade', this.elmRef.nativeElement);

        this.moveImage($tracker, $maginner, $cursorshade, {}, moveType);
    }

    private moveImage($tracker, $maginner, $cursorshade, e, moveType?) {
        const specs = $tracker.data('specs');
        if (!specs) {
            return;
        }
        const csw = Math.round(specs.magsize.w / specs.curpower);
        const csh = Math.round(specs.magsize.h / specs.curpower);

        let newTop = 0,
            newLeft = 0;
        if (moveType) {
            switch (moveType) {
                case 'up':
                    newTop = -(csh / 2);
                    break;
                case 'down':
                    newTop = (csh / 2);
                    break;
                case 'left':
                    newLeft = -(csw / 2);
                    break;
                case 'right':
                    newLeft = (csw / 2);
                    break;
                default:
                    break;
            }
        }

        const fiz = this,
            trackercoords = specs.coords,
            $container = $('#image-zoomer-container', this.elmRef.nativeElement),
            pagex = moveType
                ? ((specs.lastpagex + (specs.lastpagex === trackercoords.left ? 2 : 1) * newLeft) > trackercoords.left + specs.imagesize.w)
                    ? specs.lastpagex
                    : Math.max(specs.lastpagex + (specs.lastpagex === trackercoords.left ? 2 : 1) * newLeft, trackercoords.left)
                : (e.pageX || specs.lastpagex),
            pagey = moveType
                ? ((specs.lastpagey + (specs.lastpagey === trackercoords.top ? 2 : 1) * newTop) > trackercoords.top + specs.imagesize.h)
                    ? specs.lastpagey
                    : Math.max(specs.lastpagey + (specs.lastpagey === trackercoords.top ? 2 : 1) * newTop, trackercoords.top)
                : (e.pageY || specs.lastpagey),
            x = pagex - (trackercoords.left),
            y = pagey - (trackercoords.top),
            paddingTop = $container.offset().top,
            paddingLeft = $container.offset().left;

        $cursorshade.css({
            width: csw,
            height: csh
        });

        if (!this.smallImageCollapsed) {
            $cursorshade.css({
                visibility: (e && e.pageX !== 0 && e.pageY !== 0) ? 'visible' : 'hidden',
            });
        }

        $cursorshade.css({
            top: Math.min(specs.imagesize.h - csh, Math.max(0, y - csh / 2)) + trackercoords.top - paddingTop,
            left: Math.min(specs.imagesize.w - csw, Math.max(0, x - csw / 2)) + trackercoords.left - paddingLeft
        });

        const newx = -x * specs.curpower + specs.magsize.w / 2;
        const newy = -y * specs.curpower + specs.magsize.h / 2;
        $maginner.css({ left: fiz.getBoundary('left', newx, specs), top: fiz.getBoundary('top', newy, specs) });

        specs.lastpagex = pagex;
        specs.lastpagey = pagey;

        this.isManual = false;

        if (!isNaN(x) && !isNaN(y)) {
            this.dispatchLock();
        }
    }

    private magnifyImage($tracker, e, zoomRange) {
        if (!this.isManual) {
            if (!e.detail && !e.wheelDelta) { e = e.originalEvent; }
        }

        const delta = e.detail ? e.detail * (-120) : e.wheelDelta;
        const zoomdir = (delta <= -120) ? 'out' : 'in';
        const specs = $tracker.data('specs');
        if (!specs) {
            return;
        }
        const magnifier = specs.magnifier, od = specs.imagesize, power = specs.curpower;
        const newpower = (zoomdir === 'in') ? Math.min(power + 1, zoomRange[1]) : Math.max(power - 1, zoomRange[0]);
        let nd = [od.w * newpower, od.h * newpower];
        if (this.rotateType === 'horizontal') {
            nd = [od.h * newpower, od.w * newpower];
        }
        magnifier.$image.css({ width: nd[0], height: nd[1] });

        if (this.rotateType === 'horizontal') {
            const marginValue = nd[1] > nd[0] ? ((nd[1] - nd[0]) / 2) : ((nd[0] - nd[1]) / 2);
            magnifier.$image.css({
                'margin-left': marginValue + 'px',
                'margin-top': -marginValue + 'px'
            });
        } else {
            magnifier.$image.css({
                'margin-left': 'auto',
                'margin-top': 'auto'
            });
        }

        specs.curpower = newpower;
        if ($tracker) {
            $tracker.trigger('mousedown');
        }

        this.isManual = true;
        if ($tracker) {
            $tracker.trigger('mousemove');
            $tracker.trigger('mouseup');
        }
    }

    /**
     * downloadImage
     */
    public downloadImage() {
        if (this.imageUrl) {
            let a = document.createElement("a");
            a.href = this.serverApiUrl + this.imageUrl;
            a.click();
        }
    }

    public zoomImage(zoomIn: boolean) {
        this.isManual = true;

        const $tracker = $('div#zoomtracker', this.elmRef.nativeElement);
        const eventObj = {
            detail: 0,
            wheelDelta: zoomIn ? 120 : -120
        }
        this.magnifyImage($tracker, eventObj, this.zoomRange);
    }

    private keepImageZooming() {
        this.isManual = true;
        const $tracker = $('div#zoomtracker', this.elmRef.nativeElement);

        const specs = $tracker.data('specs');
        if (!specs) {
            return;
        }
        const magnifier = specs.magnifier,
            od = specs.imagesize,
            power = specs.curpower;
        const newpower = Math.min(power, this.zoomRange[1]);
        let nd = [od.w * newpower, od.h * newpower];
        if (this.rotateType === 'horizontal') {
            nd = [od.h * newpower, od.w * newpower];
        }
        magnifier.$image.css({ width: nd[0], height: nd[1] });

        if (this.rotateType === 'horizontal') {
            const marginValue = nd[1] > nd[0] ? ((nd[1] - nd[0]) / 2) : ((nd[0] - nd[1]) / 2);
            magnifier.$image.css({
                'margin-left': marginValue + 'px',
                'margin-top': -marginValue + 'px'
            });
        } else {
            magnifier.$image.css({
                'margin-left': 'auto',
                'margin-top': 'auto'
            });
        }

        specs.curpower = newpower;
        if ($tracker) {
            $tracker.trigger('mousedown');
        }

        this.isManual = true;
        if ($tracker) {
            $tracker.trigger('mousemove');
            $tracker.trigger('mouseup');
        }
    }

    public toggleSmallImage() {
        this.smallImageCollapsed = !this.smallImageCollapsed;

        const $tracker = $('div#zoomtracker', this.elmRef.nativeElement),
            $cursorshade = $('div#cursorshade', this.elmRef.nativeElement),
            $smallImage = $('div#small-image-container', this.elmRef.nativeElement);

        if (this.smallImageCollapsed) {
            $tracker.css('visibility', 'hidden');
            $cursorshade.css('visibility', 'hidden');
            $smallImage.css('visibility', 'hidden');
        } else {
            $tracker.css('visibility', 'visible');
            $cursorshade.css('visibility', 'visible');
            $smallImage.css('visibility', 'visible');
        }

        // this.store.dispatch(this.dataEntryActions.toggleSmallImage(this.smallImageCollapsed, this.tabID));
    }

    private init($img) {
        if (!$img || !$img.length) {
            return;
        }

        const w = $img.width(),
            h = $img.height(),
            ip = $img.parent(),
            ippos = ip.position(),
            ipos = $img.position(),
            trackerLeft = ippos.left + ipos.left,
            trackerTop = ippos.top + ipos.top,
            fiz = this, lastpage = { pageX: 0, pageY: 0 },
            basezindex = this.highestZindex($img);
        let $tracker, $cursorshade, $magnifier,
            windowResizeInterval;

        $img.css({ visibility: 'visible' });
        this.imageUrl = this.imageUrl || $img.get(0).src;
        $magnifier = $('<div id="magnifyarea" style="cursor:move;position:absolute;z-index:' + (basezindex - 1) + ';width:' + this.magnifierSize[0] + ';height:' + this.magnifierSize[1] + ';left:0;top:0;display:block;visibility:visible;overflow:hidden;" />')
            .append('<div style="position:absolute;left:0;top:0;z-index:' + (basezindex - 1) + ';" />')
            .appendTo($('div#image-zoomer-display')[0]);

        $cursorshade = $('<div id="cursorshade" style="visibility:hidden;position:absolute;left:0;top:0;z-index:' + basezindex + ';" />')
            .css({ border: this.cursorShadeBorder, opacity: this.cursorShadeOpacity, backgroundColor: this.cursorShadeColor })
            .appendTo($('div#image-zoomer-display')[0]);

        $tracker = $('<div id="zoomtracker" style="cursor:progress;position:absolute;z-index:' + basezindex + ';left:' + trackerLeft + 'px;top:' + trackerTop + 'px;height:' + h + 'px;width:' + w + 'px;" />')
            .css({
                backgroundImage: 'none'
            })
            .appendTo($('div#image-zoomer-display')[0]);

        $(window).bind('load resize', () => {
            clearTimeout(windowResizeInterval);
            windowResizeInterval = setTimeout(() => {
                this.resizeImageZoomer();
            }, 200);
        });

        function getspecs($maginner, $bigimage) {
            const magsize = { w: $magnifier.width(), h: $magnifier.height() }
            const imagesize = { w: w, h: h }
            const power = (fiz.zoomRange) ? fiz.zoomRange[0] : ($bigimage.width() / w).toFixed(5)
            $tracker.data('specs', {
                statustimer: null,
                magnifier: { $outer: $magnifier, $inner: $maginner, $image: $bigimage },
                magsize: magsize,
                imagesize: imagesize,
                curpower: power,
                coords: getcoords(),
                csborder: $cursorshade.outerWidth()
            })
        }

        function getcoords() {
            const offset = $tracker.offset();
            return { left: offset.left, top: offset.top };
        }

        $tracker.one('mousedown', (e) => {
            const $maginner = $magnifier.find('div:eq(0)')
            const $bigimage = $('<img id="big-image" src="/api/FileManager/GetScanFile?name=' + this.imageUrl + '"/>').appendTo($maginner)
            const largeloaded = this.loaded[(<HTMLLinkElement>($('<a href="/api/FileManager/GetScanFile?name=' + this.imageUrl + '"></a>').get(0))).href];
            if (!largeloaded) {
                $img.stop(true, true).css({ opacity: 0.1 });
            }

            $bigimage.on('loadevt', (event, _e) => {
                if (_e.type === 'error') {
                    const cssDataAdded = $img.css({ opacity: 1 }).data('added');
                    if (cssDataAdded)
                        cssDataAdded.remove();
                    const src = (<HTMLLinkElement>($('<a href="' + $bigimage.attr('src') + '"></a>').get(0))).href;
                    if (window.console && console.error) {
                        console.error('Cannot find Featured Image Zoomer larger image: ' + src);
                    } else {
                        alert('Cannot find Featured Image Zoomer larger image:\n\n' + src);
                    }
                    return;
                }

                this.loaded[$bigimage.attr('src')] = true;

                $img.css({ opacity: 1 });

                if (this.zoomRange) {
                    const nd = [w * this.zoomRange[0], h * this.zoomRange[0]];
                    $bigimage.css({ width: nd[0], height: nd[1] })
                }

                getspecs($maginner, $bigimage);

                $magnifier.css({ display: 'block', visibility: 'visible' });

                let isMousedown = false;
                $tracker.mousedown((__e) => {
                    $tracker.data('specs').coords = getcoords();
                    fiz.moveImage($tracker, $maginner, $cursorshade, __e);

                    isMousedown = true;
                });

                $tracker.mousemove((__e) => {
                    if (isMousedown) {
                        fiz.moveImage($tracker, $maginner, $cursorshade, __e);
                    }
                });

                $tracker.mouseup((__e) => {
                    isMousedown = false;
                });

                $tracker.mouseout((__e) => {
                    isMousedown = false;
                }).css({ cursor: 'move' });


                let _DRAGGGING_STARTED = 0;
                let _LAST_MOUSE_POSITION = { x: null, y: null };
                let _DIV_OFFSET = $magnifier.offset();

                $magnifier.on('mousedown', (event) => {
                    _DRAGGGING_STARTED = 1;

                    $tracker.data('specs').coords = getcoords();

                    $bigimage.closest('div').css({
                        "pointer-events": "none",
                        "-moz-user-select": "none"
                    });

                    _LAST_MOUSE_POSITION = { x: event.pageX - _DIV_OFFSET.left, y: event.pageY - _DIV_OFFSET.top };
                });

                $magnifier.on('mouseup', (event) => {
                    _DRAGGGING_STARTED = 0;

                    $bigimage.closest('div').css({
                        "pointer-events": "",
                        "-moz-user-select": ""
                    });
                });

                $magnifier.on('mousemove', (event) => {
                    if (_DRAGGGING_STARTED == 1) {
                        let current_mouse_position = { x: event.pageX - _DIV_OFFSET.left, y: event.pageY - _DIV_OFFSET.top };
                        let change_x = current_mouse_position.x - _LAST_MOUSE_POSITION.x;
                        let change_y = current_mouse_position.y - _LAST_MOUSE_POSITION.y;

                        _LAST_MOUSE_POSITION = current_mouse_position;

                        let img_top = parseInt($bigimage.closest('div').css('top'), 10);
                        let img_left = parseInt($bigimage.closest('div').css('left'), 10);

                        let img_top_new = img_top + change_y;
                        let img_left_new = img_left + change_x;

                        if (img_top_new > $magnifier.position().top) {
                            img_top_new = $magnifier.position().top;
                        } else if (img_top_new < $magnifier.position().top + $magnifier.height() - $bigimage.closest('div').height()) {
                            img_top_new = $magnifier.position().top + $magnifier.height() - $bigimage.closest('div').height();
                        }

                        if (img_left_new > $magnifier.position().left) {
                            img_left_new = $magnifier.position().left;
                        } else if (img_left_new < $magnifier.position().left + $magnifier.width() - $bigimage.closest('div').width()) {
                            img_left_new = $magnifier.position().left + $magnifier.width() - $bigimage.closest('div').width();
                        }

                        $bigimage.closest('div').css({ top: img_top_new + 'px', left: img_left_new + 'px' });

                        let csPosition = $cursorshade.position(),
                            csOffset = $tracker.offset(),
                            specs = $tracker.data('specs'),
                            csw = Math.round(specs.magsize.w / specs.curpower),
                            csh = Math.round(specs.magsize.h / specs.curpower);

                        let newLeft = csPosition.left - (change_x / specs.curpower);
                        if (newLeft < $tracker.position().left) {
                            newLeft = $tracker.position().left;
                        } else if (newLeft > $tracker.position().left + specs.imagesize.w - csw) {
                            newLeft = $tracker.position().left + specs.imagesize.w - csw;
                        }

                        let newTop = csPosition.top - (change_y / specs.curpower);
                        if (newTop < $tracker.position().top) {
                            newTop = $tracker.position().top;
                        } else if (newTop > $tracker.position().top + specs.imagesize.h - csh) {
                            newTop = $tracker.position().top + specs.imagesize.h - csh;
                        }

                        $cursorshade.css({
                            left: newLeft,
                            top: newTop,
                        });

                        specs.lastpagex = $cursorshade.offset().left + $cursorshade.width() / 2;
                        specs.lastpagey = $cursorshade.offset().top + $cursorshade.height() / 2;
                    }
                });

                if (this.zoomRange && this.zoomRange[1] > this.zoomRange[0]) {
                    $tracker.bind('DOMMouseScroll mousewheel', (__e) => {
                        fiz.magnifyImage($tracker, __e, this.zoomRange);
                        __e.preventDefault();
                        __e.stopPropagation();
                    });

                    $bigimage.bind('DOMMouseScroll mousewheel', (__e) => {
                        fiz.magnifyImage($tracker, __e, this.zoomRange);
                        __e.preventDefault();
                        __e.stopPropagation();
                    });
                } else if (this.disableWheel) {
                    $tracker.bind('DOMMouseScroll mousewheel', (__e) => { __e.preventDefault(); __e.stopPropagation(); });
                    $bigimage.bind('DOMMouseScroll mousewheel', (__e) => { __e.preventDefault(); __e.stopPropagation(); });
                }
            });
            if ($bigimage && (<HTMLImageElement>($bigimage.get(0))).complete) {
                $bigimage.trigger('loadevt', { type: 'load' })
            } else {
                $bigimage.bind('load error', (__e) => { $bigimage.trigger('loadevt', __e) })
            }
        })
    }

}
