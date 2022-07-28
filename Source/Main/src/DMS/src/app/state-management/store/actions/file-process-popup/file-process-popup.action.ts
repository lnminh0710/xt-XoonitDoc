import { Injectable } from '@angular/core';
import { Module, SignalRNotifyModel } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class FileProcessPopUpActions {
    static FILE_PROCESS_RECEIVE_DATA = '[File Process Popup] Receive Data';
    receiveData(payload?: SignalRNotifyModel): CustomAction {
        return {
            type: FileProcessPopUpActions.FILE_PROCESS_RECEIVE_DATA,
            payload: payload,
        };
    }

    static FILE_PROCESS_SIGNALR_INIT_SUCCESS = '[File Process Popup] SignalR Init Success';
    signalRInitSuccess(payload?: any): CustomAction {
        return {
            type: FileProcessPopUpActions.FILE_PROCESS_SIGNALR_INIT_SUCCESS,
            payload: payload,
        };
    }
}
