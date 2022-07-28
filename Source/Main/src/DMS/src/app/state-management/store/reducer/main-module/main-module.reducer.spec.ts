import { TestBed } from '@angular/core/testing';
import { Module } from '@app/models/module';
import { ModuleState } from '..';
import { ModuleActions } from '../../actions/main-module';
import { mainModuleStateReducer } from './main-module.reducer';

describe('Main Module Reducer', () => {
    let initialState: ModuleState;

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

        initialState = {
            mainModules: [],
            activeModule: {},
            activeSubModule: {},
            subModules: [],
            workingModules: [],
            moduleStates: [],
            requestCreateNewModuleItem: null,
            searchingModule: {},
            usingModule: null,
            requestChangeModule: null,
            requestChangeSubModule: null,
            isWorkingModulesDragging: false,
            dirtyModules: [],
            companyName: 'Test',
        };
    });

    it('should be created', () => {
        expect(initialState).toBeTruthy();
    });

    describe('mainModuleStateReducer', () => {
        describe('reducer type default', () => {
            it('should handle initial state', () => {
                expect(mainModuleStateReducer(undefined, <any>{})).toEqual(initialState);
            });
        });

        describe('reducer Load Main Modules', () => {
            it('reducer Load Main Modules Success', () => {
                const action = {
                    type: ModuleActions.LOAD_MAIN_MODULES_SUCCESS,
                    payload: [{ idSettingsGUI: 1 }]
                };
                const expectData = Object.assign({}, initialState, { mainModules: [...action.payload] });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Active Module', () => {
            it('reducer Active Module Success', () => {
                const action = {
                    type: ModuleActions.ACTIVE_MODULE,
                    payload: [{ idSettingsGUI: 1 }]
                };
                const expectData = Object.assign({}, initialState, { activeModule: action.payload, activeSubModule: {} });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Active Sub Module', () => {
            describe('with idSettingsGUI = -1, is Can New', () => {
                it('is exist idSettingsGUIParent = any idSettingsGUI', () => {
                    const action = {
                        type: ModuleActions.ACTIVE_SUB_MODULE,
                        payload: {
                            idSettingsGUI: -1,
                            isCanNew: true,
                            idSettingsGUIParent: 25,
                        }
                    };
                    const subModuleState = [{
                        idSettingsGUI: 25,
                    }]
                    const state = Object.assign({}, initialState, { subModules: [...subModuleState] });

                    const expectData = Object.assign({}, state, { activeSubModule: state.subModules[0] });
                    expect(mainModuleStateReducer(state, action)).toEqual(expectData);
                });

                it('is not exist idSettingsGUIParent = any idSettingsGUI', () => {
                    const action = {
                        type: ModuleActions.ACTIVE_SUB_MODULE,
                        payload: {
                            idSettingsGUI: -1,
                            isCanNew: true,
                            idSettingsGUIParent: 25,
                        }
                    };

                    const expectData = Object.assign({}, initialState, { activeSubModule: {} });
                    expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
                });
            });

            describe('with idSettingsGUI != -1', () => {
                it('with idSettingsGUI != -1 Success', () => {
                    const action = {
                        type: ModuleActions.ACTIVE_SUB_MODULE,
                        payload: {
                            idSettingsGUI: 25,
                        }
                    };

                    const expectData = Object.assign({}, initialState, { activeSubModule: action.payload });
                    expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
                });
            });
        });

        describe('reducer Get Sub Module Success', () => {
            it('Sub Module is null, is Can Search', () => {
                const action = {
                    type: ModuleActions.GET_SUB_MODULE_SUCCESS,
                    payload: null,
                };
                const activeModuleState = {
                    idSettingsGUI: -1,
                    isCanSearch: true,
                    moduleName: 'Test isCanSearch',
                    idSettingsGUIParent: -1,
                };
                const state = Object.assign({}, initialState, { activeModule: activeModuleState });

                const expectData = Object.assign({}, state, { subModules: [new Module(activeModuleState)] });
                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });

            it('Sub Module is null, is Can New', () => {
                const action = {
                    type: ModuleActions.GET_SUB_MODULE_SUCCESS,
                    payload: null,
                };
                const activeModuleState = {
                    idSettingsGUI: -1,
                    isCanNew: true,
                    moduleName: 'Test isCanNew',
                    idSettingsGUIParent: -1,
                };
                const state = Object.assign({}, initialState, { activeModule: activeModuleState });

                const expectData = Object.assign({}, state, { subModules: [new Module(activeModuleState)] });
                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });

            it('Sub Module is exist', () => {
                const action = {
                    type: ModuleActions.GET_SUB_MODULE_SUCCESS,
                    payload: [{
                        idSettingsGUI: 25,
                    }],
                };

                const expectData = Object.assign({}, initialState, { subModules: action.payload });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Clear Active Module', () => {
            it('reducer Clear Active Module Success', () => {
                const action = {
                    type: ModuleActions.CLEAR_ACTIVE_MODULE,
                };
                const expectData = Object.assign({}, initialState, { activeModule: {} });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Clear Active Sub Module', () => {
            it('reducer Clear Active Sub Module Success', () => {
                const action = {
                    type: ModuleActions.CLEAR_ACTIVE_SUB_MODULE,
                };
                const expectData = Object.assign({}, initialState, { activeSubModule: {} });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Clear Sub Module', () => {
            it('reducer Clear Sub Module Success', () => {
                const action = {
                    type: ModuleActions.CLEAR_SUB_MODULES,
                };
                const expectData = Object.assign({}, initialState, { subModules: [] });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Add Working Module Module', () => {
            it('action.payload: working module is null', () => {
                const action = {
                    type: ModuleActions.ADD_WORKING_MODULE,
                    payload: {
                        workingModule: null,
                    }
                };
                const state = Object.assign({}, initialState, { workingModules: [{ id: 1 }] });
                const expectData = Object.assign({}, initialState, { workingModules: state.workingModules });
                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });

            it('action.payload: existing working module', () => {
                const action = {
                    type: ModuleActions.ADD_WORKING_MODULE,
                    payload: {
                        workingModule: {
                            idSettingsGUI: 25,
                        },
                        loadFromSetting: false,
                        parkedItems: [
                            {
                                isNew: false,
                                selected: true,
                                id: {
                                    value: 5,
                                }
                            }
                        ],
                        fieldConfig: null,
                        subModules: [],
                    }
                };
                const workingModuleMock = [
                    {
                        workingModule:
                        {
                            idSettingsGUI: 25
                        }
                    }
                ];
                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: JSON.parse(JSON.stringify(workingModuleMock))
                });
                const expectData = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: [{
                        active: !action.payload.loadFromSetting,
                        parkedItems: action.payload.parkedItems,
                        fieldConfig: action.payload.fieldConfig,
                        subModules: action.payload.subModules,
                        workingModule: state.workingModules[0].workingModule
                    }]
                });

                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });

            it('action.payload: not existing working module', () => {
                const action = {
                    type: ModuleActions.ADD_WORKING_MODULE,
                    payload: {
                        workingModule: {
                            idSettingsGUI: 25,
                        },
                        loadFromSetting: false,
                        parkedItems: [
                            {
                                isNew: false,
                                selected: true,
                                id: {
                                    value: 5,
                                }
                            }
                        ],
                        fieldConfig: null,
                        subModules: [],
                    }
                };
                const workingModuleMock = [
                    {
                        active: false,
                        workingModule:
                        {
                            idSettingsGUI: 24
                        }
                    },
                    {
                        active: false,
                        workingModule:
                        {
                            idSettingsGUI: 21
                        }
                    }
                ];

                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: JSON.parse(JSON.stringify(workingModuleMock))
                });

                const workingModuleExpected = JSON.parse(JSON.stringify(state.workingModules));
                workingModuleExpected.push({
                    workingModule: action.payload.workingModule,
                    parkedItems: action.payload.parkedItems,
                    active: !action.payload.loadFromSetting,
                    fieldConfig: action.payload.fieldConfig,
                    subModules: action.payload.subModules,
                });

                const expectData = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: workingModuleExpected
                });
                console.log('expectData', expectData);
                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });
        });

        describe('reducer Remove Working Module', () => {
            it('action.payload: working module is null', () => {
                const action = {
                    type: ModuleActions.REMOVE_WORKING_MODULE,
                    payload: {
                        workingModule: null,
                    }
                };
                const state = Object.assign({}, initialState, { workingModules: [{ id: 1 }] });
                const expectData = Object.assign({}, initialState, { workingModules: state.workingModules });
                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });

            it('action.payload: exist remove working module', () => {
                const action = {
                    type: ModuleActions.REMOVE_WORKING_MODULE,
                    payload: {
                        workingModule: {
                            idSettingsGUI: 25,
                        },
                    }
                };
                const workingModuleMock = [
                    {
                        workingModule:
                        {
                            idSettingsGUI: 25
                        }
                    }
                ];
                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: JSON.parse(JSON.stringify(workingModuleMock))
                });

                const expectData = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: []
                });

                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });

            it('action.payload: not exist remove working module', () => {
                const action = {
                    type: ModuleActions.REMOVE_WORKING_MODULE,
                    payload: {
                        workingModule: {
                            idSettingsGUI: 25,
                        },
                    }
                };
                const workingModuleMock = [
                    {
                        workingModule:
                        {
                            idSettingsGUI: 26
                        }
                    }
                ];
                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: JSON.parse(JSON.stringify(workingModuleMock))
                });
                const expectData = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: state.workingModules
                });

                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });
        });

        describe('reducer Reset Selecting Working Module Parked Item', () => {
            it('action.payload: working module is null', () => {
                const action = {
                    type: ModuleActions.RESET_SELECTING_WORKING_MODULE_PARKED_ITEM,
                    payload: null,
                };
                const state = Object.assign({}, initialState, { workingModules: [{ id: 1 }] });
                const expectData = Object.assign({}, initialState, { workingModules: state.workingModules });
                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });

            it('action.payload: remove parked item', () => {
                const action = {
                    type: ModuleActions.RESET_SELECTING_WORKING_MODULE_PARKED_ITEM,
                    payload: {
                        workingModule: {
                            idSettingsGUI: 22,
                        },
                        parkedItems: [
                            {
                                isNew: false,
                                selected: true,
                                id: {
                                    value: 5,
                                }
                            }
                        ],
                    }
                };
                const workingModuleMock = [
                    {
                        workingModule:
                        {
                            idSettingsGUI: 25
                        },
                        parkedItems: [
                            {
                                selected: false,
                            }
                        ]
                    }
                ];
                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: JSON.parse(JSON.stringify(workingModuleMock))
                });

                const expectData = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: workingModuleMock
                });

                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });
        });

        describe('reducer Move Selected Parked Item To Top', () => {
            it('action.payload: working module is null', () => {
                const action = {
                    type: ModuleActions.MOVE_SELECTED_PARKED_ITEM_TO_TOP,
                    payload: {
                        workingModule: null,
                    },
                };
                const state = Object.assign({}, initialState, { workingModules: [{ id: 1 }] });
                const expectData = Object.assign({}, initialState, { workingModules: state.workingModules });
                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });

            it('action.payload: remove parked item', () => {
                const action = {
                    type: ModuleActions.MOVE_SELECTED_PARKED_ITEM_TO_TOP,
                    payload: {
                        workingModule: {
                            idSettingsGUI: 25,
                        },
                        selectedParkedItem:
                        {
                            id: {
                                value: 5,
                            }
                        },
                    }
                };
                const workingModuleMock = [
                    {
                        workingModule:
                        {
                            idSettingsGUI: 25
                        },
                        parkedItems: [
                            {
                                id: {
                                    value: 5,
                                }
                            }
                        ]
                    }
                ];
                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: JSON.parse(JSON.stringify(workingModuleMock))
                });

                const expectData = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: workingModuleMock
                });

                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });
        });

        describe('reducer Store Module States', () => {
            it('action.payload: current module is null', () => {
                const action = {
                    type: ModuleActions.STORE_MODULE_STATES,
                    payload: {
                        currentModule: null,
                    },
                };
                const expectData = Object.assign({}, initialState, {
                    moduleStates: [],
                });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });

            it('action.payload: exist module state', () => {
                const action = {
                    type: ModuleActions.STORE_MODULE_STATES,
                    payload: {
                        currentModule: {
                            idSettingsGUI: 25,
                        },
                        selectedParkedItem:
                        {
                            isNew: false,
                        },
                    }
                };
                const moduleStateMock = [
                    {
                        currentModule:
                        {
                            idSettingsGUI: 25
                        },
                    }
                ];
                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    moduleStates: JSON.parse(JSON.stringify(moduleStateMock))
                });

                const expectData = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    moduleStates: [{
                        currentModule: state.moduleStates[0].currentModule,
                        selectedParkedItem: action.payload.selectedParkedItem,
                        selectedTab: undefined,
                        selectedAiTab: undefined,
                    }]
                });

                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });

            it('action.payload: not exist module state', () => {
                const action = {
                    type: ModuleActions.STORE_MODULE_STATES,
                    payload: {
                        currentModule: {
                            idSettingsGUI: 22,
                        },
                        selectedParkedItem:
                        {
                            isNew: false,
                        },
                    }
                };
                const moduleStateMock = [
                    {
                        currentModule:
                        {
                            idSettingsGUI: 25
                        },
                    }
                ];
                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    moduleStates: JSON.parse(JSON.stringify(moduleStateMock))
                });

                const moduleStateExpect = JSON.parse(JSON.stringify(state.moduleStates));
                moduleStateExpect.push({
                    currentModule: action.payload.currentModule,
                    selectedParkedItem:
                        action.payload.selectedParkedItem && action.payload.selectedParkedItem.isNew != true
                            ? action.payload.selectedParkedItem
                            : null,
                    selectedTab: undefined,
                    selectedAiTab: undefined,
                })

                const expectData = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    moduleStates: moduleStateExpect
                });

                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });
        });

        describe('reducer Clear Module State', () => {
            it('action.payload: current module is null', () => {
                const action = {
                    type: ModuleActions.CLEAR_MODULE_STATE,
                    payload: {
                        currentModule: null,
                    },
                };
                const expectData = Object.assign({}, initialState, {
                    moduleStates: [],
                });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });

            it('action.payload: exist module state', () => {
                const action = {
                    type: ModuleActions.CLEAR_MODULE_STATE,
                    payload: {
                        currentModule: {
                            idSettingsGUI: 22,
                        },
                        selectedParkedItem:
                        {
                            isNew: false,
                        },
                    }
                };
                const moduleStateMock = [
                    {
                        currentModule:
                        {
                            idSettingsGUI: 25
                        },
                    }
                ];
                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    moduleStates: JSON.parse(JSON.stringify(moduleStateMock))
                });

                const expectData = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    moduleStates: state.moduleStates,
                });

                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });
        });

        describe('reducer Request Create New Module Item', () => {
            it('reducer Request Create New Module Item Success', () => {
                const action = {
                    type: ModuleActions.REQUEST_CREATE_NEW_MODULE_ITEM,
                    payload: {}
                };
                const expectData = Object.assign({}, initialState, {
                    requestCreateNewModuleItem: action.payload,
                });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Search Keyword Module', () => {
            describe('Is Can New', () => {
                it('action.payload: exist idSettingsGUIParent = idSettingsGUI', () => {
                    const action = {
                        type: ModuleActions.SEARCH_KEYWORD_MODULE,
                        payload: {
                            idSettingsGUI: -1,
                            isCanNew: true,
                            idSettingsGUIParent: 25,
                        },
                    };
                    const subModulesMock = [
                        {
                            idSettingsGUI: 25
                        }
                    ];
                    const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                        subModules: JSON.parse(JSON.stringify(subModulesMock))
                    });
                    const expectData = Object.assign({}, JSON.parse(JSON.stringify(state)), { searchingModule: Object.assign({}, action.payload, state.subModules[0]) });

                    expect(mainModuleStateReducer(state, action)).toEqual(expectData);
                });

                it('action.payload: not exist idSettingsGUIParent = idSettingsGUI', () => {
                    const action = {
                        type: ModuleActions.SEARCH_KEYWORD_MODULE,
                        payload: {
                            idSettingsGUI: -1,
                            isCanNew: true,
                            idSettingsGUIParent: 25,
                        },
                    };
                    const mainModulesMock = [
                        {
                            idSettingsGUI: 25
                        }
                    ];

                    const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                        mainModules: JSON.parse(JSON.stringify(mainModulesMock))
                    });

                    const expectData = Object.assign({}, JSON.parse(JSON.stringify(state)), { searchingModule: Object.assign({}, action.payload, state.mainModules[0]) });
                    expect(mainModuleStateReducer(state, action)).toEqual(expectData);
                });
            });

            describe('idSettingsGUI != -1', () => {
                it('action.payload: idSettingsGUI != -1', () => {
                    const action = {
                        type: ModuleActions.SEARCH_KEYWORD_MODULE,
                        payload: {
                            idSettingsGUI: 5,
                        },
                    };
                    const expectData = Object.assign({}, initialState, { searchingModule: action.payload });
                    expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
                });
            });
        });

        describe('reducer Set Using Module', () => {
            it('reducer Set Using Module Success', () => {
                const action = {
                    type: ModuleActions.SET_USING_MODULE,
                    payload: {}
                };
                const expectData = Object.assign({}, initialState, {
                    usingModule: action.payload,
                });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Clear Using Module', () => {
            it('reducer Clear Using Module Success', () => {
                const action = {
                    type: ModuleActions.CLEAR_USING_MODULE,
                };
                const expectData = Object.assign({}, initialState, { usingModule: null });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Request Change Module', () => {
            it('reducer Request Change Module Success', () => {
                const action = {
                    type: ModuleActions.REQUEST_CHANGE_MODULE,
                    payload: {},
                };
                const expectData = Object.assign({}, initialState, {
                    requestChangeModule: {
                        requestedModule: action.payload,
                    },
                });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Clear Request Change Module', () => {
            it('reducer Clear Request Change Module Success', () => {
                const action = {
                    type: ModuleActions.CLEAR_REQUEST_CHANGE_MODULE,
                };
                const expectData = Object.assign({}, initialState, {
                    requestChangeModule: null,
                });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Request Change Sub Module', () => {
            it('reducer Request Change Sub Module Success', () => {
                const action = {
                    type: ModuleActions.REQUEST_CHANGE_SUB_MODULE,
                    payload: {
                        requestedModuleId: 25,
                        requestedSubModuleId: 6,
                    },
                };
                const expectData = Object.assign({}, initialState, {
                    requestChangeSubModule: {
                        requestedModuleId: action.payload.requestedModuleId,
                        requestedSubModuleId: action.payload.requestedSubModuleId,
                    },
                });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Clear Request Change Sub Module', () => {
            it('reducer Clear Request Change Sub Module Success', () => {
                const action = {
                    type: ModuleActions.CLEAR_REQUEST_CHANGE_SUB_MODULE,
                };
                const expectData = Object.assign({}, initialState, {
                    requestChangeSubModule: null,
                });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Toggle Is Working Modules Dragging', () => {
            it('reducer Toggle Is Working Modules Dragging Success', () => {
                const action = {
                    type: ModuleActions.TOGGLE_IS_WORKING_MODULES_DRAGGING,
                    payload: true,
                };
                const expectData = Object.assign({}, initialState, {
                    isWorkingModulesDragging: action.payload,
                });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });

        describe('reducer Remove All Parked Items Of Working Module', () => {
            it('reducer Remove All Parked Items Of Working Module Success', () => {
                const action = {
                    type: ModuleActions.REMOVE_ALL_PARKED_ITEMS_OF_WORKING_MODULE,
                    payload: {
                        idSettingsGUI: 25
                    },
                };

                const workingModuleMock = [
                    {
                        workingModule:
                        {
                            idSettingsGUI: 25
                        },
                        parkedItems: [],
                    }
                ];

                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: JSON.parse(JSON.stringify(workingModuleMock))
                });

                const expectData = Object.assign({}, JSON.parse(JSON.stringify(state)), {
                    workingModules: workingModuleMock
                });

                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });
        });

        describe('reducer Remove Parked Item Of Working Module', () => {
            it('reducer Remove Parked Item Of Working Module Success', () => {
                const action = {
                    type: ModuleActions.REMOVE_PARKED_ITEM_OF_WORKING_MODULE,
                    payload: {
                        module: {
                            idSettingsGUI: 25,
                        },
                        parkedItem: 1
                    },
                };

                const workingModuleMock = [
                    {
                        workingModule:
                        {
                            idSettingsGUI: 25,
                        },
                        parkedItems: [1, 2],
                    }
                ];
                const workingModuleExpected = [
                    {
                        workingModule:
                        {
                            idSettingsGUI: 25,
                        },
                        parkedItems: [2],
                    }
                ];

                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    workingModules: JSON.parse(JSON.stringify(workingModuleMock))
                });

                const expectData = Object.assign({}, JSON.parse(JSON.stringify(state)), {
                    workingModules: workingModuleExpected
                });

                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });
        });

        describe('reducer Add Dirty Module', () => {
            it('reducer Add Dirty Module Success', () => {
                const action = {
                    type: ModuleActions.ADD_DIRTY_MODULE,
                    payload: {
                        module: {
                            idSettingsGUI: 24,
                        }
                    },
                };

                const dirtyModulesMock = [
                    {
                        idSettingsGUI: 25,
                    }
                ];
                const dirtyModuleExpected = JSON.parse(JSON.stringify(dirtyModulesMock));
                dirtyModuleExpected.push(action.payload.module);

                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    dirtyModules: JSON.parse(JSON.stringify(dirtyModulesMock))
                });

                const expectData = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    dirtyModules: dirtyModuleExpected
                });
                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });
        });

        describe('reducer Remove Dirty Module', () => {
            it('reducer Remove Dirty Module Success', () => {
                const action = {
                    type: ModuleActions.REMOVE_DIRTY_MODULE,
                    payload: {
                        module: {
                            idSettingsGUI: 25,
                        }
                    },
                };

                const dirtyModulesMock = [
                    {
                        idSettingsGUI: 25,
                    }
                ];

                const state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    dirtyModules: JSON.parse(JSON.stringify(dirtyModulesMock))
                });

                const expectData = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
                    dirtyModules: [],
                });
                expect(mainModuleStateReducer(state, action)).toEqual(expectData);
            });
        });

        describe('reducer Get Company from Contact', () => {
            it('reducer Get Company from Contact Success', () => {
                const action = {
                    type: ModuleActions.GET_COMPANY,
                    payload: 'xoon',
                };
                const expectData = Object.assign({}, initialState, {
                    companyName: action.payload,
                });
                expect(mainModuleStateReducer(undefined, action)).toEqual(expectData);
            });
        });
    });
});
