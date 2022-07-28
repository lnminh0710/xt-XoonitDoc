import { Action } from '@ngrx/store';
import { PropertyPanelActions } from '@app/state-management/store/actions';
import {
    WidgetPropertyModel,
    WidgetPropertiesStateModel
} from '@app/models';
import cloneDeep from 'lodash-es/cloneDeep';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubPropertyPanelState {
    isExpand: boolean;
    isGlobal: boolean;
    propertiesParentData: any;
    globalProperties: any[];
    properties: any;
    requestSave: any;
    requestUpdateProperties: WidgetPropertiesStateModel;
    requestRollbackProperties: any;
    requestApply: any;
    requestSaveGlobal: any;
}

export const initialSubPropertyPanelState: SubPropertyPanelState = {
    isExpand: false,
    isGlobal: false,
    propertiesParentData: null,
    globalProperties: [],
    properties: null,
    requestSave: null,
    requestUpdateProperties: null,
    requestRollbackProperties: null,
    requestApply: null,
    requestSaveGlobal: null
};

export interface PropertyPanelState {
    features: { [id: string]: SubPropertyPanelState }
}

const initialState: PropertyPanelState = {
    features: {}
};

export function propertyPanelReducer(state = initialState, action: CustomAction): PropertyPanelState {
    switch (action.type) {
        case PropertyPanelActions.TOGGLE_PANEL: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                isExpand: action.payload.isExpand,
                isGlobal: action.payload.isGlobal,
                propertiesParentData: action.payload.propertiesParentData || null,
                properties: action.payload.properties || []
            });
            return Object.assign({}, state);
        }

        case PropertyPanelActions.UPDATE_GLOBAL_PROPERTY: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                globalProperties: cloneDeep(action.payload)
            });
            return Object.assign({}, state);
        }

        case PropertyPanelActions.CLEAR_PROPERTIES: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                isExpand: false,
                isGlobal: false,
                propertiesParentData: null,
                properties: null,
                requestSave: null,
                requestUpdateProperties: null,
                requestSaveGlobal: null,
                requestRollbackProperties: null
            });
            return Object.assign({}, state);
        }

        case PropertyPanelActions.REQUEST_ROLLBACK_PROPERTIES: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestRollbackProperties: action.payload
            });
            return Object.assign({}, state);
        }

        case PropertyPanelActions.REQUEST_SAVE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestSave: {
                    propertiesParentData: action.payload
                }
            });
            return Object.assign({}, state);
        }

        case PropertyPanelActions.REQUEST_SAVE_GLOBAL: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestSaveGlobal: {
                    globalProperties: action.payload
                },
                globalProperties: cloneDeep(action.payload)
            });
            return Object.assign({}, state);
        }

        case PropertyPanelActions.REQUEST_APPLY: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestApply: {
                    propertiesParentData: action.payload
                }
            });
            return Object.assign({}, state);
        }

        case PropertyPanelActions.UPDATE_PROPERTIES: {
            let feature = baseReducer.getFeature(action, state);

            const payload = action.payload as WidgetPropertiesStateModel;
            state = baseReducer.updateStateData(action, feature, state, {
                requestUpdateProperties: {
                    widgetData: payload.widgetData,
                    widgetProperties: payload.widgetProperties
                }
            });
            return Object.assign({}, state);
        }

        case PropertyPanelActions.CLEAR_REQUEST_UPDATE_PROPERTIES: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestUpdateProperties: null
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
}
