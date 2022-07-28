import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { CustomAction } from '@app/state-management/store/actions/base';
import {
	Module
} from '@app/models';

@Injectable()
export class GridActions {
	static SET_COLUMN_LAYOUT = '[Grid] Set Column Layout';
	setColumnLayout(widgetId: string, columnLayout: string, module: Module): CustomAction {
		return {
			type: GridActions.SET_COLUMN_LAYOUT,
			module: module,
			payload: {
				widgetId,
				columnLayout
			}
		};
	}

	static REQUEST_REFRESH = '[Grid] Request Refresh';
	requestRefresh(module: Module): CustomAction {
		return {
			type: GridActions.REQUEST_REFRESH,
			module: module,
		};
	}

	static REQUEST_INVALIDATE = '[Grid] Request Invalidate';
	requestInvalidate(module: Module): CustomAction {
		return {
			type: GridActions.REQUEST_INVALIDATE,
			module: module,
		};
	}
}
