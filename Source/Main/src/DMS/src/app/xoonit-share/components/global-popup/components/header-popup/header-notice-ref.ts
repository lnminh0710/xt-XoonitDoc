import { IconNames } from '@app/app-icon-registry.service';
import { IconHeader, PopupHeader } from '../../models/popup-header.interface';

export class HeaderNoticeRef implements PopupHeader {
    title: string;
    icon?: IconHeader;
    iconClose?: boolean;
    withTranslate?: boolean;

    constructor(params?: Partial<HeaderNoticeRef>) {
        Object.assign(this, params);
        this.title = params.title || 'Notice';
        this.icon = params.icon || {
            type: 'resource',
            content: IconNames.APP_WARNING_TRIANGLE,
        };
    }
}
