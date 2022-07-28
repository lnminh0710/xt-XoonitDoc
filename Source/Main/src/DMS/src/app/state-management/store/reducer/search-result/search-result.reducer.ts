import { Action } from '@ngrx/store';
import { SearchResultActions } from '@app/state-management/store/actions/search-result';
import { CustomAction } from '@app/state-management/store/actions/base';

export interface SearchResultState {
	isCollapsed: boolean;
	requestTogglePanel: any;
}

const initialState: SearchResultState = {
	isCollapsed: true,
	requestTogglePanel: null
};

export function searchResultReducer(state = initialState, action: CustomAction): SearchResultState {
	switch (action.type) {
		case SearchResultActions.COLLAPSE: {
			return Object.assign({}, state, {
				isCollapsed: true
			});
		}

		case SearchResultActions.EXPAND: {
			return Object.assign({}, state, {
				isCollapsed: false
			});
		}

		case SearchResultActions.REQUEST_TOGGLE_PANEL: {
			return Object.assign({}, state, {
				requestTogglePanel: {
					isShow: action.payload
				}
			});
		}

		default: {
			return state;
		}
	}
}
