import { AppState } from '@app/state-management/store';

export interface IHistoryPageState {}

export interface State extends AppState {
    historyPageState: IHistoryPageState;
}
