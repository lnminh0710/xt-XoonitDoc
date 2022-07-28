import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import {
	SearchResultItemModel,
	Module
} from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class SearchResultActions {
	static COLLAPSE = '[SearchResult] Collapse';
	collapse(): CustomAction {
		return {
			type: SearchResultActions.COLLAPSE
		}
	}

	static EXPAND = '[SearchResult] Expand';
	expand(): CustomAction {
		return {
			type: SearchResultActions.EXPAND
		}
	}

	static REQUEST_TOGGLE_PANEL = '[SearchResult] Request Toggle Panel';
	requestTogglePanel(isShow): CustomAction {
		return {
			type: SearchResultActions.REQUEST_TOGGLE_PANEL,
			payload: isShow
		}
	}
}
