import { Injectable } from '@angular/core';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable({ providedIn: 'root' })
export class UserSelectionPopupActions {
    static REFRESH_USER_LIST = '[Common] refresh user popup list';
    refreshUserPopup(): CustomAction {
        return {
            type: UserSelectionPopupActions.REFRESH_USER_LIST,
        };
    }

    static OPEN_USER_SELECTION_POPUP = '[Common] Open user selection popup';
    openUserSelectionPopup(payload: {
        widgetId: any;
        userSelected: Array<any>;
        callback?: any;
        excludeSelected?: boolean;
        userOnly?: boolean;
        idExcludeList?: any[];
    }): CustomAction {
        return {
            type: UserSelectionPopupActions.OPEN_USER_SELECTION_POPUP,
            payload,
        };
    }

    static CLOSE_USER_SELECTION_POPUP = '[Common] Close user selection popup';
    closeUserSelectionPopup(payload: { userSelected: Array<any>; widgetId: any }): CustomAction {
        return {
            type: UserSelectionPopupActions.CLOSE_USER_SELECTION_POPUP,
            payload,
        };
    }
}
