import { CustomAction } from '@app/state-management/store/actions';
import { WidgetDynamicFailedAction, WidgetDynamicFormActionNames, WidgetDynamicSuccessAction } from './widget-dynamic-form.actions';
import { IDynamicFormState } from './widget-dynamic-form.state';

const initialState = <IDynamicFormState>{

}

export function dynamicFormReducer(
    state: IDynamicFormState = initialState,
    action: CustomAction,
): IDynamicFormState {
    switch (action.type) {
        case WidgetDynamicFormActionNames.SUCCESS:
            return actionSuccessReducer(state, action as WidgetDynamicSuccessAction);

        case WidgetDynamicFormActionNames.FAILED:
            return actionFailedReducer(state, action as WidgetDynamicFailedAction);

        default:
            return state;
    }
}

function actionSuccessReducer(state: IDynamicFormState, action: WidgetDynamicSuccessAction) {
    switch (action.subType) {
        default:
            return state;
    }
}

function actionFailedReducer(state: IDynamicFormState, action: WidgetDynamicFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
