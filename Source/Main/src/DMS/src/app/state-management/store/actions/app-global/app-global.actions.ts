import { Action } from '@ngrx/store';
import { CustomAction } from '..';
import { StructureTreeSettingsStateModel } from '../../models/app-global/state/structure-tree-settings.state.model';
import { IWidgetIsAbleToSave } from '../../models/app-global/widget-is-able-to-save.payload.model';

export enum AppGlobalActionNames {
    APP_GLOBAL_SUCCESS = '[APP] Global Success',
    APP_GLOBAL_FAILED = '[APP] Global Failed',
    APP_SAVE_GLOBAL = '[APP] Save Global',
    APP_DELETE_GLOBAL = '[APP] Delete Global',
    APP_EXPAND_DOCUMENT_FORM_GLOBAL = '[APP] Expand Document Form Global',
    APP_SAVE_STRUCTURE_TREE_SETTINGS = '[APP] App Save Structure Tree Active Folders Only',
    APP_INJECT_WIDGET_INSTANCE_IS_ABLE_TO_SAVE = '[APP] Inject Widget Instance Is Able To Save',
    APP_SAVE_ALL_WIDGETS_GLOBAL = '[APP] Save All Widgets Global'
}

export class AppGlobalSuccessAction implements CustomAction {
    public type = AppGlobalActionNames.APP_GLOBAL_SUCCESS;

    constructor(
        public subType: string,
        public payload: any,
    ) {}
}

export class AppGlobalFailedAction implements CustomAction {
    public type = AppGlobalActionNames.APP_GLOBAL_FAILED;

    constructor(
        public subType: string,
        public payload: any,
    ) {}
}

export class SaveGlobalAction implements Action {
    public type = AppGlobalActionNames.APP_SAVE_GLOBAL;
}

export class DeleteGlobalAction implements Action {
    public type = AppGlobalActionNames.APP_DELETE_GLOBAL;
}

export class ExpandDocumentFormGlobalAction implements Action {
    public type = AppGlobalActionNames.APP_EXPAND_DOCUMENT_FORM_GLOBAL;

    constructor(
        public payload: { isExpanded: boolean; acknowledge: (ack: boolean) => void }
    ) {}
}

export class SaveStructureTreeSettingsGlobalAction implements CustomAction {
    public type = AppGlobalActionNames.APP_SAVE_STRUCTURE_TREE_SETTINGS;

    constructor(
        public payload: StructureTreeSettingsStateModel
    ) {}
}

/**
 * This action is only listened by a page which dispatch from widget-dms-action.component
 */
export class AppSaveAllWidgetsGlobalAction implements CustomAction {
    public type = AppGlobalActionNames.APP_SAVE_ALL_WIDGETS_GLOBAL;

    constructor() { }
}

/**
 * This action is only listened by widget-dms-action.component
 */
export class AppInjectWigetInstanceIsAbleToSaveAction implements CustomAction {
    public type = AppGlobalActionNames.APP_INJECT_WIDGET_INSTANCE_IS_ABLE_TO_SAVE;

    constructor(public payload: IWidgetIsAbleToSave) { }
}
