import { PopupContent } from '../popup-ref';
import { IPopupConfig } from './popup-config.interface';
import { PopupFooter } from './popup-footer.interface';
import { PopupHeader } from './popup-header.interface';

export interface PopupParams<T> extends IPopupConfig {
    readonly content: PopupContent;
    data?: T;
    readonly header?: PopupHeader;
    readonly footer?: PopupFooter;
    optionResize?: boolean;
    optionDrapDrop?: boolean;
    defaultWidth?: any;
    defaultHeight?: any;
    containerClass?: string;
    containerStyle?: string;
    customBackground?: string;
}
