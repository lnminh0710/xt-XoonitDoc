import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { CustomAction } from '@app/state-management/store/actions/base';
import { Module } from '@app/models';

@Injectable()
export class HotKeySettingActions {

    static LOAD_HOT_KEY_SETTING = '[HotKeySetting] Load hot key setting';
    loadHotKeySetting(currentModule: Module): CustomAction {
        return {
            type: HotKeySettingActions.LOAD_HOT_KEY_SETTING,
            module: currentModule
        };
    }

    static LOAD_HOT_KEY_SETTING_SUCCESS = '[Module] Load hot key setting Success';
    loadHotKeySettingSuccess(hotKeySetting: any): CustomAction {
        return {
            type: HotKeySettingActions.LOAD_HOT_KEY_SETTING_SUCCESS,
            payload: hotKeySetting
        };
    }

    static ADD_HOT_KEY_SETTING = '[HotKeySetting] Add hot key setting';
    addHotKeySetting(controlKey: string, hotKey: string): CustomAction {
        return {
            type: HotKeySettingActions.ADD_HOT_KEY_SETTING,
            payload: {
                controlKey,
                hotKey
            }
        };
    }
}
