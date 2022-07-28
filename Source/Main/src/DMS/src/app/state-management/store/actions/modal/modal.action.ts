import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class ModalActions {
    static MODAL_SET_DATA = '[MODAL] SET DATA';
    setDataForModal(data: any): CustomAction {
        return {
            type: ModalActions.MODAL_SET_DATA,
            payload: data
        };
    }

    static MODAL_SHOW_MESSAGE = '[MODAL] Show Message';
    modalShowMessage(isShow: boolean): CustomAction {
        return {
            type: ModalActions.MODAL_SHOW_MESSAGE,
            payload: isShow
        };
    }

    static MODAL_CLOSE_MESSAGE = '[MODAL] Close Message';
    modalCloseMessage(isClose: boolean): CustomAction {
        return {
            type: ModalActions.MODAL_CLOSE_MESSAGE,
            payload: isClose
        };
    }

    static MODAL_SET_HAS_TRANSLATE_POPUP = '[MODAL] Set Has Translate Popup';
    modalSetHasTranslatePopup(hasTranslatePopup: boolean): CustomAction {
        return {
            type: ModalActions.MODAL_SET_HAS_TRANSLATE_POPUP,
            payload: hasTranslatePopup
        };
    }
}
