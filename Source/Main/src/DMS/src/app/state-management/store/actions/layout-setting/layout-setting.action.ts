import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { SearchResultItemModel, Module } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class LayoutSettingActions {
    static REQUEST_TOGGLE_PANEL = '[LayoutSetting] Request Toggle Panel';
    requestTogglePanel(isShow, module): CustomAction {
        return {
            type: LayoutSettingActions.REQUEST_TOGGLE_PANEL,
            module: module,
            payload: isShow,
        };
    }

    static UPDATE_EDIT_MODE_STATUS = '[LayoutSetting] UPDATE EDIT MODE STATUS';
    updateEditModeStatus(status: boolean, module: Module): CustomAction {
        return {
            type: LayoutSettingActions.UPDATE_EDIT_MODE_STATUS,
            module: module,
            payload: status,
        };
    }

    static REFRESH_STATE_UPDATE_EDIT_MODE = '[LayoutSetting] REFRESH STATE UPDATE EDIT MODE';
    refreshStateWhenChangeEditMode(module: Module): CustomAction {
        return {
            type: LayoutSettingActions.REFRESH_STATE_UPDATE_EDIT_MODE,
            module: module,
        };
    }
}
