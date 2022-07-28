import { Injectable } from '@angular/core';
import { Module } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class CloudActions {
    static VIEW_PDF = '[Cloud viewer] view pdf';
    viewPdf(data: any, module?: Module): CustomAction {
        return {
            type: CloudActions.VIEW_PDF,
            payload: data,
            module: module,
        };
    }
}
