import { Action } from '@ngrx/store';
import { Module } from '@app/models';

export interface CustomAction extends Action {
    payload?: any;
    module?: Module;
    area?: string;
    browserTabId?: string;
}
