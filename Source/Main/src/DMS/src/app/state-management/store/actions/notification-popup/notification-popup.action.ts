import { Injectable } from '@angular/core';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable({ providedIn: 'root' })
export class NotificationPopupActions {
    static OPEN_TREE_NOTIFICATION = '[Common] Open tree notification';
    openTreeNotification(payload: {
        idElement?: string;
        left?: number;
        top?: number;
        timeOutRemove?: number;
    }): CustomAction {
        return {
            type: NotificationPopupActions.OPEN_TREE_NOTIFICATION,
            payload,
        };
    }

    static UPDATE_NOTIFICATION_POSITION = '[Common] Update notification position';
    updateNotificationPosition(payload: {
        idElement?: string;
        left?: number;
        top?: number;
        timeOutRemove?: number;
    }): CustomAction {
        return {
            type: NotificationPopupActions.UPDATE_NOTIFICATION_POSITION,
            payload,
        };
    }

    static CLOSE_TREE_NOTIFICATION = '[Common] Close tree notification';
    closeTreeNotification(): CustomAction {
        return {
            type: NotificationPopupActions.CLOSE_TREE_NOTIFICATION,
        };
    }
}
