import { IconNames } from '@app/app-icon-registry.service';

export interface IconHeader {
    type: 'resource' | 'material' | 'text';
    content: string;
}

export interface PopupHeader {
    title: string;
    icon?: IconHeader;
    iconClose?: boolean;
    withTranslate?: boolean;
}
