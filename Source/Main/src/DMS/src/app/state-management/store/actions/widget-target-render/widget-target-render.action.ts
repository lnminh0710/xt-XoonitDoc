import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { RowData, WidgetDataUpdated, EditingWidget, RelatingWidget } from '../../reducer/widget-content-detail';
import { CustomAction } from '@app/state-management/store/actions/base';
import { Module } from '@app/models';

@Injectable()
export class WidgetTargetActions {

    static LOAD_WIDGET_TYPE_DETAIL = '[Widget_Detail] Load Widget Type Detail';
    loadWidgetTypeDetail(rowData: RowData, ofModule: Module): CustomAction {
        return {
            type: WidgetTargetActions.LOAD_WIDGET_TYPE_DETAIL,
            module: ofModule,
            payload: rowData
        };
    }
}
