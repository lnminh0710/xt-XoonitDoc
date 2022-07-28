import { Action } from '@ngrx/store';
import { TabButtonActions } from '@app/state-management/store/actions';
import { TabButtonActionConst } from '@app/app.constants';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubTabButtonState {
    currentAction: string;
	tabHeaderHasScroller: any;
	isShow: boolean;
}

export const initialSubTabButtonState: SubTabButtonState = {
    currentAction: TabButtonActionConst.FIRST_LOAD,
	tabHeaderHasScroller: null,
    isShow: false
};

export interface TabButtonState {
    features: { [id: string]: SubTabButtonState }
}

const initialState: TabButtonState = {
    features: {}
};

export function tabButtonReducer(state = initialState, action: CustomAction): TabButtonState {
    switch (action.type) {
        case TabButtonActions.SET_CURRENT_ACTION: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                currentAction: action.payload
            });
            return Object.assign({}, state);
        }

        case TabButtonActions.TAB_HEADER_HAS_SCROLLER: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                tabHeaderHasScroller: action.payload
            });
            return Object.assign({}, state);
		}

		case TabButtonActions.TOGGLE: {
			let feature = baseReducer.getFeature(action, state);
			state = baseReducer.updateStateData(action, feature, state, {
				isShow: action.payload
			});
			return Object.assign({}, state);
		}

        default: {
            return state;
        }
    }
}
