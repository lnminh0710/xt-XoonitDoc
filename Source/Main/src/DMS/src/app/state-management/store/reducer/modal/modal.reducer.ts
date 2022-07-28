import { Action } from '@ngrx/store';
import { ModalActions } from '@app/state-management/store/actions';
import { CustomAction } from '@app/state-management/store/actions/base';
import { MessageModalModel } from '@app/models';

export interface ModalState {
    modalData: MessageModalModel;
    modalShowMessage: any;
    modalCloseMessage: any;
    hasTranslatePopup: any;
}

const initialState: ModalState = {
    modalData: new MessageModalModel(),
    modalShowMessage: false,
    modalCloseMessage: false,
    hasTranslatePopup: false
};

export function modalReducer(state = initialState, action: CustomAction): ModalState {
	switch (action.type) {
        case ModalActions.MODAL_SET_DATA: {
            if (action.payload)
                return Object.assign({}, state, { modalData: Object.assign({}, state.modalData, action.payload) });
            else
                return Object.assign({}, state, { modalData: {} });
        }
        case ModalActions.MODAL_SHOW_MESSAGE: {
            return Object.assign({}, state, {
                modalShowMessage: action.payload,
            });
        }
        case ModalActions.MODAL_CLOSE_MESSAGE: {
            return Object.assign({}, state, {
                modalCloseMessage: action.payload,
            });
        }
        case ModalActions.MODAL_SET_HAS_TRANSLATE_POPUP: {
            return Object.assign({}, state, {
                hasTranslatePopup: action.payload,
            });
        }
            		
		default: {
			return state;
		}
	}
}
