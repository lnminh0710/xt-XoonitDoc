import { IconNames } from '@app/app-icon-registry.service';
import { IconHeader, PopupHeader } from '../../models/popup-header.interface';

export class HeaderConfirmationRef implements PopupHeader {
    title: string;
    icon?: IconHeader;
    iconClose?: boolean;

    constructor(params?: Partial<HeaderConfirmationRef>) {
        Object.assign(this, params);
        this.title = 'Confirmation';
        this.icon = {
            type: 'resource',
            content: IconNames.APP_WARNING_TRIANGLE,
        }
    }
}
