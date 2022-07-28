import { TestBed } from '@angular/core/testing';
import { AuthenType } from '@app/app.constants';
import { AdditionalInfromationTabModel, Module, ParkedItemModel, TabSummaryModel, UserToken } from '@app/models';
import { ModuleActions } from './module.action';

describe('ModuleActions', () => {
    let action: ModuleActions;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
            ],
            declarations: [
            ],
            providers: [
                ModuleActions,
            ]
        });

        action = TestBed.inject(ModuleActions);
    });

    it('should be created', () => {
        expect(action).toBeTruthy();
    });

    describe('loadMainModules', () => {
        it('call loadMainModules success', () => {
            const result = action.loadMainModules();

            expect(result.type).toEqual(ModuleActions.LOAD_MAIN_MODULES);
        });
    });

    describe('loadMainModulesSuccess', () => {
        it('call loadMainModulesSuccess success', () => {
            const data = <Module[]>[
                <Module>{ idSettingsGUI: 1 }
            ];

            const result = action.loadMainModulesSuccess(data);

            expect(result.type).toEqual(ModuleActions.LOAD_MAIN_MODULES_SUCCESS);
            expect(result.payload).toEqual(data);
        });
    });

    describe('activeModule', () => {
        it('call activeModule success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.activeModule(data);

            expect(result.type).toEqual(ModuleActions.ACTIVE_MODULE);
            expect(result.payload).toEqual(data);
        });
    });

    describe('activeSubModule', () => {
        it('call activeSubModule success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.activeSubModule(data);

            expect(result.type).toEqual(ModuleActions.ACTIVE_SUB_MODULE);
            expect(result.payload).toEqual(data);
        });
    });

    describe('getSubModuleSuccess', () => {
        it('call getSubModuleSuccess success', () => {
            const data = <Module[]>[
                <Module>{ idSettingsGUI: 1 }
            ];

            const result = action.getSubModuleSuccess(data);

            expect(result.type).toEqual(ModuleActions.GET_SUB_MODULE_SUCCESS);
            expect(result.payload).toEqual(data);
        });
    });

    describe('clearSubModules', () => {
        it('call clearSubModules success', () => {
            const result = action.clearSubModules();

            expect(result.type).toEqual(ModuleActions.CLEAR_SUB_MODULES);
        });
    });

    describe('clearActiveModule', () => {
        it('call clearActiveModule success', () => {
            const result = action.clearActiveModule();

            expect(result.type).toEqual(ModuleActions.CLEAR_ACTIVE_MODULE);
        });
    });

    describe('clearActiveSubModule', () => {
        it('call clearActiveSubModule success', () => {
            const result = action.clearActiveSubModule();

            expect(result.type).toEqual(ModuleActions.CLEAR_ACTIVE_SUB_MODULE);
        });
    });

    describe('addWorkingModule', () => {
        it('call addWorkingModule success', () => {
            const workingModule = <Module>{ idSettingsGUI: 1 };
            const subModules = [];
            const parkedItems = [];
            const fieldConfig = [];
            const loadFromSetting = false;

            const result = action.addWorkingModule(workingModule, subModules, parkedItems, fieldConfig, loadFromSetting);

            expect(result.type).toEqual(ModuleActions.ADD_WORKING_MODULE);
            expect(result.payload.workingModule).toEqual(workingModule);
            expect(result.payload.subModules).toEqual(subModules);
            expect(result.payload.parkedItems).toEqual(parkedItems);
            expect(result.payload.fieldConfig).toEqual(fieldConfig);
            expect(result.payload.loadFromSetting).toEqual(loadFromSetting);
        });
    });

    describe('removeWorkingModule', () => {
        it('call removeWorkingModule success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.removeWorkingModule(data);

            expect(result.type).toEqual(ModuleActions.REMOVE_WORKING_MODULE);
            expect(result.payload.workingModule).toEqual(data);
        });
    });

    describe('resetSelectingWorkingModuleParkedItem', () => {
        it('call resetSelectingWorkingModuleParkedItem success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.resetSelectingWorkingModuleParkedItem(data);

            expect(result.type).toEqual(ModuleActions.RESET_SELECTING_WORKING_MODULE_PARKED_ITEM);
            expect(result.payload).toEqual(data);
        });
    });

    describe('moveSelectedParkedItemToTop', () => {
        it('call moveSelectedParkedItemToTop success', () => {
            const data = <Module>{ idSettingsGUI: 1 };
            const selectedParkedItem = <ParkedItemModel>{ id: { value: 1 } };

            const result = action.moveSelectedParkedItemToTop(data, selectedParkedItem);

            expect(result.type).toEqual(ModuleActions.MOVE_SELECTED_PARKED_ITEM_TO_TOP);
            expect(result.payload.workingModule).toEqual(data);
            expect(result.payload.selectedParkedItem).toEqual(selectedParkedItem);
        });
    });

    describe('storeModuleStates', () => {
        it('call storeModuleStates success', () => {
            const data = <Module>{ idSettingsGUI: 1 };
            const selectedParkedItem = <ParkedItemModel>{ id: { value: 1 } };
            const selectedTab = <TabSummaryModel>{ active: true };
            const selectedAiTab = <AdditionalInfromationTabModel>{ TabID: '1' };

            const result = action.storeModuleStates(data, selectedParkedItem, selectedTab, selectedAiTab);

            expect(result.type).toEqual(ModuleActions.STORE_MODULE_STATES);
            expect(result.payload.currentModule).toEqual(data);
            expect(result.payload.selectedParkedItem).toEqual(selectedParkedItem);
            expect(result.payload.selectedTab).toEqual(selectedTab);
            expect(result.payload.selectedAiTab).toEqual(selectedAiTab);
        });
    });

    describe('clearModuleState', () => {
        it('call clearModuleState success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.clearModuleState(data);

            expect(result.type).toEqual(ModuleActions.CLEAR_MODULE_STATE);
            expect(result.payload).toEqual(data);
        });
    });

    describe('requestCreateNewModuleItem', () => {
        it('call requestCreateNewModuleItem success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.requestCreateNewModuleItem(data);

            expect(result.type).toEqual(ModuleActions.REQUEST_CREATE_NEW_MODULE_ITEM);
            expect(result.payload).toEqual(data);
        });
    });

    describe('searchKeywordModule', () => {
        it('call searchKeywordModule success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.searchKeywordModule(data);

            expect(result.type).toEqual(ModuleActions.SEARCH_KEYWORD_MODULE);
            expect(result.payload).toEqual(data);
        });
    });

    describe('setUsingModule', () => {
        it('call setUsingModule success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.setUsingModule(data);

            expect(result.type).toEqual(ModuleActions.SET_USING_MODULE);
            expect(result.payload).toEqual(data);
        });
    });

    describe('clearUsingModule', () => {
        it('call clearUsingModule success', () => {
            const result = action.clearUsingModule();

            expect(result.type).toEqual(ModuleActions.CLEAR_USING_MODULE);
        });
    });

    describe('requestChangeModule', () => {
        it('call requestChangeModule success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.requestChangeModule(data);

            expect(result.type).toEqual(ModuleActions.REQUEST_CHANGE_MODULE);
            expect(result.payload).toEqual(data);
        });
    });

    describe('clearRequestChangeModule', () => {
        it('call clearRequestChangeModule success', () => {
            const result = action.clearRequestChangeModule();

            expect(result.type).toEqual(ModuleActions.CLEAR_REQUEST_CHANGE_MODULE);
        });
    });

    describe('requestChangeSubModule', () => {
        it('call requestChangeSubModule success', () => {
            const requestedModuleId = 1;
            const requestedSubModuleId = 1;
            const result = action.requestChangeSubModule(requestedModuleId, requestedSubModuleId);

            expect(result.type).toEqual(ModuleActions.REQUEST_CHANGE_SUB_MODULE);
            expect(result.payload.requestedModuleId).toEqual(requestedModuleId);
            expect(result.payload.requestedSubModuleId).toEqual(requestedSubModuleId);
        });
    });

    describe('clearRequestChangeSubModule', () => {
        it('call clearRequestChangeSubModule success', () => {
            const result = action.clearRequestChangeSubModule();

            expect(result.type).toEqual(ModuleActions.CLEAR_REQUEST_CHANGE_SUB_MODULE);
        });
    });

    describe('toggleIsWorkingModulesDragging', () => {
        it('call toggleIsWorkingModulesDragging success', () => {
            const isDragging = true;
            const result = action.toggleIsWorkingModulesDragging(isDragging);

            expect(result.type).toEqual(ModuleActions.TOGGLE_IS_WORKING_MODULES_DRAGGING);
            expect(result.payload).toEqual(isDragging);
        });
    });

    describe('removeAllParkedItemsOfWorkingModule', () => {
        it('call removeAllParkedItemsOfWorkingModule success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.removeAllParkedItemsOfWorkingModule(data);

            expect(result.type).toEqual(ModuleActions.REMOVE_ALL_PARKED_ITEMS_OF_WORKING_MODULE);
            expect(result.payload).toEqual(data);
        });
    });

    describe('removeParkedItemOfWorkingModule', () => {
        it('call removeParkedItemOfWorkingModule success', () => {
            const data = <Module>{ idSettingsGUI: 1 };
            const parkedItem = <ParkedItemModel>{ id: { value: 1 } };

            const result = action.removeParkedItemOfWorkingModule(data, parkedItem);

            expect(result.type).toEqual(ModuleActions.REMOVE_PARKED_ITEM_OF_WORKING_MODULE);
            expect(result.payload.module).toEqual(data);
            expect(result.payload.parkedItem).toEqual(parkedItem);
        });
    });

    describe('addDirtyModule', () => {
        it('call addDirtyModule success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.addDirtyModule(data);

            expect(result.type).toEqual(ModuleActions.ADD_DIRTY_MODULE);
            expect(result.payload.module).toEqual(data);
        });
    });

    describe('removeDirtyModule', () => {
        it('call removeDirtyModule success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.removeDirtyModule(data);

            expect(result.type).toEqual(ModuleActions.REMOVE_DIRTY_MODULE);
            expect(result.payload.module).toEqual(data);
        });
    });

    describe('updateModuleStateFromLocalStorage', () => {
        it('call updateModuleStateFromLocalStorage success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.updateModuleStateFromLocalStorage(data);

            expect(result.type).toEqual(ModuleActions.UPDATE_MODULE_STATE_FROM_LOCAL_STORAGE);
            expect(result.payload).toEqual(data);
        });
    });

    describe('requestTriggerClickNewFromModule', () => {
        it('call requestTriggerClickNewFromModule success', () => {
            const data = <Module>{ idSettingsGUI: 1 };

            const result = action.requestTriggerClickNewFromModule(data);

            expect(result.type).toEqual(ModuleActions.REQUEST_TRIGGER_CLICK_NEW_FROM_MODULE);
            expect(result.payload).toEqual(data);
        });
    });

    describe('loginSuccess', () => {
        it('call loginSuccess success', () => {
            const result = action.loginSuccess();

            expect(result.type).toEqual(ModuleActions.LOGIN_SUCCESS);
        });
    });

    describe('requestToChangeActiveModuleName', () => {
        it('call requestToChangeActiveModuleName success', () => {
            const data = { activeModule: <Module>{ idSettingsGUI: 1 }, moduleName: 'moduleName' };

            const result = action.requestToChangeActiveModuleName(data);

            expect(result.type).toEqual(ModuleActions.REQUEST_CHANGE_ACTIVE_MODULE_NAME);
            expect(result.payload).toEqual(data);
        });
    });

    describe('sendTokenUpdatePasswordAction', () => {
        it('call sendTokenUpdatePasswordAction success', () => {
            const data = <UserToken>{ token: 'token' };

            const result = action.sendTokenUpdatePasswordAction(data);

            expect(result.type).toEqual(ModuleActions.SEND_TOKEN_UPDATE_PASSWORD);
            expect(result.payload).toEqual(data);
        });
    });

    describe('sendTypeAuthenActionSuccess', () => {
        it('call sendTypeAuthenActionSuccess success', () => {
            const data = AuthenType.SIGN_IN;

            const result = action.sendTypeAuthenActionSuccess(data);

            expect(result.type).toEqual(ModuleActions.SEND_TYPE_ACTION_AUTHEN_SUCCESS);
            expect(result.payload).toEqual(data);
        });
    });

    describe('getCompany', () => {
        it('call getCompany success', () => {
            const data = 'company';

            const result = action.getCompany(data);

            expect(result.type).toEqual(ModuleActions.GET_COMPANY);
            expect(result.payload).toEqual(data);
        });
    });
});