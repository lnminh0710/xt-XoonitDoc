import { CustomAction } from '@app/state-management/store/actions/base';
import { IFormLayoutBuilderState } from './form-layout-builder.state';
import {
    FormLayoutBuilderActionNames,
    FormLayoutBuilderFailedAction,
    FormLayoutBuilderSuccessAction,
    SetZoneControlTemplateContainerIdAction,
    UpdateZoneContainerIdsFormDesigner,
} from './form-layout-builder.actions';

const initialState: IFormLayoutBuilderState = {
    zoneControlTemplateId: '',
    zoneContainerIds: [],
    controls: [],
    currentSettingControl: null
};

export function formLayoutBuilderReducer(
    state: IFormLayoutBuilderState = initialState,
    action: CustomAction,
): IFormLayoutBuilderState {
    switch (action.type) {
        case FormLayoutBuilderActionNames.FORM_LAYOUT_BUILDER_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as FormLayoutBuilderSuccessAction);

        case FormLayoutBuilderActionNames.FORM_LAYOUT_BUILDER_FAILED_ACTION:
            return actionFailedReducer(state, action as FormLayoutBuilderFailedAction);

        case FormLayoutBuilderActionNames.UPDATE_ZONE_CONTAINER_IDS_FORM_DESIGNER:
            const updateZonePayload = (action as UpdateZoneContainerIdsFormDesigner).payload;
            state.zoneContainerIds.splice(0, 0, ...updateZonePayload.containerIds);
            state.zoneContainerIds = Array.from(new Set(state.zoneContainerIds));
            return {
                ...state,
                zoneContainerIds: state.zoneContainerIds,
            };

        case FormLayoutBuilderActionNames.SET_ZONE_CONTROL_TEMPLATE_CONTAINER_ID:
            const setZoneCtrlTemplatePayload = (action as SetZoneControlTemplateContainerIdAction).payload;
            return {
                ...state,
                zoneControlTemplateId: setZoneCtrlTemplatePayload.containerId,
            };

        case FormLayoutBuilderActionNames.UPDATE_LAYOUT_CONTROL: {
            return {
                ...state,
                controls: [...state.controls, action.payload],
                currentSettingControl: action.payload
            };
        }

        case FormLayoutBuilderActionNames.SET_CURRENT_CONFIG_CONTROL: {
            return {
                ...state,
                currentSettingControl: action.payload
            };
        }

        default:
            return state;
    }
}

function actionSuccessReducer(state: IFormLayoutBuilderState, action: FormLayoutBuilderSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IFormLayoutBuilderState, action: FormLayoutBuilderFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
