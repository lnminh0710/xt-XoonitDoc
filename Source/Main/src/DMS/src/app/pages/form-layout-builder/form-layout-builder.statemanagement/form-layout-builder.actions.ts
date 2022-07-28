import { CustomAction } from '@app/state-management/store/actions';

export enum FormLayoutBuilderActionNames {
    FORM_LAYOUT_BUILDER_SUCCESS_ACTION = '[FORM LAYOUT BUILDER] Success Action',
    FORM_LAYOUT_BUILDER_FAILED_ACTION = '[FORM LAYOUT BUILDER] Failed Action',
    UPDATE_ZONE_CONTAINER_IDS_FORM_DESIGNER = '[FORM LAYOUT BUILDER] Update Zone Container Ids Form Designer',
    SET_ZONE_CONTROL_TEMPLATE_CONTAINER_ID = '[FORM LAYOUT BUILDER] Set Zone Control Template Container Id',
    UPDATE_LAYOUT_CONTROL = '[FORM LAYOUT BUILDER] Update Layout Control',
    SET_CURRENT_CONFIG_CONTROL = '[FORM LAYOUT BUILDER] Set Current Config Control',
    UPDATE_VALUE_CONTROL_SETTING = '[FORM LAYOUT BUILDER] Update Value Control Setting'
}

export class FormLayoutBuilderSuccessAction implements CustomAction {
    public type = FormLayoutBuilderActionNames.FORM_LAYOUT_BUILDER_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class FormLayoutBuilderFailedAction implements CustomAction {
    public type = FormLayoutBuilderActionNames.FORM_LAYOUT_BUILDER_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class UpdateZoneContainerIdsFormDesigner implements CustomAction {
    public type = FormLayoutBuilderActionNames.UPDATE_ZONE_CONTAINER_IDS_FORM_DESIGNER;

    constructor(
        public payload: {
            containerIds: string[];
        },
    ) {}
}

export class SetZoneControlTemplateContainerIdAction implements CustomAction {
    public type = FormLayoutBuilderActionNames.SET_ZONE_CONTROL_TEMPLATE_CONTAINER_ID;

    constructor(
        public payload: {
            containerId: string;
        },
    ) {}
}

export class UpdateLayoutControlAction implements CustomAction {
    public type = FormLayoutBuilderActionNames.UPDATE_LAYOUT_CONTROL;

    constructor(public payload?: any) { }
}

export class SetCurrentConfigControlAction implements CustomAction {
    public type = FormLayoutBuilderActionNames.SET_CURRENT_CONFIG_CONTROL;

    constructor(public payload?: any) { }
}


export class UpdateValueControlSettingAction implements CustomAction {
    public type = FormLayoutBuilderActionNames.UPDATE_VALUE_CONTROL_SETTING;

    constructor(public payload?: any) { }
}
