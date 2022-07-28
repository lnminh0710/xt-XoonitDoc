import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { ModuleState } from './main-module.reducer';

export const getMainModule = (state: AppState) => state.mainModule;
export const getActiveModule = createSelector(getMainModule, (moduleState: ModuleState) => moduleState.activeModule);
export const getMainModules = createSelector(getMainModule, (moduleState: ModuleState) => moduleState.mainModules);
export const getUsingModule = createSelector(getMainModule, (moduleState: ModuleState) => moduleState.usingModule);
