import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
} from '@angular/core';
import { PopupFooter } from '../../models/popup-footer.interface';
import { PopupRef } from '../../popup-ref';
import { cloneDeep } from 'lodash-es';
import { popupAnimation } from '@app/xoonit-share/animations/popup.animation';

declare const ResizeObserver: any;
@Component({
    selector: 'simple-popup',
    styleUrls: ['simple-popup.component.scss'],
    templateUrl: 'simple-popup.component.html',
    host: {
        '[class.not-backDrop]': '!hasBackdrop',
    },
    animations: [popupAnimation],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimplePopupComponent implements OnInit, OnDestroy {
    public renderMethod: 'template' | 'string';
    public body: TemplateRef<any> | string;
    public footer: PopupFooter;
    public data: any;
    public optionResize: boolean;
    public optionDrapDrop: boolean;
    public hasBackdrop: boolean;
    public defaultWidth: string;
    public defaultHeight: string;
    public customBackground: string;
    private divDialog: HTMLElement;
    private offsetTopWhenDrag: number;
    private resizeObserver: any;
    constructor(private popupRef: PopupRef, private cdRef: ChangeDetectorRef) {
        this.renderMethod = this._getRenderMethod(this.popupRef);
        const params = this.popupRef.params;

        this.body = params.content as TemplateRef<any> | string;
        this.footer = cloneDeep(params.footer);
        this.data = {
            close: this.popupRef.close.bind(this.popupRef),
            ...cloneDeep(params.data),
        };
        this.optionResize = params.optionResize;
        this.optionDrapDrop = params.optionDrapDrop;
        this.hasBackdrop = params.hasBackdrop;
        this.defaultWidth = params.defaultWidth;
        this.defaultHeight = params.defaultHeight;
        this.customBackground = params.customBackground;
    }

    ngOnInit() {}

    ngAfterViewInit() {
        this.divDialog = this.popupRef.overlay.overlayElement?.querySelector('.x-popup-container');
        if ([this.divDialog.clientHeight, this.divDialog.clientWidth].includes(1)) {
            // case dialog open fast, dom not load yet.
            setTimeout(() => {
                this.handleAfterViewInit();
            });
        } else {
            this.handleAfterViewInit();
        }

        this.popupRef.handleAfterInit();
    }

    ngOnDestroy() {
        this.resizeObserver?.unobserve(this.divDialog);
    }

    onDragEnded(event) {
        let element = event.source.getRootElement();
        this.offsetTopWhenDrag = element.getBoundingClientRect()?.top;
    }

    private _getRenderMethod(popupRef: PopupRef): 'template' | 'string' {
        const content = popupRef.params.content as TemplateRef<any> | string;

        if (typeof content === 'string') {
            return 'string';
        }

        return 'template';
    }

    private resizeHandler() {
        this.resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target) {
                    this.divDialog.style.maxHeight =
                        window.innerHeight - (this.offsetTopWhenDrag || entry.target.offsetTop) + 'px';
                }
            }
        });

        this.resizeObserver.observe(this.divDialog);
    }

    private handleAfterViewInit() {
        this.setMinValueForOverlay();
        this.resizeHandler();
    }

    private setMinValueForOverlay() {
        const divOverlay: HTMLElement = this.popupRef.overlay.overlayElement;
        if (divOverlay) {
            divOverlay.style.minHeight = !divOverlay.style.minHeight
                ? this.divDialog.clientHeight + 'px'
                : divOverlay.style.minHeight;
            divOverlay.style.minWidth = !divOverlay.style.minWidth
                ? this.divDialog.clientWidth + 'px'
                : divOverlay.style.minWidth;
        }
    }
}
