import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { ElementRef } from '@angular/core';

export interface IPopupConfig {
    width?: string | number;
    height?: string | number;
    origin?: ElementRef | HTMLElement;
    position?: ConnectionPositionPair[];
    offsetY?: number;
    offsetX?: number;
    disableCloseOutside?: boolean;
    hasBackdrop?: boolean;
    minHeight?: string | number;
    minWidth?: string | number;
}
