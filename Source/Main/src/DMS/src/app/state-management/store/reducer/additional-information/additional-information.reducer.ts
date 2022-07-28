import { AdditionalInfromationTabModel } from '@app/models/additional-information/ai-tab.model';
import { CustomAction } from '@app/state-management/store/actions/base';
import { AdditionalInformationActions } from '@app/state-management/store/actions';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubAdditionalInformationState {
    isExpanded: boolean;
    showAIPane: any;
    previousState: any;
    additionalInfromationTabModel: AdditionalInfromationTabModel;
    requestSelectAiTab: any;
}

export const initialSubAdditionalInformationState: SubAdditionalInformationState = {
    isExpanded: false,
    showAIPane: null,
    previousState: null,
    additionalInfromationTabModel: null,
    requestSelectAiTab: null
};

export interface AdditionalInformationState {
    features: { [id: string]: SubAdditionalInformationState }
}

const initialState: AdditionalInformationState = {
    features: {}
};

export function additionalInformationReducer(state = initialState, action: CustomAction): AdditionalInformationState {
    switch (action.type) {
        case AdditionalInformationActions.SET_CURRENT_STATE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                isExpanded: action.payload
            });
            return Object.assign({}, state);
        }

        case AdditionalInformationActions.REQUEST_TOGGLE_PANEL: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                previousState: { showPanel: feature.isExpanded },
                showAIPane: { showPanel: action.payload }
            });
            return Object.assign({}, state);
        }

        case AdditionalInformationActions.BACK_TO_PREVIOUS_STATE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                showAIPane: feature.previousState
            });
            return Object.assign({}, state);
        }

        case AdditionalInformationActions.SELECT_SUMMARY_TAB: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                additionalInfromationTabModel: action.payload,
            });
            return Object.assign({}, state);
        }
        case AdditionalInformationActions.REQUEST_SELECT_AI_TAB: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestSelectAiTab: {
                    aiTabId: action.payload
                },
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
}