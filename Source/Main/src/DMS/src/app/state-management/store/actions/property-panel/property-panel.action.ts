import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import {
    WidgetPropertyModel,
    WidgetPropertiesStateModel,
    Module
} from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class PropertyPanelActions {
    static TOGGLE_PANEL = '[PropertyPanel] Toggle Panel';
    togglePanel(module: Module, isExpand, propertiesParentData?, properties?: WidgetPropertyModel[], isGlobal?): CustomAction {
        return {
            type: PropertyPanelActions.TOGGLE_PANEL,
            module: module,
            payload: {
                isExpand,
                isGlobal,
                propertiesParentData,
                properties
            }
        };
    }

    static UPDATE_GLOBAL_PROPERTY = '[PropertyPanelGlobal] Update Properties';
    requestUpdateGlobalProperty(properties: any, module: Module): CustomAction {
        return {
            type: PropertyPanelActions.UPDATE_GLOBAL_PROPERTY,
            module: module,
            payload: properties
        };
    }

    static CLEAR_PROPERTIES = '[PropertyPanel] Clear Properties';
    clearProperties(module: Module): CustomAction {
        return {
            type: PropertyPanelActions.CLEAR_PROPERTIES,
            module: module,
        };
    }

    static REQUEST_SAVE = '[PropertyPanel] Request Save';
    requestSave(propertiesParentData: any, module: Module): CustomAction {
        return {
            type: PropertyPanelActions.REQUEST_SAVE,
            module: module,
            payload: propertiesParentData
        };
    }

    static REQUEST_SAVE_GLOBAL = '[PropertyPanelGlobal] Request Save Data';
    requestSaveGlobal(globalProperties: WidgetPropertyModel[], module: Module): CustomAction {
        return {
            type: PropertyPanelActions.REQUEST_SAVE_GLOBAL,
            module: module,
            payload: globalProperties
        };
    }

    static REQUEST_APPLY = '[PropertyPanel] Request Apply';
    requestApply(propertiesParentData: any, module: Module): CustomAction {
        return {
            type: PropertyPanelActions.REQUEST_APPLY,
            module: module,
            payload: propertiesParentData
        };
    }

    static UPDATE_PROPERTIES = '[PropertyPanel] Update Properties';
    updateProperties(propertiesState: WidgetPropertiesStateModel, module: Module): CustomAction {
        return {
            type: PropertyPanelActions.UPDATE_PROPERTIES,
            module: module,
            payload: propertiesState
        };
    }

    static CLEAR_REQUEST_UPDATE_PROPERTIES = '[PropertyPanel] Clear Request Update Properties';
    clearRequestUpdateProperties(module: Module): CustomAction {
        return {
            type: PropertyPanelActions.CLEAR_REQUEST_UPDATE_PROPERTIES,
            module: module,
        };
    }

    static REQUEST_CLEAR_PROPERTIES = '[PropertyPanel] Request Clear Properties';
    requestClearProperties(module: Module): CustomAction {
        return {
            type: PropertyPanelActions.REQUEST_CLEAR_PROPERTIES,
            module: module,
        };
    }

    static REQUEST_CLEAR_PROPERTIES_SUCCESS = '[PropertyPanel] Request Clear Properties Success';
    requestClearPropertiesSuccess(module: Module): CustomAction {
        return {
            type: PropertyPanelActions.REQUEST_CLEAR_PROPERTIES_SUCCESS,
            module: module,
        };
    }

    static REQUEST_ROLLBACK_PROPERTIES = '[PropertyPanel] Request Rollback Properties';
    requestRollbackProperties(data: any, module: Module): CustomAction {
        return {
            type: PropertyPanelActions.REQUEST_ROLLBACK_PROPERTIES,
            module: module,
            payload: data
        };
    }
}
