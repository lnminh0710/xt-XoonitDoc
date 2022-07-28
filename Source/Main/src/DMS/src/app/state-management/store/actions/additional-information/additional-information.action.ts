import { Injectable } from '@angular/core';
import { CustomAction } from '@app/state-management/store/actions/base';
import {
    AdditionalInfromationTabModel,
    Module
} from '@app/models';

@Injectable()
export class AdditionalInformationActions {
    static SET_CURRENT_STATE = '[AdditionalInformationActions] Set Current State';
    setCurrentState(currentState, module: Module): CustomAction {
        return {
            type: AdditionalInformationActions.SET_CURRENT_STATE,
            module: module,
            payload: currentState
        }
    }

    static REQUEST_TOGGLE_PANEL = '[AdditionalInformationActions] Request Toggle Panel';
    requestTogglePanel(showAIPane, module: Module): CustomAction {
        return {
            type: AdditionalInformationActions.REQUEST_TOGGLE_PANEL,
            module: module,
            payload: showAIPane
        }
    }

    static BACK_TO_PREVIOUS_STATE = '[AdditionalInformationActions] Back To Previous State';
    backToPreviousState(module: Module): CustomAction {
        return {
            type: AdditionalInformationActions.BACK_TO_PREVIOUS_STATE,
            module: module,
        }
    }

    static REQUEST_RESIZE = '[AdditionalInformationActions] Request Resize';
    requestResize(module: Module): CustomAction {
        return {
            type: AdditionalInformationActions.REQUEST_RESIZE,
            module: module,
        }
    }

    static SELECT_SUMMARY_TAB = '[AdditionalInformationActions] Select Summary Tab';
    selectAdditionalInformationTab(tabz: AdditionalInfromationTabModel, module: Module): CustomAction {
        return {
            type: AdditionalInformationActions.SELECT_SUMMARY_TAB,
            module: module,
            payload: tabz
        };
    }

    static REQUEST_SELECT_AI_TAB = '[AdditionalInformationActions] Request Select Ai Tab';
    requestSelectAiTab(aiTabId: string, module: Module): CustomAction {
        return {
            type: AdditionalInformationActions.REQUEST_SELECT_AI_TAB,
            module: module,
            payload: aiTabId
        };
    }

    static REQUEST_TOGGLE_AI_TAB = '[AdditionalInformationActions] Request Toggle AI Tab';
    requestOpenAiTab(payload: boolean, module: Module): CustomAction {
        return {
            type: AdditionalInformationActions.REQUEST_TOGGLE_AI_TAB,
            module: module,
            payload,
        };
    }
}
