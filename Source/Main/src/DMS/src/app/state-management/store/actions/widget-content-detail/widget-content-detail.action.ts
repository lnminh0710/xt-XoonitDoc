import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { RowData, WidgetDataUpdated, EditingWidget, RelatingWidget } from '../../reducer/widget-content-detail';
import { CustomAction } from '@app/state-management/store/actions/base';
import { Module } from '@app/models';
import { BaseWidgetContainer } from '@app/shared/components/widget';

@Injectable()
export class WidgetDetailActions {

    static LOAD_WIDGET_TYPE_DETAIL = '[Widget_Detail] Load Widget Type Detail';
    loadWidgetTypeDetail(rowData: RowData, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.LOAD_WIDGET_TYPE_DETAIL,
            module: ofModule,
            payload: rowData
        };
    }

    static CLEAR_WIDGET_TYPE_DETAIL = '[Widget_Detail] Clear Widget Type Detail';
    clearWidgetTypeDetail(ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.CLEAR_WIDGET_TYPE_DETAIL,
            module: ofModule,
            payload: null
        };
    }

    static LOAD_WIDGET_TYPE_DETAIL_FOR_CAMPAIGN_MEDIA = '[Widget_Detail] Clear Widget Type Detail For Campaign Media';
    loadWidgetTypeDetailForCampaignMedia(rowData: RowData, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.LOAD_WIDGET_TYPE_DETAIL_FOR_CAMPAIGN_MEDIA,
            module: ofModule,
            payload: rowData
        };
    }

    static CLEAR_WIDGET_TYPE_DETAIL_FOR_CAMPAIGN_MEDIA = '[Widget_Detail] Clear Widget Type Detail For Campaign Media';
    clearWidgetTypeDetailForCampaignMedia(ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.CLEAR_WIDGET_TYPE_DETAIL_FOR_CAMPAIGN_MEDIA,
            module: ofModule,
            payload: null
        };
    }

    static LOAD_WIDGET_TABLE_DATA_ROWS = '[Widget_Detail] Load Widget Table Data Rows';
    loadWidgetTableDataRows(rowsData: any, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.LOAD_WIDGET_TABLE_DATA_ROWS,
            module: ofModule,
            payload: rowsData
        };
    }

    static CLEAR_WIDGET_TABLE_DATA_ROWS = '[Widget_Detail] Clear Widget Table Data Rows';
    clearWidgetTableDataRows(ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.CLEAR_WIDGET_TABLE_DATA_ROWS,
            module: ofModule,
            payload: null
        };
    }

    static SYNC_UPDATE_DATA_WIDGET = '[Widget_Detail] Sync Update Data Widget';
    syncUpdateDataWidget(widgetDataUpdate: WidgetDataUpdated, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.SYNC_UPDATE_DATA_WIDGET,
            module: ofModule,
            payload: widgetDataUpdate
        };
    }

    static ADD_WIDGET_EDITING = '[Widget_Detail] Add Widget Editing';
    addWidgetEditing(editingWidget: EditingWidget, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.ADD_WIDGET_EDITING,
            module: ofModule,
            payload: editingWidget
        };
    }

    static CANCEL_WIDGET_EDITING = '[Widget_Detail] Cancel Widget Editing';
    cancelWidgetEditing(editingWidget: EditingWidget, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.CANCEL_WIDGET_EDITING,
            module: ofModule,
            payload: editingWidget
        };
    }

    static REQUEST_SAVE = '[Widget_Detail] Request Save';
    requestSave(ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.REQUEST_SAVE,
            module: ofModule
        };
    }

    static CLEAR_REQUEST_SAVE = '[Widget_Detail] Clear Request Save';
    clearRequestSave(ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.CLEAR_REQUEST_SAVE,
            module: ofModule
        };
    }

    static REQUEST_RELOAD = '[Widget_Detail] Request reload';
    requestReload(ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.REQUEST_RELOAD,
            module: ofModule
        };
    }

    static CLEAR_REQUEST_RELOAD = '[Widget_Detail] Clear Request reload';
    clearRequestReload(ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.CLEAR_REQUEST_RELOAD,
            module: ofModule
        };
    }

    static CANCEL_ALL_WIDGET_EDITING = '[Widget_Detail] Cancel All Widget Editing';
    canceAllWidgetEditing(ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.CANCEL_ALL_WIDGET_EDITING,
            module: ofModule
        };
    }

    static HOVER_AND_DISPLAY_RELATING_WIDGET = '[Widget_Detail] Hover and display relating widget on design mode';
    hoverAndDisplayRelatingWidget(relatingWidget: RelatingWidget, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.HOVER_AND_DISPLAY_RELATING_WIDGET,
            payload: relatingWidget,
            module: ofModule
        };
    }

    static INITIALIZED_WIDGET_CONTAINER = '[Widget_Detail] Initialized widget container';
    initializedWidgetContainer(ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.INITIALIZED_WIDGET_CONTAINER,
            module: ofModule
        };
    }

    static REQUEST_REMOVE_CONNECTION_FROM_PARENT_WIDGET = '[Widget_Detail] Request Remove Connection From Parent Widget';
    requestRemoveConnectionFromParentWidget(parentWidgetId, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.REQUEST_REMOVE_CONNECTION_FROM_PARENT_WIDGET,
            module: ofModule,
            payload: parentWidgetId
        };
    }

    static REQUEST_REMOVE_CONNECTION_FROM_CHILD_WIDGET = '[Widget_Detail] Request Remove Connection From Child Widget';
    requestRemoveConnectionFromChildWidget(parentWidgetIds: Array<string>, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.REQUEST_REMOVE_CONNECTION_FROM_CHILD_WIDGET,
            module: ofModule,
            payload: parentWidgetIds
        };
    }

    static SET_CONNECT_FOR_CHILD_FROM_PARENT_WIDGET = '[Widget_Detail] Set connect for child from parent Widget';
    setConnectForChildFromParentWidget(communicationWidget: any, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.SET_CONNECT_FOR_CHILD_FROM_PARENT_WIDGET,
            module: ofModule,
            payload: communicationWidget
        };
    }

    static SET_CONNECT_FOR_PARENT_FROM_CHILD_WIDGET = '[Widget_Detail] Set connect for parent from child Widget';
    setConnectForParentFromChildWidget(communicationWidget: any, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.SET_CONNECT_FOR_PARENT_FROM_CHILD_WIDGET,
            module: ofModule,
            payload: communicationWidget
        };
    }

    static SET_CONNECT_FOR_SAME_TYPE_WIDGET = '[Widget_Detail] Set connect for same type Widget';
    setConnectForSameTypeWidget(communicationWidget: any, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.SET_CONNECT_FOR_SAME_TYPE_WIDGET,
            module: ofModule,
            payload: communicationWidget
        };
    }

    static REQUEST_REFRESH_WIDGETS_IN_TAB = '[Widget_Detail] Request Refresh Widgets In Tab';
    requestRefreshWidgetsInTab(tabId: string, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.REQUEST_REFRESH_WIDGETS_IN_TAB,
            payload: tabId,
            module: ofModule
        };
    }

    static REQUEST_RESET_WIDGET = '[Widget_Detail] Request Reset Widget';
    requestResetWidget(ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.REQUEST_RESET_WIDGET,
            module: ofModule
        };
    }

    static TOGGLE_EDIT_ALL_WIDGET_MODE = '[Widget_Detail] Toggle Edit All Widget Mode';
    toggleEditAllWidgetMode(isEditMode: boolean, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.TOGGLE_EDIT_ALL_WIDGET_MODE,
            payload: isEditMode,
            module: ofModule
        };
    }

    static SET_WIDGET_CONTAINER = '[Widget_Detail] Set Widget Container';
    setWidgetContainer(widgetContainer: BaseWidgetContainer, ofModule: Module): CustomAction {
        return {
            type: WidgetDetailActions.SET_WIDGET_CONTAINER,
            payload: widgetContainer,
            module: ofModule
        };
    }
}
