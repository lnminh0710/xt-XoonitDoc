import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, Type } from '@angular/core';
import { PopupFooter } from '../../models/popup-footer.interface';
import { PopupRef } from '../../popup-ref';
import { cloneDeep } from 'lodash-es';
import { popupAnimation } from '@app/xoonit-share/animations/popup.animation';
declare const ResizeObserver: any;
@Component({
    selector: 'component-template-popup',
    styleUrls: ['component-template-popup.component.scss'],
    templateUrl: 'component-template-popup.component.html',
    animations: [popupAnimation],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentTemplatePopupComponent implements OnInit {
    public body: Type<any>;
    public footer: PopupFooter;
    public data: any;
    public optionResize: boolean;
    private divDialog: HTMLElement;
    private resizeObserver: any;
    private offsetTopWhenDrag: number;
    public defaultWidth: string;
    public defaultHeight: string;
    public optionDrapDrop: boolean;
    public customBackground: string;

    constructor(private popupRef: PopupRef) {
        const params = this.popupRef.params;

        this.body = params.content as Type<any>;
        this.footer = cloneDeep(params.footer);
        this.data = cloneDeep(params.data);
        this.optionResize = params.optionResize;
        this.defaultWidth = params.defaultWidth || params.minWidth + 'px';
        this.defaultHeight = params.defaultHeight || params.minHeight + 'px';
        this.optionDrapDrop = params.optionDrapDrop;
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
        this.resizeObserver.unobserve(this.divDialog);
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

    public close() {
        this.popupRef.close(this.data);
    }
}
