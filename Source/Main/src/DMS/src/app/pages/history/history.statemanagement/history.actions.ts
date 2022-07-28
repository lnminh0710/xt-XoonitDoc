import { CustomAction } from '@app/state-management/store/actions';
import { ScanningHistoryFilter } from './model/payload/scanning-history-filter.payload.model';

export enum HistoryActionNames {
    HISTORY_SUCCESS_ACTION = '[HISTORY] Success Action',
    HISTORY_FAILED_ACTION = '[HISTORY] Failed Action',
    GET_SCANNING_HISTORY = '[HISTORY] Get Scanning History',
    GET_SCANNING_HISTORY_DETAIL = '[HISTORY] Get Scanning History Detail',
    GET_HISTORY_USER = '[HISTORY] Get History User',
    GET_CONTROLS_FILTER = '[HISTORY] Get Controls Filter',
    DRAG_SPLITTER_END = '[HISTORY] Drag Splitter End',
}

export class HistorySuccessAction implements CustomAction {
    public type = HistoryActionNames.HISTORY_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class HistoryFailedAction implements CustomAction {
    public type = HistoryActionNames.HISTORY_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class GetScanningHistoryAction implements CustomAction {
    public type = HistoryActionNames.GET_SCANNING_HISTORY;

    constructor(public payload: ScanningHistoryFilter) {}
}

export class GetScanningHistoryDetailAction implements CustomAction {
    public type = HistoryActionNames.GET_SCANNING_HISTORY_DETAIL;

    constructor(public payload: any) {}
}

export class GetControlsFilter implements CustomAction {
    public type = HistoryActionNames.GET_CONTROLS_FILTER;

    constructor() {}
}

export class GetHistoryUser implements CustomAction {
    public type = HistoryActionNames.GET_HISTORY_USER;

    constructor(public payload: string) {}
}

export class DragSplitterEndAction implements CustomAction {
    public type = HistoryActionNames.DRAG_SPLITTER_END;

    constructor(public payload: { leftHorizontal: number; rightHorizontal: number }) {}
}
