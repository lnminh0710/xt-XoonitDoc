import { Action } from '@ngrx/store';
import { WidgetTemplateSettingModel } from '@app/models';
import { WidgetTemplateActions } from '@app/state-management/store/actions/widget-template/index';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';
import { EnableWidgetTemplateState } from '@app/models/widget-template/enable-widget-template.model';

export interface SubWidgetTemplateSettingState {
    mainWidgetTemplateSettings: WidgetTemplateSettingModel[];
    enableWidgetTemplate: EnableWidgetTemplateState;
    //saveWidget: { [key: string]: any };
}

export const initialSubWidgetTemplateState: SubWidgetTemplateSettingState = {
    mainWidgetTemplateSettings: [],
    enableWidgetTemplate: {
        status: false,
        previousStatus: undefined,
    },
    // saveWidget: null
};

export interface WidgetTemplateSettingState {
    features: { [id: string]: SubWidgetTemplateSettingState };
}

const initialState: WidgetTemplateSettingState = {
    features: {},
};

export function widgetTemplateSettingReducer(state = initialState, action: CustomAction): WidgetTemplateSettingState {
    switch (action.type) {
        case WidgetTemplateActions.LOAD_All_WIDGET_TEMPLATE_SETTING_BY_MODULE_ID_SUCCESS: {
            let feature = baseReducer.getFeature(action, state);

            if (action.payload && action.payload.length > 0) {
                state = baseReducer.updateStateData(action, feature, state, {
                    mainWidgetTemplateSettings: [...action.payload],
                });
            } else {
                state = baseReducer.updateStateData(action, feature, state, {
                    mainWidgetTemplateSettings: [],
                });
            }

            return Object.assign({}, state);
        }
        case WidgetTemplateActions.UPDATE_EDIT_MODE_STATUS: {
            const feature = baseReducer.getFeature(action, state);
            const previousState = feature ? (feature.enableWidgetTemplate as EnableWidgetTemplateState) : feature;
            if (previousState && previousState.status === action.payload) {
                return state;
            }

            state = baseReducer.updateStateData(action, feature, state, {
                enableWidgetTemplate: <EnableWidgetTemplateState>{
                    status: action.payload,
                    previousStatus: previousState ? previousState.status : false,
                },
            });
            return Object.assign({}, state);
        }

        //case WidgetTemplateActions.SAVE_WIDGET: {
        //	let feature = baseReducer.getFeature(action, state);
        //	state = baseReducer.updateStateData(action, feature, state, {
        //		saveWidget: {
        //			payload: action.payload
        //		}
        //	});
        //	return Object.assign({}, state);
        //}

        //case WidgetTemplateActions.CLEAR_SAVE_WIDGET: {
        //	let feature = baseReducer.getFeature(action, state);
        //	state = baseReducer.updateStateData(action, feature, state, {
        //		saveWidget: null
        //	});
        //	return Object.assign({}, state);
        //}

        default: {
            return state;
        }
    }
}
