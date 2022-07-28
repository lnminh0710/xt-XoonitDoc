import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Module } from '@app/models';
import { CustomAction } from '../base';

@Injectable()
export class FilterActions {
    static REQUEST_LOAD_PROFILE = '[Filter] Request Load Profile';
    requestLoadProfile(profileData, module: Module): CustomAction {
        return {
            type: FilterActions.REQUEST_LOAD_PROFILE,
            payload: profileData,
            module: module
        };
    }

    static CLEAR_REQUEST_LOAD_PROFILE = '[Filter] Clear Request Load Profile';
    clearRequestLoadProfile(module: Module): CustomAction {
        return {
            type: FilterActions.CLEAR_REQUEST_LOAD_PROFILE,
            module: module
        };
    }
}
