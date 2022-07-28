import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import {
    WidgetTemplateSettingModel,
    Module
} from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentContainerOcrStateModel } from '../../models/administration-document/state/document-container-ocr.state.model';

@Injectable()
export class WidgetTemplateActions {
    static LOAD_All_WIDGET_TEMPLATE_SETTING_BY_MODULE_ID = '[WidgetTemplateSettingModel] LOAD All WIDGET TEMPLATE SETTING BY MODULE ID';
    loadWidgetTemplateSetting(moduleId: number, module: Module): CustomAction {
        return {
            type: WidgetTemplateActions.LOAD_All_WIDGET_TEMPLATE_SETTING_BY_MODULE_ID,
            module: module,
            payload: moduleId
        };
    }

    static LOAD_All_WIDGET_TEMPLATE_SETTING_BY_MODULE_ID_SUCCESS = '[WidgetTemplateSettingModel] LOAD All WIDGET TEMPLATE SETTING BY MODULE ID Successfully';
    loadWidgetTemplateSettingSuccess(widgetTemplateSettings: WidgetTemplateSettingModel[], module: Module): CustomAction {
        return {
            type: WidgetTemplateActions.LOAD_All_WIDGET_TEMPLATE_SETTING_BY_MODULE_ID_SUCCESS,
            module: module,
            payload: widgetTemplateSettings
        };
    }

    static UPDATE_EDIT_MODE_STATUS = '[WidgetTemplateSettingModel] UPDATE EDIT MODE STATUS';
    updateEditModeStatus(status: boolean, module: Module): CustomAction {
        return {
            type: WidgetTemplateActions.UPDATE_EDIT_MODE_STATUS,
            module: module,
            payload: status
        };
    }

    static TOGGLE_WIDGET_TEMPLATE_SETTING_PANEL = '[WidgetTemplateSettingModel] TOGGLE WIDGET TEMPLATE SETTING PANEL';
    toggleWidgetTemplateSettingPanel(status: boolean, module: Module): CustomAction {
        return {
            type: WidgetTemplateActions.TOGGLE_WIDGET_TEMPLATE_SETTING_PANEL,
            module: module,
            payload: status
        };
    }

    static SAVE_WIDGET = '[WidgetTemplateSettingModel] SAVE WIDGET';
    saveWidget(module: Module): CustomAction {
        return {
            type: WidgetTemplateActions.SAVE_WIDGET,
            module: module
        };
    }

    static RESET_WIDGET = '[WidgetTemplateSettingModel] RESET WIDGET';
    resetWidget(module: Module): CustomAction {
        return {
            type: WidgetTemplateActions.RESET_WIDGET,
            module: module
        };
    }

    static CLEAR_SAVE_WIDGET = '[WidgetTemplateSettingModel] CLEAR SAVE WIDGET';
    clearSaveWidget(module: Module): CustomAction {
        return {
            type: WidgetTemplateActions.CLEAR_SAVE_WIDGET,
            module: module,
        };
    }
}