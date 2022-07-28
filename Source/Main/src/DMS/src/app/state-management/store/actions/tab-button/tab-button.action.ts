import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { CustomAction } from '@app/state-management/store/actions/base';
import {
	Module
} from '@app/models';

@Injectable()
export class TabButtonActions {
	static SET_CURRENT_ACTION = '[TabButton] Set Current Action';
	setCurrentAction(actionName: string, module: Module): CustomAction {
		return {
			type: TabButtonActions.SET_CURRENT_ACTION,
			module: module,
			payload: actionName
		}
	}

	static REQUEST_CANCEL = '[TabButton] Request Cancel';
	requestCancel(module: Module, fromMediaCode?: boolean): CustomAction {
		return {
			type: TabButtonActions.REQUEST_CANCEL,
			module: module,
			payload: fromMediaCode
		};
	}

	static REQUEST_NEW = '[TabButton] Request New';
	requestNew(module: Module): CustomAction {
		return {
			type: TabButtonActions.REQUEST_NEW,
			module: module,
		};
	}

	static REQUEST_EDIT = '[TabButton] Request Edit';
	requestEdit(module: Module): CustomAction {
		return {
			type: TabButtonActions.REQUEST_EDIT,
			module: module,
		};
	}

	static REQUEST_CLONE = '[TabButton] Request Clone';
	requestClone(module: Module): CustomAction {
		return {
			type: TabButtonActions.REQUEST_CLONE,
			module: module,
		};
	}

	static DBL_CLICK_TAB_HEADER = '[TabButton] Dbl Click Tab Header';
	dblClickTabHeader(module: Module): CustomAction {
		return {
			type: TabButtonActions.DBL_CLICK_TAB_HEADER,
			module: module,
		};
	}

	static TAB_HEADER_HAS_SCROLLER = '[TabButton] Tab Header Has Scroller';
	tabHeaderHasScroller(side: string, hasScroller: boolean, module: Module): CustomAction {
		return {
			type: TabButtonActions.TAB_HEADER_HAS_SCROLLER,
			module: module,
			payload: {
				side,
				hasScroller
			}
		};
	}

	static TOGGLE = '[TabButton] Toggle';
	toggle(isShow, module: Module): CustomAction {
		return {
			type: TabButtonActions.TOGGLE,
			module: module,
			payload: isShow
		};
    }

    static REQUEST_SAVE_ONLY_WITHOUT_CONTROLLING_TAB = '[TabButton] Request Save Only Without Controlling Tab';
    requestSaveOnlyWithoutControllingTab(module: Module): CustomAction {
        return {
            type: TabButtonActions.REQUEST_SAVE_ONLY_WITHOUT_CONTROLLING_TAB,
            module: module,
        };
    }
}
