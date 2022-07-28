import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IconNames } from '@app/app-icon-registry.service';

@Component({
    selector: 'attachment-toolbar',
    templateUrl: './attachment-toolbar.component.html',
    styleUrls: ['./attachment-toolbar.component.scss'],
})
export class AttachmentToolbarComponent implements OnInit {
    public IconNamesEnum = IconNames;
    svgShare = IconNames.SHARE;
    svgDownload = IconNames.APP_DOWNLOAD;
    svgPrint = IconNames.APP_PRINT;

    public isFullScreen = false;
    loading: { [key: string]: boolean } = {
        share: false,
        download: false,
        print: false,
    };

    @Input() isHideRightIcons: boolean;
    @Input() isHidePrintIcon: boolean;
    @Input() isDisabledLeftIcons: boolean;
    @Input() isShowSearchIcon: boolean;
    @Input() isShowSwitchMode: boolean;
    @Input() isHideLeftIcon: boolean;

    @Output() onShare: EventEmitter<void> = new EventEmitter<void>();
    @Output() onDownload: EventEmitter<any> = new EventEmitter<any>();
    @Output() onPrint: EventEmitter<void> = new EventEmitter<void>();
    @Output() onZoomIn: EventEmitter<number> = new EventEmitter<number>();
    @Output() onZoomOut: EventEmitter<number> = new EventEmitter<number>();
    @Output() onRotate: EventEmitter<number> = new EventEmitter<number>();
    @Output() onViewActualSize: EventEmitter<void> = new EventEmitter<void>();
    @Output() onOpenSearch: EventEmitter<void> = new EventEmitter<void>();
    @Output() onSwitchMode: EventEmitter<void> = new EventEmitter<void>();
    @Output() fullscreen: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() {}

    ngOnInit(): void {}

    share() {
        this.onShare.emit();
    }

    download() {
        this.onDownload.emit({ loading: this.loading });
    }

    print() {
        this.onPrint.emit();
    }

    zoomIn() {
        this.onZoomIn.emit();
    }

    zoomOut() {
        this.onZoomOut.emit();
    }

    rotate(rot: number) {
        this.onRotate.emit(rot);
    }

    viewActualSize() {
        this.onViewActualSize.emit();
    }

    openSearch() {
        this.onOpenSearch.emit();
    }

    switchMode() {
        this.onSwitchMode.emit();
    }

    fullscreenAction() {
        this.isFullScreen = !this.isFullScreen;
        this.fullscreen.emit(this.isFullScreen);
    }
}
