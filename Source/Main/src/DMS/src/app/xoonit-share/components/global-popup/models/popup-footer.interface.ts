import { ThemePalette } from '@xn-control/light-material-ui/core';

export interface ButtonPopupFooter {
    color: ThemePalette | '';
    buttonType: 'flat' | 'raised' | 'stroked' | 'basic';
    text: string;
    onClick?: (data?: any) => void;
}

export interface PopupFooter {
    justifyContent: 'full' | 'wrap';
    buttons: ButtonPopupFooter[];
}
