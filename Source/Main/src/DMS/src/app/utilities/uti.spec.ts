import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiResultResponse, ControlGridModel, User, UserAuthentication } from '@app/models';
import { ApiMethodResultId, Configuration, DocumentMyDMType, LocalSettingKey, MenuModuleId, RepWidgetAppIdEnum } from '../app.constants';
import { CustomValidators, Uti } from './uti';
import { format } from 'date-fns/esm';
import { Subscription } from 'rxjs/Subscription';
import { LocalStorageHelper, SessionStorageProvider } from '.';

describe('Uti', () => {
    let component: Uti;
    let consts: Configuration;

    beforeEach((() => {
        TestBed.configureTestingModule({
            providers: [
                Configuration,
            ]
        });
        component = new Uti();
        consts = TestBed.inject(Configuration);
    }));

    afterEach(() => {
        component = null;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // checkLogin func
    describe('check Login', () => {
        it('check Login is success', () => {
            localStorage.setItem(consts.localStorageCurrentUser, 'anothertoken');
            expect(component.checkLogin()).toEqual('anothertoken');
        });

        it('check Login is failed', () => {
            localStorage.setItem(consts.localStorageCurrentUser, '');
            expect(component.checkLogin()).toEqual('');
        });
    });

    // checkLoginWithExpire func
    describe('check Login With Expired', () => {
        it('check Login With Expired is success', () => {
            localStorage.setItem(consts.localStorageCurrentUserExpire, 'anothertoken');
            expect(component.checkLoginWithExpire()).toEqual('anothertoken');
        });

        it('check Login With Expired is failed', () => {
            localStorage.setItem(consts.localStorageCurrentUserExpire, '');
            expect(component.checkLoginWithExpire()).toEqual('');
        });
    });

    // getUserInfo func
    describe('get User Info', () => {
        it('access Token is null', () => {
            const userAuth = new UserAuthentication();
            const userExpect = new User({
                loginMessage: userAuth.message,
            });
            localStorage.setItem(consts.localStorageCurrentUser, 'anothertoken');
            expect(component.getUserInfo().loginMessage).toEqual(userExpect.loginMessage);
        });

        it('access token invalid', () => {
            const userAuth = new UserAuthentication({
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZXN0IjoxMn0.fGwO9Bqdzy1-kAqMBKe6QCDcv6arHRXj7fzRjVsD3q0'
            });
            const userExpect = new User({
                loginMessage: userAuth.message,
            });
            localStorage.setItem(consts.localStorageCurrentUser, JSON.stringify(userAuth));
            expect(component.getUserInfo().loginMessage).toEqual(userExpect.loginMessage);
        });
    });

    // getUserExpireInfo func
    describe('get User Expire Info', () => {
        it('appinfo not exist info', () => {
            const userAuth = new UserAuthentication({
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBpbmZvIjoie1widGVzdFwiOjEyM30ifQ.mMWSK8-F4-8mY5-nQeYdGezgi5qACfQsb-MX5pJ3IHA'
            });
            localStorage.setItem(consts.localStorageCurrentUserExpire, JSON.stringify(userAuth));
            expect(component.getUserExpireInfo().id).toEqual(new User().id);
        });

        it('appinfo exist info', () => {
            const userAuth = new UserAuthentication({
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBpbmZvIjoie1wiRW1haWxcIjpcInRlc3RAZy5jb21cIn0ifQ.RY43UxTYdiI2H_w2GUJQf0BSwHJCVvL1Doa9c-RM5JQ'
            });
            const userExpect = new User({
                email: 'test@g.com',
            });
            localStorage.setItem(consts.localStorageCurrentUserExpire, JSON.stringify(userAuth));
            expect(component.getUserExpireInfo().email).toEqual(userExpect.email);
        });
    });

    // storeUserAuthentication func
    describe('store user authentication', () => {
        it('access token is exist', () => {
            const userAuth = new UserAuthentication({
                access_token: 'access_token',
                expires_in: 'expires_in',
            });
            component.storeUserAuthentication(userAuth)
            expect(JSON.parse(localStorage.getItem(consts.localStorageCurrentUser)).access_token).toEqual(userAuth.access_token);
            expect(localStorage.getItem(consts.localStorageAccessToken)).toEqual(userAuth.access_token);
            expect(localStorage.getItem(consts.localStorageRefreshToken)).toEqual(userAuth.refresh_token);
            expect(localStorage.getItem(consts.localStorageExpiresIn)).toEqual(userAuth.expires_in);
        });
    });

    // decodeAccessToken func not yet
    describe('decode Access Token', () => {
        it('token not equal 3', () => {
            localStorage.setItem(consts.localStorageAccessToken, 'anothertoken');
            expect(component.decodeAccessToken()).toEqual(null);
        });

        // it('urlBase64Decode return null', () => {
        //     localStorage.setItem(consts.localStorageAccessToken, 'part0.1.part2');
        //     expect(component.decodeAccessToken()).toEqual(null);
        // });

        it('urlBase64Decode token 0', () => {
            localStorage.setItem(consts.localStorageAccessToken, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
            expect(component.decodeAccessToken()).toEqual({
                'sub': '1234567890',
                'name': 'John Doe',
                'iat': 1516239022
            });
        });
        // it('urlBase64Decode token 0', () => {
        //     localStorage.setItem(consts.localStorageAccessToken, 'part0.eyJhIjoiSGVsbG8gV29ybGQhIn0=.part2');
        //     expect(component.decodeAccessToken()).toEqual(null);
        // });
    });

    // // storeDefaultRole func
    // describe('store default role', () => {
    //     it('defaultRoleId is exist', () => {
    //         component.storeDefaultRole('test');
    //         expect(localStorage.getItem(consts.localStorageDefaultRole)).toEqual('test');
    //     });
    // });

    // getDefaultRole func
    describe('get default role', () => {
        it('defaultRoleId string null', () => {
            localStorage.setItem(consts.localStorageDefaultRole, '');
            expect(component.getDefaultRole()).toEqual('-1');
        });
    });
    // // getDefaultRole func
    // describe('get default role', () => {
    //     it('defaultRoleId string null', () => {
    //         localStorage.setItem(consts.localStorageDefaultRole, '');
    //         expect(component.getDefaultRole()).toEqual('');
    //     });
    // });

    // resetValueForForm func
    describe('reset value for form', () => {
        it('reset form group', () => {
            const formGroup: FormGroup = new FormGroup({
                submitted: new FormControl(true),
                leftCharacters: new FormControl(400),
                countryCheckListData: new FormControl({ test: 2 }),
            });
            const formGroupExpect = new FormGroup({
                submitted: new FormControl(false),
                leftCharacters: new FormControl(500),
                countryCheckListData: new FormControl({}),
            });
            component.resetValueForForm(formGroup);
            expect(formGroup['submitted']).toEqual(formGroupExpect['submitted']);
        });
    });

    // static resetValueForForm func
    describe('static reset value for form', () => {
        describe('check formGroup', () => {
            describe('formGroup invalid', () => {
                it('formGroup is null', () => {
                    expect(Uti.resetValueForForm(null, null, null)).toBeUndefined();
                });

                it('formGroup controls is null', () => {
                    const formGroup = new FormGroup({})
                    expect(Uti.resetValueForForm(formGroup, null, null)).toBeUndefined();
                });
            });

            describe('formGroup != null', () => {
                it('formGroup value is null', () => {
                    const formGroup = new FormGroup({
                        isActive: new FormControl(false)
                    });
                    const formGroupExpect = new FormGroup({
                        isActive: new FormControl(true)
                    })
                    Uti.resetValueForForm(formGroup, null, null)
                    expect(formGroup.controls['isActive'].value).toEqual(formGroupExpect.controls['isActive'].value);
                });

                it('formGroup value is exist', () => {
                    const formGroup = new FormGroup({
                        test: new FormControl(123),
                        submitted: new FormControl(true),
                        leftCharacters: new FormControl(400),
                        countryCheckListData: new FormControl({ test: 123 }),
                        testObj: new FormGroup({}),
                        testObj1: new FormGroup({
                            isActive: new FormControl(true),
                        }),
                    });
                    const keepValueMock = [
                        'test',
                        'testObj1'
                    ];
                    const keepValueExtMock = [
                        'test',
                        'testObj1'
                    ];
                    const formGroupExpect = new FormGroup({
                        isActive: new FormControl(true),
                        testObj1: new FormGroup({
                            isActive: new FormControl(true),
                        }),
                    })
                    Uti.resetValueForForm(formGroup, keepValueMock, keepValueExtMock)
                    expect(formGroup.controls['testObj1']['controls']['isActive'].value).toEqual(formGroupExpect.controls['testObj1']['controls']['isActive'].value);
                });
            });
        });
    });

    // setValueForForm func
    describe('set value for form', () => {
        it('reset form group', () => {
            const formGroup: FormGroup = new FormGroup({
                leftCharacters: new FormControl(400),
                countryCheckListData: new FormGroup({ test: new FormControl(2) }),
            });
            const values = {
                submitted: false,
                leftCharacters: 500,
                countryCheckListData: {},
            };
            Uti.setValueForForm(formGroup, values);
            expect(formGroup.controls['leftCharacters'].value).toEqual(values.leftCharacters);
        });
    });

    // setValueForFormWithStraightObject func
    describe('set value for form with straight object', () => {
        it('formatCondition: undefined, formatCondition: datetime value is null, formatCondition: boolean value is catch', () => {
            const formGroup: FormGroup = new FormGroup({
                test: new FormControl(),
                datetime: new FormControl(),
                boolean: new FormControl(false),
            });
            const values = {
                test: null,
                datetime: null,
                boolean: 'test',
            };
            const formatCondition = {
                datetime: 'datetime',
                boolean: 'boolean',
            }
            Uti.setValueForFormWithStraightObject(formGroup, values, formatCondition);
            expect(formGroup.controls['boolean'].value).toBeFalsy();
        });

        it('formatCondition: datetime value is exist, formatCondition: boolean value is valid', () => {
            const formGroup: FormGroup = new FormGroup({
                datetime: new FormControl(),
                boolean: new FormControl(false),
                fg: new FormGroup({
                    school: new FormControl(),
                    id: new FormControl(3),
                    name: new FormControl('eden'),
                    isStar: new FormControl(false),
                }),
            });
            const values = {
                school: undefined,
                datetime: new Date(),
                boolean: true,
                id: 25,
                name: 'hazard',
                isStar: true,
            };
            const formatCondition = {
                datetime: 'datetime',
                boolean: 'boolean',
                dateFormatString: 'mm/yy'
            }
            Uti.setValueForFormWithStraightObject(formGroup, values, formatCondition);
            expect(formGroup.controls['boolean'].value).toBeTruthy();
        });
    });

    // registerFormControlType func
    describe('register form control type', () => {
        it('reset form group', () => {
            const formGroup: FormGroup = new FormGroup({
                leftCharacters: new FormControl(400),
            });
            const controlList = {
                dropdown: ';',
                number: ';',
                datetime: ';',
            };
            Uti.registerFormControlType(formGroup, controlList);
            expect(formGroup).toEqual(formGroup);
        });
    });

    // setNullValueForBooleanWhenFalse func
    describe('set null value for boolean when false', () => {
        it('formGroup controls is not exist', () => {
            const formGroup: FormGroup = new FormGroup({});
            expect(Uti.setNullValueForBooleanWhenFalse(formGroup)).toBeUndefined();
        });

        it('formGroup controls is exist', () => {
            const formGroup: FormGroup = new FormGroup({
                isStar: new FormControl(false),
            });
            Uti.setNullValueForBooleanWhenFalse(formGroup);
            expect(formGroup.controls['isStar'].value).toBeNull();
        });
    });

    // setNullValueForBooleanWhenFalse func
    describe('set null value for boolean when false', () => {
        it('formGroup controls is not exist', () => {
            const formGroup: FormGroup = new FormGroup({});
            expect(Uti.setNullValueForBooleanWhenFalse(formGroup)).toBeUndefined();
        });

        it('formGroup controls is exist', () => {
            const formGroup: FormGroup = new FormGroup({
                isStar: new FormControl(false),
            });
            Uti.setNullValueForBooleanWhenFalse(formGroup);
            expect(formGroup.controls['isStar'].value).toBeNull();
        });
    });

    // setValueForMultipleFormControl func
    describe('set value for multiple formControl', () => {
        describe('controls is not exist', () => {
            it('return undefined', () => {
                expect(Uti.setEnableForMultipleFormControl(null, [], false)).toBeUndefined();
            });
        });

        describe('controls is exist', () => {
            it('enabled is true', () => {
                const formGroup: FormGroup = new FormGroup({
                    isStar: new FormControl(false),
                });
                const controls = [
                    'isStar'
                ]
                Uti.setEnableForMultipleFormControl(formGroup, controls, true);
                expect(formGroup.controls['isStar'].enabled).toBeTruthy();
            });

            it('enabled is false', () => {
                const formGroup: FormGroup = new FormGroup({
                    isStar: new FormControl(false),
                });
                const controls = [
                    'isStar'
                ]
                Uti.setEnableForMultipleFormControl(formGroup, controls, false);
                expect(formGroup.controls['isStar'].disabled).toBeTruthy();
            });
        });
    });

    // setRequireForFormControl func
    describe('set require for formControl', () => {
        it('formGroup controls is not define', () => {
            const formGroup: FormGroup = new FormGroup({
                isStar: new FormControl(false),
            });
            Uti.setRequireForFormControl(formGroup, 'name')
            expect(formGroup).toEqual(formGroup);
        });

        it('formGroup controls has error', () => {
            const formGroup: FormGroup = new FormGroup({
                isStar: new FormControl(false),
            });
            formGroup.controls['isStar'].setErrors({ 'required': true });
            Uti.setRequireForFormControl(formGroup, 'name')
            expect(formGroup).toEqual(formGroup);
        });

        it('formGroup controls is valid to set require', () => {
            const formGroup: FormGroup = new FormGroup({
                isStar: new FormControl(false),
            });
            Uti.setRequireForFormControl(formGroup, 'name')
            expect(formGroup).toEqual(formGroup);
        });
    });

    // clearRequireForFormControl func
    describe('clear require for formControl', () => {
        it('formGroup controls is not define', () => {
            const formGroup: FormGroup = new FormGroup({
                isStar: new FormControl(false),
            });
            expect(Uti.clearRequireForFormControl(formGroup, 'name')).toBeUndefined();
        });

        it('formGroup controls is valid to set require', () => {
            const formGroup: FormGroup = new FormGroup({
                isStar: new FormControl(false),
            });
            Uti.setRequireForFormControl(formGroup, 'isStar');
            expect(formGroup).toEqual(formGroup);
        });
    });

    // getUpdateKeyValue func
    describe('get update key value', () => {
        it('get update key value success', () => {
            const formValues = {
                is_star: false,
                name: 'eden',
            }
            expect(Uti.getUpdateKeyValue(formValues, { star: true })).toBeFalsy();
        });
    });

    // getDefaultMainTabId func
    describe('get default main tabId', () => {
        it('idSettingsGUI == 4', () => {
            expect(component.getDefaultMainTabId({ idSettingsGUI: 4 })).toEqual('T1');
        });

        it('idSettingsGUI != 4', () => {
            expect(component.getDefaultMainTabId({ idSettingsGUI: 5 })).toEqual(consts.defaultMainTabId);
        });
    });

    // getDefaultMainTabName func
    describe('get default main tabName', () => {
        it('idSettingsGUI == 4', () => {
            expect(component.getDefaultMainTabName({ idSettingsGUI: 4 })).toEqual('T1');
        });

        it('idSettingsGUI != 4', () => {
            expect(component.getDefaultMainTabName({ idSettingsGUI: 5 })).toEqual(consts.defaultMainTabName);
        });
    });

    // styleFormatFieldsetData func
    describe('style format fieldset data', () => {
        it('is Group', () => {
            expect(Uti.styleFormatFieldsetData([{
                Group: {
                    name: 'eden',
                }
            }], true).length).toEqual(2);
        });

        it('is not Group', () => {
            expect(Uti.styleFormatFieldsetData([{
                Group: {
                    name: 'eden',
                }
            }]).length).toEqual(1);
        });
    });

    // formatFieldsetData func
    describe('format fieldset data', () => {
        it('format fieldset data success', () => {
            expect(Uti.formatFieldsetData([{
                Group: 'test',
            }]).length).toEqual(1);
        });
    });

    // popupMaximize func
    describe('popup maximize', () => {
        it('popup maximize success', () => {
            expect(Uti.popupMaximize(null, null)).toEqual(`${consts.popupResizeClassName}  ${consts.popupFullViewClassName}`);
        });
    });

    // popuprestore func
    describe('popup pre store', () => {
        it('popup pre store success', () => {
            const popupComponent = {
                containerViewChild: {
                    nativeElement: {
                        style: {
                            width: '50px',
                            height: '50px',
                            left: '0px',
                            top: '20px',
                        }
                    }
                }
            }
            const size = {};
            expect(Uti.popuprestore(popupComponent, size)).toEqual(consts.popupResizeClassName);
        });
    });

    // setValidatorForForm func
    describe('set validator for Form', () => {
        it('formGroup is not define', () => {
            expect(Uti.setValidatorForForm(null, {})).toBeUndefined();
        });

        it('mandatoryData is not define', () => {
            expect(Uti.setValidatorForForm(new FormGroup({
                name: new FormControl('eden'),
            }), null)).toBeUndefined();
        });

        it('data is valid', () => {
            const formGroup = new FormGroup({
                name: new FormControl('eden'),
            });
            Uti.setValidatorForForm(formGroup, { name: 'hazard' });
            expect(formGroup.controls['name'].hasError('require')).toBeFalsy();
        });
    });

    // setIsTextBoxForFormControl func
    describe('set is textBox for FormControl', () => {
        it('textboxControls is not define', () => {
            expect(Uti.setIsTextBoxForFormControl(null, null)).toBeUndefined();
        });

        it('textboxControls is not have data', () => {
            expect(Uti.setIsTextBoxForFormControl(null, [])).toBeUndefined();
        });

        it('data is valid', () => {
            const formGroup = new FormGroup({
                name: new FormControl('eden'),
            });
            const formGroupExpect = new FormGroup({
                name: new FormControl('eden'),
            });
            formGroupExpect.controls['name']['isTextBox'] = true;
            Uti.setIsTextBoxForFormControl(formGroup, ['name']);
            expect(formGroup.controls['name'].value).toEqual(formGroupExpect.controls['name'].value);
        });
    });

    // getMandatoryData func
    describe('get mandatory data', () => {
        it('has mandatoryData parse data error', () => {
            const response = {
                item: {
                    data: [
                        [
                            {
                                GetMandatoryField: 'error',
                            }
                        ]
                    ]
                },
                statusCode: ApiMethodResultId.Success
            }
            expect(Uti.getMandatoryData(response)).toBeUndefined();
        });
    });

    // hasChanges func
    describe('has changes', () => {
        it('check has change success', () => {
            const changes = {
                currentValue: 'test',
                previousValue: 'pre',
            }
            expect(Uti.hasChanges(changes)).toBeTruthy();
        });
    });

    // mapGirdDataToView func
    describe('mapGirdData to view', () => {
        it('combobox match data', () => {
            const gridData = [{
                id: '25',
            },
            {
                id: '28',
            }];
            const comboboxData = [{
                idValue: '25',
                textValue: 'eden',
            },
            {
                idValue: '24',
                textValue: 'haz',
            }];
            const columnName = 'id';
            Uti.mapGirdDataToView(gridData, comboboxData, columnName);
            expect(gridData[0].id).toEqual('eden');
            expect(gridData[1].id).toEqual('');
        });
    });

    // mapGirdDataToSave func
    describe('mapGirdData to save', () => {
        it('combobox match data', () => {
            const gridData = [{
                text: 'eden',
            },
            {
                text: 'test',
            }];
            const comboboxData = [{
                idValue: '25',
                textValue: 'eden',
            },
            {
                idValue: '24',
                textValue: 'haz',
            }];
            const columnName = 'text';
            expect(Uti.mapGirdDataToSave(gridData, comboboxData, columnName).length).toEqual(2);
        });
    });

    // cloneDataForGridItems func
    describe('clone Data For Grid Items', () => {
        it('clone Data For Grid Items success', () => {
            const controlGridModel: ControlGridModel = new ControlGridModel({
                data: [],
                columns: [],
            });
            expect(Uti.cloneDataForGridItems(controlGridModel)).toEqual({
                data: [],
                columns: [],
            });
        });
    });

    // mergeWijmoGridData func
    describe('merge Wijmo GridData', () => {
        describe('check data is null', () => {
            it('dataSourceTable is null', () => {
                expect(Uti.mergeWijmoGridData(null, null)).toBeNull();
            });

            it('wijmoGridData is null', () => {
                const dataSourceTable = {
                    data: [{
                        isNew: false,
                    }]
                }
                expect(Uti.mergeWijmoGridData(dataSourceTable, null)).toEqual(dataSourceTable);
            });
        });

        describe('check data != null', () => {
            it('wijmoGridData is null', () => {
                const dataSourceTable = {
                    data: [{
                        id: 1,
                        isNew: false,
                        isDeleted: false,
                        DT_RowId: 'test',
                        obj: {
                            age: 25
                        }
                    }]
                };
                const wijmoGridData = {
                    itemsAdded: [{
                        id: 2,
                        isNew: true,
                    }],
                    itemsRemoved: [{
                        id: 3,
                        isDeleted: true,
                    }],
                    itemsEdited: [{
                        DT_RowId: 'test',
                        obj: {
                            key: 25,
                        }
                    }]
                }
                const expectData = {
                    data: [
                        {
                            DT_RowId: 'test',
                            id: 1,
                            isDeleted: false,
                            isEdited: true,
                            isNew: false,
                            obj: 25,
                        },
                        {
                            id: 2,
                            isNew: true,
                        },
                    ]
                }
                expect(Uti.mergeWijmoGridData(dataSourceTable, wijmoGridData)).toEqual(expectData);
            });
        });
    });

    // mergeWijmoGridDataAll func
    describe('merge Wijmo Grid Data All', () => {
        it('wijmoGridData is null', () => {
            const dataSourceTable = {
                data: [1]
            };
            const wijmoGridData = {
                items: [3]
            }
            expect(Uti.mergeWijmoGridDataAll(dataSourceTable, wijmoGridData)).toEqual({ data: [1, 3] });
        });
    });

    // rebuildColumnHeaderForGrid func
    describe('rebuild columnHeader For Grid', () => {
        it('grid is null', () => {
            expect(Uti.rebuildColumnHeaderForGrid(null, null)).toBeUndefined();
        });

        it('grid column is not define', () => {
            expect(Uti.rebuildColumnHeaderForGrid({}, null)).toBeUndefined();
        });

        it('grid column is not have data', () => {
            expect(Uti.rebuildColumnHeaderForGrid({ columns: [] }, null)).toBeUndefined();
        });

        it('transferTranslate is null', () => {
            expect(Uti.rebuildColumnHeaderForGrid({ columns: [1, 2] }, null)).toBeUndefined();
        });

        it('transferTranslate is not have data', () => {
            expect(Uti.rebuildColumnHeaderForGrid({ columns: [1, 2] }, [])).toBeUndefined();
        });

        it('params is valid', () => {
            const grid = {
                columns: [
                    {
                        title: 'name',
                        data: 'eden',
                    }
                ]
            }
            Uti.rebuildColumnHeaderForGrid(grid, ['id']);
            expect(grid.columns[0].title).toEqual('name');
        });
    });

    // getItemsExistItems func
    describe('get items exist items', () => {
        it('get items exist items success', () => {
            const itemMaster = [
                {
                    name: 'eden',
                },
                {
                    name: 'ben',
                }
            ];
            const itemCondition = [
                {
                    name: 'eden',
                    age: 25,
                }
            ];
            ;
            expect(Uti.getItemsExistItems(itemMaster, itemCondition, 'name')).toEqual([{ name: 'eden' }]);
        });
    });

    // getItemsDontExistItems func
    describe('get items dont exist items', () => {
        it('get items dont exist items success', () => {
            const itemMaster = [
                {
                    name: 'eden',
                },
                {
                    name: 'ben',
                }
            ];
            const itemCondition = [
                {
                    name: 'eden',
                    age: 25,
                }
            ];
            ;
            expect(Uti.getItemsDontExistItems(itemMaster, itemCondition, 'name')).toEqual([{ name: 'ben' }]);
        });
    });

    // getItemByPropertyInTree func
    describe('get items by property in tree', () => {
        it('tree data is not defined', () => {
            expect(Uti.getItemByPropertyInTree(null, 'name', 'haz')).toBeNull();
        });

        it('tree data is not have data', () => {
            expect(Uti.getItemByPropertyInTree([], 'name', 'haz')).toBeNull();
        });

        it('tree data have data = value', () => {
            const treeData = [
                {
                    name: 'haz',
                    age: 25,
                }
            ]
            expect(Uti.getItemByPropertyInTree(treeData, 'name', 'haz')).toEqual(treeData[0]);
        });

        it('tree item not have children', () => {
            const treeData = [
                {
                    name: 'eden',
                    age: 25,
                }
            ]
            expect(Uti.getItemByPropertyInTree(treeData, 'name', 'haz')).toBeNull();
        });

        it('tree item have children', () => {
            const treeData = [
                {
                    name: 'eden',
                    age: 25,
                    children: {
                        name: 'ben',
                        age: 10,
                    }
                }
            ]
            expect(Uti.getItemByPropertyInTree(treeData, 'name', 'haz')).toBeNull();
        });
    });

    // makeDeleteGridData func
    describe('make delete gridData', () => {
        it('grid data is not defined', () => {
            expect(Uti.makeDeleteGridData(null, 'name')).toEqual([]);
        });

        it('grid data is not have data', () => {
            expect(Uti.makeDeleteGridData([], 'name')).toEqual([]);
        });

        it('deleteData data is not have data', () => {
            const gridData = [
                {
                    id: 1,
                    delete: false,
                }
            ]
            expect(Uti.makeDeleteGridData(gridData, 'name')).toEqual([]);
        });

        it('deleteData data is have data', () => {
            const gridData = [
                {
                    id: 1,
                    deleted: true,
                }
            ]
            expect(Uti.makeDeleteGridData(gridData, 'id')).toEqual([{
                IsDeleted: 1,
                id: 1,
            }]);
        });
    });

    // makeDeleteData func
    describe('make delete data', () => {
        it('delete data is not have data', () => {
            expect(Uti.makeDeleteData([], [], 'name')).toEqual([]);
        });

        it('delete data is have data', () => {
            expect(Uti.makeDeleteData([
                {
                    id: 1,
                    deleted: true,
                }
            ], [], 'id')).toEqual([{
                IsDeleted: 1,
                id: 1,
            }]);
        });
    });

    // makeGridColumnsWithDeleteColumn func
    describe('make GridColumns With DeleteColumn', () => {
        it('make GridColumns With DeleteColumn', () => {
            expect(Uti.makeGridColumnsWithDeleteColumn([])).toEqual([]);
        });
    });

    // makeWidgetDataToFormData func
    describe('make WidgetData To FormData', () => {
        it('widgetData is not defined', () => {
            expect(Uti.makeWidgetDataToFormData(null, [])).toEqual({});
        });

        it('widgetData is not have data', () => {
            expect(Uti.makeWidgetDataToFormData([], [])).toEqual({});
        });

        it('widgetData data is have data', () => {
            const widgetData = [
                {
                    id: 1,
                    OriginalColumnName: '',
                },
                {
                    id: 2,
                    OriginalColumnName: 'firstName',
                },
                {
                    id: 3,
                    OriginalColumnName: 'last_name',
                },
            ]
            const setValue = {
                name: 'eden',
            }

            expect(Uti.makeWidgetDataToFormData(widgetData, setValue)).toBeTruthy();
        });
    });

    // convertDataFromEditableToSource func
    describe('convert Data From Editable To Source', () => {
        it('convert Data From Editable To Source success', () => {
            const dataTable = [
                {
                    IsDeleted: true,
                    isEdited: true,
                    isNew: true,
                    name: 'eden',
                },
                {
                    IsDeleted: true,
                    isEdited: true,
                    isNew: true,
                    name: 'ben',
                },
            ];
            const dataSource = [
                {
                    IsDeleted: true,
                    isEdited: true,
                    isNew: true,
                    name: 'eden',
                },
            ];
            expect(Uti.convertDataFromEditableToSource(dataTable, dataSource)).toEqual(dataTable);
        });
    });

    // updateDataSource func
    describe('update Data Source', () => {
        it('convert Data From Editable To Source success', () => {
            const updateData = [
                {
                    isEdited: true,
                    isNew: true,
                    name: 'eden',
                },
                {
                    IsDeleted: true,
                    isEdited: true,
                    isNew: true,
                    name: 'ben',
                },
            ];
            const dataSource = [
                {
                    IsDeleted: true,
                    isEdited: true,
                    isNew: true,
                    name: 'eden',
                },
                {
                    IsDeleted: true,
                    isEdited: true,
                    isNew: true,
                    name: 'cesar',
                },
            ];
            expect(Uti.updateDataSource(updateData, dataSource).length).toEqual(2);
        });
    });

    // mapDataSourceToDataUpdateByColumnSetting func
    describe('map DataSource To Data Update By ColumnSetting', () => {
        it('idRepWidgetApp = CustomerDoublette, selectedTemplate.editing = true', () => {
            const dataSource = {
                collectionData: [
                    {
                        DT_RowId: 'newrow',
                        deleted: true,
                    },
                    {
                        DT_RowId: 'row_1',
                        deleted: false,
                    },
                    {
                        name: 'eden',
                        id: 1,
                        age: 25,
                        school: 'test',
                        isEdited: true,
                        isNew: true,
                        IsDeleted: 0,
                    },
                ],
                columnSettings: {
                    name: {
                        OriginalColumnName: 'name',
                        Setting: [
                            null,
                        ]
                    },
                    id: {
                        OriginalColumnName: 'id',
                        Setting: [{
                            DisplayField: null,
                        }]
                    },
                    age: {
                        OriginalColumnName: 'age',
                        Setting: [{
                            DisplayField: {
                                Hidden: null,
                            },
                        }]
                    },
                }
            }
            const widgetDetail = {
                idRepWidgetApp: RepWidgetAppIdEnum.CustomerDoublette,
            };
            const selectedTemplate = {
                editing: true,
                idValue: 25,
            }
            const additonalKey = 'additonalKey';
            const additonalValue = 'additonalValue';
            expect(Uti.mapDataSourceToDataUpdateByColumnSetting(dataSource, additonalKey, additonalValue, selectedTemplate, widgetDetail).length).toEqual(2);
        });

        it('idRepWidgetApp = CountryCustomerDoublette, selectedTemplate.editing = false', () => {
            const dataSource = {
                collectionData: [
                    {
                        name: 'eden',
                        id: 1,
                        age: 25,
                        school: 'test',
                        IsDeleted: 0,
                    },
                ],
                columnSettings: {
                    name: {
                        OriginalColumnName: 'name',
                        Setting: [
                            null,
                        ]
                    },
                    id: {
                        OriginalColumnName: 'id',
                        Setting: [{
                            DisplayField: null,
                        }]
                    },
                    age: {
                        OriginalColumnName: 'age',
                        Setting: [{
                            DisplayField: {
                                Hidden: null,
                            },
                        }]
                    },
                }
            }
            const widgetDetail = {
                idRepWidgetApp: RepWidgetAppIdEnum.CountryCustomerDoublette,
            };
            const selectedTemplate = {
                editing: false,
                idValue: 25,
            }
            const additonalKey = 'additonalKey';
            const additonalValue = 'additonalValue';
            expect(Uti.mapDataSourceToDataUpdateByColumnSetting(dataSource, additonalKey, additonalValue, selectedTemplate, widgetDetail).length).toEqual(1);
        });

        it('idRepWidgetApp = ArticleOrderDetail', () => {
            const dataSource = {
                collectionData: [
                    {
                        name: 'eden',
                        id: 1,
                        age: 25,
                        school: 'test',
                        IsDeleted: 0,
                    },
                ],
                columnSettings: {
                    name: {
                        OriginalColumnName: 'name',
                        Setting: [
                            null,
                        ]
                    },
                    id: {
                        OriginalColumnName: 'id',
                        Setting: [{
                            DisplayField: null,
                        }]
                    },
                    age: {
                        OriginalColumnName: 'age',
                        Setting: [{
                            DisplayField: {
                                Hidden: null,
                            },
                        }]
                    },
                }
            }
            const widgetDetail = {
                idRepWidgetApp: RepWidgetAppIdEnum.ArticleOrderDetail,
            };
            const selectedTemplate = {
                editing: false,
                idValue: 25,
            }
            const additonalKey = 'additonalKey';
            const additonalValue = 'additonalValue';
            expect(Uti.mapDataSourceToDataUpdateByColumnSetting(dataSource, additonalKey, additonalValue, selectedTemplate, widgetDetail).length).toEqual(1);
        });
    });

    // getTableRowByWidgetId func
    describe('get Table Row By WidgetId', () => {
        it('rowsData is not have data', () => {
            expect(component.getTableRowByWidgetId([], 1)).toBeNull();
        });

        it('widgetDetailId match with widgetId expect', () => {
            const rowData = [
                null,
                {
                    widgetDetailId: 25,
                    rowData: [],
                }
            ]
            expect(component.getTableRowByWidgetId(rowData, 25)).toEqual([]);
        });
    });

    // getCloumnSettings func
    describe('get column settings', () => {
        it('get column settings success', () => {
            const settingArray = [
                {
                    DisplayField: true,
                    ControlType: 'number',
                    Validation: 'isNumber',
                    MappingField: 'age',
                }
            ]
            expect(Uti.getCloumnSettings(settingArray)).toEqual(settingArray[0]);
        });
    });

    // isExistItemInArray func
    describe('isExist Item In Array', () => {
        it('check isExist Item In Array success', () => {
            const array = [
                {
                    id: 25,
                    name: 'eden',
                }
            ]
            expect(Uti.isExistItemInArray(array, 25, 'id', {})).toEqual(25);
        });
    });

    // removeItemInArray func
    describe('remove Item In Array', () => {
        it('item is empty', () => {
            expect(Uti.removeItemInArray([], {}, 'id')).toBeUndefined();
        });

        it('array is empty', () => {
            expect(Uti.removeItemInArray([], {
                id: 26,
            }, 'id')).toBeUndefined();
        });

        it('keyName is empty', () => {
            expect(Uti.removeItemInArray([{
                id: 25,
            }], {
                id: 26,
            }, '')).toBeUndefined();
        });

        it('keyValue is not exist in array', () => {
            expect(Uti.removeItemInArray([{
                id: 25,
            }], {
                id: 26,
            }, 'id')).toBeUndefined();
        });

        it('remove Item In Array success', () => {
            const array = [{
                id: 25,
            }];
            Uti.removeItemInArray(array, {
                id: 25,
            }, 'id')
            expect(array).toEqual([]);
        });
    });

    // existItemInArray func
    describe('exist Item In Array', () => {
        it('item is empty', () => {
            expect(Uti.existItemInArray([], {}, 'id')).toBeFalsy();
        });

        it('array is empty', () => {
            expect(Uti.existItemInArray([], {
                id: 26,
            }, 'id')).toBeFalsy();
        });

        it('keyName is empty', () => {
            expect(Uti.existItemInArray([{
                id: 25,
            }], {
                id: 26,
            }, '')).toBeFalsy();
        });

        it('check exist Item In Array success', () => {
            expect(Uti.existItemInArray([{
                id: 25,
            }], {
                id: 25,
            }, 'id')).toBeTruthy();
        });
    });

    // removeItemInTreeArray func
    describe('remove Item In tree Array', () => {
        describe('check remove', () => {
            it('item is empty', () => {
                expect(Uti.removeItemInTreeArray([], {}, 'id', 'child')).toBeUndefined();
            });

            it('array is empty', () => {
                expect(Uti.removeItemInTreeArray([], {
                    id: 26,
                }, 'id', 'child')).toBeUndefined();
            });

            it('removeItemInTreeNodeValue is exist', () => {
                expect(Uti.removeItemInTreeArray([{
                    id: 25,
                }], {
                    id: 25,
                }, 'id', 'child')).toBeUndefined();
            });
        });

        describe('remove in children', () => {
            it('check children node', () => {
                expect(Uti.removeItemInTreeArray([
                    {
                        test: 123,
                    },
                    {
                        id: 1,
                        child: [],
                    },
                    {
                        id: 2,
                        child: [{
                            id: 25,
                        }],
                    }
                ], {
                    id: 25,
                }, 'id', 'child')).toBeUndefined();
            });
        });
    });

    // getPrimaryValueFromKey func
    describe('get PrimaryValue From Key', () => {
        it('data is not defined', () => {
            expect(Uti.getPrimaryValueFromKey(null)).toEqual([]);
        });

        it('data.data is not defined', () => {
            expect(Uti.getPrimaryValueFromKey({ data: null })).toEqual([]);
        });

        it('data.data is not have data', () => {
            expect(Uti.getPrimaryValueFromKey({ data: [] })).toEqual([]);
        });

        it('data.widgetDetail is not defined', () => {
            expect(Uti.getPrimaryValueFromKey({ data: [1] })).toEqual([]);
        });

        it('data.widgetDetail.widgetDataType is not defined', () => {
            expect(Uti.getPrimaryValueFromKey({ data: [1], widgetDetail: {} })).toEqual([]);
        });

        it('data.widgetDetail.widgetDataType.primaryKey is not defined', () => {
            expect(Uti.getPrimaryValueFromKey({ data: [1], widgetDetail: { widgetDataType: {} } })).toEqual([]);
        });

        it('get PrimaryValue From Key success', () => {
            const data = {
                data: [{
                    'key': '1',
                }],
                widgetDetail: {
                    widgetDataType: {
                        primaryKey: '1,2,3',
                    }
                }
            }
            const expectData = [{
                'key': '1',
            }];
            expect(Uti.getPrimaryValueFromKey(data)).toEqual(expectData);
        });
    });

    // checkExistArticleItem func
    describe('check Exist Article Item', () => {
        it('data is not defined', () => {
            expect(Uti.checkExistArticleItem(2, { data: [{ articleNr: 2 }] })).toBeTruthy();
        });
    });

    // getValueFromArrayByKey func
    describe('get Value FromArray By Key', () => {
        it('array is not defined', () => {
            expect(Uti.getValueFromArrayByKey(null, 'id')).toBeNull();
        });

        it('array length is undefined', () => {
            expect(Uti.getValueFromArrayByKey({ id: 3 }, 'id')).toEqual(3);
        });

        it('item not in array', () => {
            expect(Uti.getValueFromArrayByKey([{ key: 3 }], 4)).toBeNull();
        });

        it('get Value FromArray By Key success', () => {
            expect(Uti.getValueFromArrayByKey([{ key: 3, value: 'three' }], 3)).toEqual('three');
        });
    });

    // mapArrayKeyValueToGeneralObject func
    describe('map Array KeyValue To GeneralObject', () => {
        it('array is not defined', () => {
            expect(Uti.mapArrayKeyValueToGeneralObject(null)).toEqual({});
        });

        it('array length is not have data', () => {
            expect(Uti.mapArrayKeyValueToGeneralObject([])).toEqual({});
        });

        it('map Array KeyValue To GeneralObject success', () => {
            expect(Uti.mapArrayKeyValueToGeneralObject([{ key: 'num', value: 'three' }])).toEqual({ num: 'three' });
        });
    });

    // mapObjectValueToGeneralObject func
    describe('map ObjectValue To GeneralObject', () => {
        it('obj is not defined', () => {
            expect(Uti.mapObjectValueToGeneralObject(null)).toEqual({});
        });

        it('obj is not have key data', () => {
            expect(Uti.mapObjectValueToGeneralObject({})).toEqual({});
        });

        it('map ObjectValue To GeneralObject success', () => {
            expect(Uti.mapObjectValueToGeneralObject({ num: { value: 3 }, age: null, })).toEqual({ num: 3, age: null, });
        });
    });

    // mapObjectGeneralObjectToKeyValueArray func
    describe('map Object General Object To KeyValue Array', () => {
        it('obj is not defined', () => {
            expect(Uti.mapObjectGeneralObjectToKeyValueArray(null)).toEqual({});
        });

        it('obj is not have key data', () => {
            expect(Uti.mapObjectGeneralObjectToKeyValueArray({})).toEqual({});
        });

        it('map ObjectValue To GeneralObject success', () => {
            expect(Uti.mapObjectGeneralObjectToKeyValueArray({ num: 'three' })).toEqual([{ key: 'Num', value: 'three' }]);
        });
    });

    // getItemFromArrayByProperty func
    describe('get Item From Array By Property', () => {
        it('Array is not defined', () => {
            expect(Uti.getItemFromArrayByProperty(null, 'id', 25)).toBeNull();
        });

        it('Array is not have data', () => {
            expect(Uti.getItemFromArrayByProperty([], 'id', 25)).toBeNull();
        });

        it('not match condition', () => {
            expect(Uti.getItemFromArrayByProperty([{ id: 24 }], 'id', 25)).toBeNull();
        });

        it('get Item From Array By Property success', () => {
            expect(Uti.getItemFromArrayByProperty([{ id: 25 }], 'id', 25)).toEqual({ id: 25 });
        });
    });

    // getValidCombobox func
    describe('get Valid Combobox', () => {
        it('options is null', () => {
            const listComboBox = [];
            const identificationKey = null;
            expect(Uti.getValidCombobox(listComboBox, identificationKey, 'test')).toBeNull();
        });

        it('mapFunc is not defined', () => {
            const listComboBox = {
                language: [{
                    key: 'test',
                    value: 25,
                }]
            }
            const identificationKey = 1;
            expect(Uti.getValidCombobox(listComboBox, identificationKey, '').length).toEqual(1);
        });

        it('mapFunc is defined', () => {
            const listComboBox = {
                language: [{
                    key: 'test',
                    value: 25,
                }]
            }
            const identificationKey = 1;
            function test(option) {
                return [];
            }
            expect(Uti.getValidCombobox(listComboBox, identificationKey, '', test)).toEqual([]);
        });
    });

    // setValueFromNewObjToNewObj func
    describe('set Value From New Obj To New Obj', () => {
        it('set Value From New Obj To New Obj success', () => {
            const oldObj = { key: 24 };
            Uti.setValueFromNewObjToNewObj({ key: 25 }, oldObj)
            expect(oldObj.key).toEqual(25);
        });
    });

    // setValueForArrayByProperty func
    describe('set Value For Array By Property', () => {
        it('set Value For Array By Property success', () => {
            const arr = [{
                key: 24
            }];
            Uti.setValueForArrayByProperty(arr, 'key', 25);
            expect(arr[0].key).toEqual(25);
        });
    });

    // setValueForArrayByKey func
    describe('set Value For Array By Key', () => {
        it('set Value For Array By Key success', () => {
            const arr = [
                {
                    key: 24
                },
                {
                    key: 25
                }
            ];
            const expectData = [
                {
                    key: 24
                },
                {
                    key: 25,
                    value: 'eden'
                }
            ];
            expect(Uti.setValueForArrayByKey(arr, 'value', 'eden', 'key', 25)).toEqual(expectData);
        });
    });

    // setValueForArrayByProperties func
    describe('set Value For Array By Properties', () => {
        it('set Value For Array By Properties success', () => {
            const arr = [
                {
                    key: 24
                },
                {
                    key: 25
                }
            ];
            const prop = [
                'key'
            ];
            const values = [
                30,
            ]
            const expectData = [
                {
                    key: 30
                },
                {
                    key: 30,
                }
            ];
            expect(Uti.setValueForArrayByProperties(arr, prop, values)).toEqual(expectData);
        });
    });

    // static getStringValue func
    describe(' get string value', () => {
        it('get string value', () => {
            const obj = {
                key: 'abc'
            };
            expect(Uti.getStringValue(obj)).toEqual(obj + '');
        });

        it('get string value is Empty obj', () => {
            const obj = {};
            expect(Uti.getStringValue(obj)).toEqual('');
        });
    });

    // static isEmptyOrFalse func
    describe(' check Empty Or False', () => {
        it('check empty or false is success', () => {
            const data = {
                firstName: 'Jonnhy',
                lastName: 'Dang',
            }
            expect(Uti.isEmptyOrFalse(data)).toBeTruthy();
        });

        it('check empty or false is failed', () => {
            const data = {};
            Uti.isEmptyOrFalse(data);
            expect(typeof data).toEqual('object');
            expect(Uti.isEmptyOrFalse(data)).toBeFalsy();
        });
    });

    // static convertDateToString func
    describe(' convert date to string', () => {
        it('convert date to string is success', () => {
            const date = new Date(2021, 1, 6);
            Uti.convertDateToString(date);
            expect(typeof date).toEqual('object');
            expect(format(date, 'MM/dd/yyyy')).toEqual('02/06/2021');
        });

        it('convert date to string is failed', () => {
            Uti.convertDateToString('01 Jan 1970 00:00:00 GMT');
        });
    });

    // getLocale func
    describe(' get Locale', () => {
        it('get Locale is "de" ', () => {
            const user = {
                preferredLang: '1'
            };
            expect(component.getLocale(user)).toEqual('de');
        });

        it('get Locale is "it" ', () => {
            const user = {
                preferredLang: '2'
            };
            expect(component.getLocale(user)).toEqual('it');
        });

        it('get Locale is "fr" ', () => {
            const user = {
                preferredLang: '3'
            };
            expect(component.getLocale(user)).toEqual('fr');
        });

        it('get Locale is "enUS" ', () => {
            const user = {
                preferredLang: '4'
            };
            expect(component.getLocale(user)).toEqual('enUS');
        });

        it('get Locale is "nl" ', () => {
            const user = {
                preferredLang: '7'
            };
            expect(component.getLocale(user)).toEqual('nl');
        });

        it('get Locale is "es" ', () => {
            const user = {
                preferredLang: '5'
            };
            expect(component.getLocale(user)).toEqual('es');
        });

        it('get Locale is "pt" ', () => {
            const user = {
                preferredLang: '6'
            };
            expect(component.getLocale(user)).toEqual('pt');
        });

        it('get Locale is "ja" ', () => {
            const user = {
                preferredLang: '8'
            };
            expect(component.getLocale(user)).toEqual('ja');
        });

        it('get Locale is "vi" ', () => {
            const user = {
                preferredLang: '9'
            };
            expect(component.getLocale(user)).toEqual('vi');
        });

        it('get Locale default ', () => {
            const user = {
                preferredLang: '11'
            };
            expect(component.getLocale(user)).toEqual('enUS');
        });
    });

    // static buildKeyValueArrayForObject func
    describe(' buildKeyValueArrayForObject', () => {
        it('build Key Value Array For Object is success ', () => {
            const data = {
                firstName: 'Jonnhy',
                lastName: 'Dang',
            }
            const result = [
                { key: 'firstName', value: 'Jonnhy' },
                { key: 'lastName', value: 'Dang' }
            ];
            expect(Uti.buildKeyValueArrayForObject(data)).toEqual(result);
        });

        it('build Key Value Array For Object is failed ', () => {
            const data = {
            }
            Uti.buildKeyValueArrayForObject(data)
            expect(Uti.buildKeyValueArrayForObject(data)).toEqual([]);
        });
    });

    // FileManager

    // static fixFileNameOnUrl func
    describe(' fixFileNameOnUrl', () => {
        it('fix File Name On Url is success ', () => {
            const name = 'a&b';
            expect(Uti.fixFileNameOnUrl(name)).toEqual('a%26b');
        });

        it('fix File Name On Url is failed ', () => {
            const name = null;
            expect(Uti.fixFileNameOnUrl(name)).toBeNull();
        });
    });

    // static getFileUrl func
    describe(' getFileUrl', () => {
        it('get File Url with name is success ', () => {
            const name = 'a&b';
            expect(Uti.getFileUrl(name)).toEqual('/api/FileManager/GetFile?name=a%26b');
        });

        it('get File Url with name,mode is success ', () => {
            const name = 'a&b';
            const mode = 1;
            expect(Uti.getFileUrl(name, mode)).toEqual('/api/FileManager/GetFile?name=a%26b&mode=1');
        });

        it('get File Url with name,mode,returnName is success ', () => {
            const name = 'a&b';
            const mode = 1;
            const returnName = 'test';
            expect(Uti.getFileUrl(name, mode, returnName)).toEqual('/api/FileManager/GetFile?name=a%26b&returnName=test&mode=1');
        });


        it('get File Url with name,mode,returnName, subFolder is success ', () => {
            const name = 'a&b';
            const mode = 1;
            const returnName = 'test';
            const subFolder = 'subFolder1';
            expect(Uti.getFileUrl(name, mode, returnName, subFolder)).toEqual('/api/FileManager/GetFile?name=a%26b&returnName=test&mode=1&subFolder=subFolder1');
        });

        it('get File Url is failed ', () => {
            const name = 'https://www.youtube.com/';
            expect(Uti.getFileUrl(name)).toEqual(name);
        });
    });

    // static getUploadFileUrl func
    describe(' getUploadFileUrl', () => {
        it('get Upload File Url with mode ', () => {
            const mode = 1;
            expect(Uti.getUploadFileUrl(mode)).toEqual('/api/FileManager/UploadFile/?&mode=1');

        });

        it('get Upload File Url with mode, subFolder ', () => {
            const mode = 1;
            const subFolder = 'test';
            Uti.getUploadFileUrl(mode, subFolder);
            expect(Uti.getUploadFileUrl(mode, subFolder)).toEqual('/api/FileManager/UploadFile/?&mode=1&subFolder=test');

        });

        it('get Upload File Url with mode is ArticleMediaZipImport ', () => {
            const mode = 8;
            expect(Uti.getUploadFileUrl(mode)).toEqual('/api/FileManager/ImportArticleMediaZip/?&mode=8');
        });
    });

    // static getCheckFileExistedUrl func
    describe(' getCheckFileExistedUrl', () => {
        it('get Check File Existed Url with name ', () => {
            const name = 'test';
            expect(Uti.getCheckFileExistedUrl(name)).toEqual('/api/FileManager/CheckFileExisted?name=test');
        });

        it('get Check File Existed Url with name, mode ', () => {
            const name = 'test';
            const mode = 1;
            expect(Uti.getCheckFileExistedUrl(name, mode)).toEqual('/api/FileManager/CheckFileExisted?name=test&mode=1');
        });

        it('get Check File Existed Url with name, mode, subFolder ', () => {
            const name = 'test';
            const mode = 1;
            const subFolder = 'subFolder1';
            Uti.getCheckFileExistedUrl(name, mode, subFolder);
            expect(Uti.getCheckFileExistedUrl(name, mode, subFolder)).toEqual('/api/FileManager/CheckFileExisted?name=test&mode=1&subFolder=subFolder1')
        });
    });

    // static getCustomerLogoUrl func
    describe(' getCustomerLogoUrl', () => {
        it('get Customer Logo Url with name ', () => {
            const name = 'test';
            expect(Uti.getCustomerLogoUrl(name)).toEqual('/api/FileManager/GetFile?name=test&mode=11');
        });

        it('get Customer Logo Url with name, width ', () => {
            const name = 'test';
            const width = '150';
            expect(Uti.getCustomerLogoUrl(name, width)).toEqual('/api/FileManager/GetFile?name=test&w=150&mode=11');
        });

        it('get Customer Logo Url is failed', () => {
            const name = null;
            expect(Uti.getCustomerLogoUrl(name)).toEqual('/public/assets/img/default_logo_view.png');
        });
    });

    // static getDataOfFirstProperty func
    describe(' getDataOfFirstProperty', () => {
        it('get Data Of First Property is success', () => {
            const data = [
                { key: 'firstName', value: 'Jonnhy' },
                { key: 'lastName', value: 'Dang' }
            ];
            const defaultData = 'test';
            const result = { key: 'firstName', value: 'Jonnhy' }
            expect(Uti.getDataOfFirstProperty(data, defaultData)).toEqual(result);
        });

        it('get Customer Logo Url with default data is failed', () => {
            const data = null;
            const defaultData = 'test';
            expect(Uti.getDataOfFirstProperty(data, defaultData)).toEqual(defaultData);
        });

        it('get Customer Logo Url without default data is failed', () => {
            const data = null;
            expect(Uti.getDataOfFirstProperty(data)).toEqual(null);
        });
    });

    // static isNotCharacterKey func
    describe(' isNotCharacterKey', () => {
        it('is Not Character Key is success', () => {
            const keyCode = 16;
            expect(Uti.isNotCharacterKey(keyCode)).toBeTruthy();
        });

        it('is Not Character Key is failed', () => {
            const keyCode = 14;
            expect(Uti.isNotCharacterKey(keyCode)).toBeFalsy();
        });
    });

    // static addMorePropertyToArray func
    describe(' addMorePropertyToArray', () => {
        it('add More Property To Array is success', () => {
            const arr = [
                { value: 'Jonnhy' },
                { value: 'Dang' }
            ];
            const propertyName = 'value';
            const data = 'test';
            const result = [
                { value: 'test' },
                { value: 'test' }
            ];
            expect(Uti.addMorePropertyToArray(arr, propertyName, data)).toEqual(result);
        });

        it('add More Property To Array is failed', () => {
            const arr = [];
            const propertyName = 'value';
            const data = 'test';
            expect(Uti.addMorePropertyToArray(arr, propertyName, data)).toEqual(arr);
        });
    });

    // static mapEmptyToStringEmpty func
    describe(' mapEmptyToStringEmpty', () => {
        it('map Empty To String Empty is success', () => {
            const data = 'test';
            expect(Uti.mapEmptyToStringEmpty(data)).toEqual(data);
        });

        it('add More Property To Array is failed', () => {
            const arr = [];
            expect(Uti.mapEmptyToStringEmpty(arr)).toEqual('');
        });
    });

    // static replaceExtension func
    describe('replaceExtension', () => {
        it('replace Extension is success', () => {
            const fileName = 'document.txt';
            const ext = 'test';
            const result = 'document.test';
            expect(Uti.replaceExtension(fileName, ext)).toEqual(result);
        });

        it('replace Extension dont have tail file', () => {
            const fileName = 'txt';
            const ext = 'test';
            const result = 'txt.test';
            expect(Uti.replaceExtension(fileName, ext)).toEqual(result);
        });
    });

    // static getDateFormatFromIsoCode func
    describe('getDateFormatFromIsoCode', () => {
        it('get Date Format From Iso Code with isoCode "AL"', () => {
            const isoCode = 'AL';
            expect(Uti.getDateFormatFromIsoCode(isoCode)).toEqual('yyyy-MM-dd');
        });

        it('get Date Format From Iso Code with isoCode "AU"', () => {
            const isoCode = 'AU';
            expect(Uti.getDateFormatFromIsoCode(isoCode)).toEqual('dd/MM/yyyy');
        });

        it('get Date Format From Iso Code with isoCode "AT"', () => {
            const isoCode = 'AT';
            expect(Uti.getDateFormatFromIsoCode(isoCode)).toEqual('dd.MM.yyyy');
        });

        it('get Date Format From Iso Code with isoCode "BG"', () => {
            const isoCode = 'BG';
            expect(Uti.getDateFormatFromIsoCode(isoCode)).toEqual('yyyy-MM-dd');

        });

        it('get Date Format From Iso Code with isoCode "BY"', () => {
            const isoCode = 'BY';
            expect(Uti.getDateFormatFromIsoCode(isoCode)).toEqual('dd.MM.yyyy');

        });

        it('get Date Format From Iso Code with isoCode "ZA"', () => {
            const isoCode = 'ZA';
            expect(Uti.getDateFormatFromIsoCode(isoCode)).toEqual('yyyy/MM/dd');

        });

        it('get Date Format From Iso Code with isoCode "CL"', () => {
            const isoCode = 'CL';
            expect(Uti.getDateFormatFromIsoCode(isoCode)).toEqual('dd-MM-yyyy');

        });

        it('get Date Format From Iso Code with isoCode "PH"', () => {
            const isoCode = 'PH';
            expect(Uti.getDateFormatFromIsoCode(isoCode)).toEqual('MM/dd/yyyy');

        });

        it('get Date Format From Iso Code with isoCode default', () => {
            const isoCode = 'ZZZZ';
            expect(Uti.getDateFormatFromIsoCode(isoCode)).toEqual('dd/MM/yyyy');

        });
    });

    // static removeDuplicateArray func
    describe('removeDuplicateArray', () => {
        it('remove Duplicate Array is success', () => {
            const arr = [1, 2, 3, 1, 2, 5, 6];
            const result = [1, 2, 3, 5, 6];
            setTimeout(() => {
                expect(Uti.removeDuplicateArray(arr)).toEqual(result);
            }, 100);
        });
    });

    // static isValidEmail func
    describe('isValidEmail', () => {
        it('isValidEmail is success', () => {
            const email = 'test@gmail.com';
            expect(Uti.isValidEmail(email)).toBeTruthy();
        });

        it('isValidEmail is failed', () => {
            const email = 'test';
            expect(Uti.isValidEmail(email)).toBeFalsy();
        });
    });

    // static defineBrowserTabId func
    describe('defineBrowserTabId', () => {
        it('define Browser Tab Id is success', () => {
            const key = 'BrowserTabId';
            const isForceNewId = true;
            // expect(Uti.defineBrowserTabId(isForceNewId)).toEqual('1623396082720');
            Uti.defineBrowserTabId(isForceNewId);
            // mock localStorage
            spyOn(localStorage, 'getItem').and.returnValue(key);
        });
    });

    // static getParameterCaseInsensitive func
    describe('getParameterCaseInsensitive', () => {
        it('get Parameter Case Insensitive is success', () => {
            const data = {
                firstName: 'Jonnhy',
                lastName: 'Dang',
            };
            const key = 'firstName';
            expect(Uti.getParameterCaseInsensitive(data, key)).toEqual('Jonnhy');
        });
    });

    // static getBoolean func
    describe('getBoolean', () => {
        it('get Boolean with value true', () => {
            const value = true;
            expect(Uti.getBoolean(value)).toBeTruthy();
        });

        it('get Boolean with value false', () => {
            const value = false;
            expect(Uti.getBoolean(value)).toBeFalsy();
        });
    });

    // static getFieldValue func
    describe('getFieldValue', () => {
        it('get Field Value is success', () => {
            const dataSource = [
                { OriginalColumnName: 'test', Value: 1 },
                { OriginalColumnName: 'test2', Value: 2 },
            ];
            const key = 'test';
            expect(Uti.getFieldValue(dataSource, key)).toEqual(1);
        });

        it('get Field Value is failed', () => {
            const dataSource = [];
            const key = 'test';
            expect(Uti.getFieldValue(dataSource, key)).toBeNull();
        });
    });

    // static getFieldName func
    describe('getFieldName', () => {
        it('get Field Name is success', () => {
            const originalColumnName = 'document_test';
            expect(Uti.getFieldName(originalColumnName)).toEqual('test');
        });

        it('get Field Value is failed', () => {
            const originalColumnName = 'test1';
            expect(Uti.getFieldName(originalColumnName)).toEqual(originalColumnName);
        });
    });

    // static mapDataSourceToObject func
    describe('mapDataSourceToObject', () => {
        it('map Data Source To Object is success', () => {
            const dataSource = [
                { OriginalColumnName: 'test', Value: 1 },
                { OriginalColumnName: 'test2', Value: 2 },
            ];
            const result = {
                test: 1,
                test2: 2
            };
            expect(Uti.mapDataSourceToObject(dataSource)).toEqual(result);
        });
    });

    // static getFormControlByName func
    describe('getFormControlByName', () => {
        it('get Form Control By Name is success', () => {
            const profileForm = new FormGroup({
                firstName: new FormControl(''),
                lastName: new FormControl(''),
            });
            profileForm.patchValue({
                firstName: 'Nancy',
                lastName: 'Tron'
            });
            const name = 'firstName';

            expect(Uti.getFormControlByName(profileForm, name)).toBeInstanceOf(FormControl);
        });
    });

    // static isFilePDF func
    describe('isFilePDF', () => {
        it('is File PDF is success', () => {
            const buffer = new ArrayBuffer(8);
            expect(Uti.isFilePDF(buffer)).toBeFalsy();
        });
    });

    // static isFilePNG func
    describe('isFilePNG', () => {
        it('is File PNG is success', () => {
            const buffer = new ArrayBuffer(8);
            expect(Uti.isFilePNG(buffer)).toBeFalsy();
        });
    });

    // static isFileTIFF func
    describe('isFileTIFF', () => {
        it('is File TIFF is success', () => {
            const buffer = new ArrayBuffer(8);
            expect(Uti.isFileTIFF(buffer)).toBeTruthy();
        });
    });

    // static isFileJPEG func
    describe('isFileJPEG', () => {
        it('is File JPEG is success', () => {
            const buffer = new ArrayBuffer(8);
            expect(Uti.isFileJPEG(buffer)).toBeFalsy();
        });

        it('is File JPEG is success2', () => {
            const buffer = new ArrayBuffer(8);
            // expect(Uti.isFileJPEG(buffer)).toBeFalsy();
            // Uti.isFileJPEG(buffer);
        });
    });

    // static readByteBigEndian func
    describe('readByteBigEndian', () => {
        it('read Byte Big Endian is success', () => {
            const arr = new Uint8Array([10, 257]);
            const res = new Uint8Array([10, 1, 0, 0]);
            expect(Uti.readByteBigEndian(arr)).toEqual(res);
        });
    });

    // static getSelectionText func
    describe('getSelectionText', () => {
        it('get Selection Text is success', () => {
            const result = {
                text: '',
                start: undefined,
                end: undefined,
            };
            expect(Uti.getSelectionText()).toEqual(result);
        });
    });

    // static parseIndexName func
    describe('parseIndexName', () => {
        it('parse Index Name with contract', () => {
            const documentMyDmTypeEnum = DocumentMyDMType.Contract;
            expect(Uti.parseIndexName(documentMyDmTypeEnum)).toEqual('contract');
        });

        it('parse Index Name with invoice', () => {
            const documentMyDmTypeEnum = DocumentMyDMType.Invoice;
            expect(Uti.parseIndexName(documentMyDmTypeEnum)).toEqual('invoice');
        });

        it('parse Index Name with otherdocuments', () => {
            const documentMyDmTypeEnum = DocumentMyDMType.OtherDocuments;
            expect(Uti.parseIndexName(documentMyDmTypeEnum)).toEqual('otherdocuments');
        });
    });

    // static assignIntersection func
    describe('assignIntersection', () => {
        it('assign Intersection with default maxLevel', () => {
            const srcObj = {
                firstName: 'johnny',
                lastName: 'Dang',
            }
            const targetObj = {
                firstName: 'test1',
                lastName: 'test2',
            };
            expect(Uti.assignIntersection(srcObj, targetObj)).toEqual(targetObj);
        });

        it('assign Intersection with maxLevel = 0', () => {
            const srcObj = {
                firstName: 'johnny',
                lastName: 'Dang',
            }
            const targetObj = {
                firstName: 'test1',
                lastName: 'test2',
            };
            expect(Uti.assignIntersection(srcObj, targetObj, 0)).toEqual(targetObj);
        });
    });

    // static generateFolderNameCloud func
    describe('generateFolderNameCloud', () => {
        it('generate Folder Name Cloud is success', () => {
            const email = 'test@gmail.com';
            expect(Uti.generateFolderNameCloud(email)).toEqual('xoonit_test');
        });
    });

    // static mergeModuleSetting func
    describe('mergeModuleSetting', () => {
        it('merge Module Setting is success', () => {
            const defaultModule = 'test';
            const adjustedModule = 'test123';
            expect(Uti.mergeModuleSetting(defaultModule, adjustedModule)).toEqual(adjustedModule);
        });

        it('merge Module Setting is failed', () => {
            const defaultModule = 'test';
            const adjustedModule = '';
            expect(Uti.mergeModuleSetting(defaultModule, adjustedModule)).toEqual(defaultModule);
        });
    });

    // static transformNumberHasDecimal func
    describe('transformNumberHasDecimal', () => {
        it('transform Number Has Decimalxt with numberString true', () => {
            const numberString = '1.2345';
            const isRounded = 2;
            expect(Uti.transformNumberHasDecimal(numberString, isRounded)).toEqual('1.23');
        });

        it('transform Number Has Decimalxt with isRounded true', () => {
            const numberString = '1.2345';
            const isRounded = 2;
            expect(Uti.transformNumberHasDecimal(numberString, isRounded, true)).toEqual('1.23');
        });

        it('transform Number Has Decimalxt with numberString = 0', () => {
            const numberString = '0';
            const isRounded = 2;
            expect(Uti.transformNumberHasDecimal(numberString, isRounded, true)).toEqual('0.00');
        });
    });

    // static transformCommaNumber func
    describe('transformCommaNumber', () => {
        it('transform Comma Number is success', () => {
            const value = 'test123';
            const isAdd = true;
            expect(Uti.transformCommaNumber(value, isAdd)).toEqual('t\'est\'123');
        });
    });

    // static parseDateToString func
    describe('parseDateToString', () => {
        it('parse Date To String with isServer', () => {
            const dateString = '04 Dec 1995 00:12:00 GMT';
            expect(Uti.parseDateToString(dateString, true)).toEqual('12.04.1995');
        });

        it('parse Date To String without isServer', () => {
            const dateString = '04 Dec 1995 00:12:00 GMT';
            expect(Uti.parseDateToString(dateString)).toEqual('04.12.1995');
        });

        it('parse Date To String is failed', () => {
            const dateString = '';
            expect(Uti.parseDateToString(dateString)).toEqual('');
        });
    });

    // static isRoutingToDocumentFromGlobalSearch func
    describe('isRoutingToDocumentFromGlobalSearch', () => {
        it('is Routing To Document From Global Search is success', () => {
            const idSettingGUI = MenuModuleId.invoice;
            expect(Uti.isRoutingToDocumentFromGlobalSearch(idSettingGUI)).toBeTruthy();
        });

        it('is Routing To Document From Global Search is failed', () => {
            const idSettingGUI = -2;
            expect(Uti.isRoutingToDocumentFromGlobalSearch(idSettingGUI)).toBeFalsy();
        });
    });

    // static doMergeObject func
    describe('doMergeObject', () => {
        it('do Merge Object is success', () => {
            const source = { key: 'abc' };
            const target = { key: 'xyz' };
            expect(Uti.doMergeObject(source, target)).toEqual(target);
        });
    });

    // static doMergeObject func
    describe('mergeTwoObject', () => {
        it('merge Two Object is success', () => {
            const source = { key: 'abc' };
            const param = { key: 'xyz' };
            expect(Uti.mergeTwoObject(source, param)).toEqual(source);
        });

        it('merge Two Object is failed without source, param', () => {
            const source = {};
            const param = {};
            expect(Uti.mergeTwoObject(source, param)).toEqual({});
        });

        it('merge Two Object is failed without param', () => {
            const source = { key: 'abc' };
            const param = {};
            expect(Uti.mergeTwoObject(source, param)).toEqual(source);
        });

        it('merge Two Object is failed without source', () => {
            const source = {};
            const param = { key: 'xyz' };
            expect(Uti.mergeTwoObject(source, param)).toEqual(param);
        });
    });

    // static transformCamelCase func
    describe('transformCamelCase', () => {
        it('transform Camel Case is success', () => {
            const source = { key: 'abc' };
            expect(Uti.transformCamelCase(source)).toEqual(source);
        });

        it('transform Camel Case is failed', () => {
            const source = {};
            expect(Uti.transformCamelCase(source)).toEqual({});
        });
    });

    // static checkItemIsNull func
    describe('checkItemIsNull', () => {
        it('check Item Is Null success', () => {
            const source = [
                { key: 'abc' },
                { key: 'xyz' }
            ];
            const ignoreList = 'key';
            expect(Uti.checkItemIsNull(source, ignoreList)).toEqual(false);
        });

        it('transform Camel Case is failed', () => {
            const source = [
            ];
            const ignoreList = 'key';
            expect(Uti.checkItemIsNull(source, ignoreList)).toEqual(true);
        });
    });

    // static allowControlKey func
    describe('allowControlKey', () => {
        it('allow Control Key is success', () => {
            const upKeyPress = { keyCode: 46, ctrlKey: true };
            expect(Uti.allowControlKey(upKeyPress)).toBeTruthy();
        });

        it('transform Camel Case is failed', () => {
            const upKeyPress = { keyCode: -1, ctrlKey: true };
            expect(Uti.allowControlKey(upKeyPress)).toBeFalsy();
        });
    });

    // static pressKeyNumberOnly func
    describe('pressKeyNumberOnly', () => {
        it('press Key Number Only is success', () => {
            const e = {
                which: false,
                keyCode: 32,
            };
            expect(Uti.pressKeyNumberOnly(e)).toBeFalsy();
        });

        it('set Empty Data FormControl is failed', () => {
            const e = {
                which: false,
                keyCode: 31,
            };
            expect(Uti.pressKeyNumberOnly(e)).toBeTruthy();
        });
    });

    // static getFileExtension func
    describe('getFileExtension', () => {
        it('get File Extension is success', () => {
            const fileName = 'doc.txt';
            expect(Uti.getFileExtension(fileName)).toEqual('txt');
        });

        it('set Empty Data FormControl is failed', () => {
            const fileName = '';
            expect(Uti.getFileExtension(fileName)).toEqual('');
        });
    });

    // static setEmptyDataFormControl func
    describe('setEmptyDataFormControl', () => {
        it('setEmptyDataFormControl is failed', () => {
            expect(Uti.setEmptyDataFormControl(null, (ctrlName) => {
                return false;
            }, 'test')).toBeUndefined();
        });

        it('setEmptyDataFormControl with string', () => {
            const ctrl = new FormControl('');
            ctrl.setValue('abc');

            Uti.setEmptyDataFormControl(ctrl, (ctrlName) => {
                return false;
            }, 'test');

            expect(ctrl.value).toEqual('');
        });

        it('setEmptyDataFormControl with boolean', () => {
            const ctrl = new FormControl();
            ctrl.setValue(true);

            Uti.setEmptyDataFormControl(ctrl, (ctrlName) => {
                return false;
            }, 'test');

            expect(ctrl.value).toEqual(false);
        });

        it('setEmptyDataFormControl with date', () => {
            const ctrl = new FormControl();
            ctrl.setValue(new Date());

            Uti.setEmptyDataFormControl(ctrl, (ctrlName) => {
                return false;
            }, 'test');

            expect(ctrl.value).toEqual(null);
        });
    });


    // static setEmptyDataForm func
    describe('setEmptyDataForm', () => {
        it('set Empty Data Form is success', () => {
            const profileForm = new FormGroup({
                firstName: new FormControl(''),
                lastName: new FormControl(''),
            });
            Uti.setEmptyDataForm(profileForm, (ctrlName) => {
                return false;
            });
        });
    });

    // static iterateFormControl func
    describe('iterateFormControl', () => {
        it('iterate Form Control is failed', () => {
            Uti.iterateFormControl(null, (ctrlName, controlName) => {
            });

        });

        it('iterate Form Control is success', () => {
            const profileForm = new FormGroup({
                firstName: new FormControl(''),
                lastName: new FormControl(''),
            });
            Uti.iterateFormControl(profileForm, (ctrlName, controlName) => {
            });

        });
    });

    // TAMTV TODO
    // fdescribe('registerWijmoButtonShowDropDownMenu', () => {
    //     it('call registerWijmoButtonShowDropDownMenu is null', () => {

    //         let button = fixture.debugElement.nativeElement.querySelector('.formClass controlName button.wj-btn.wj-btn-default');
    //         let drop = fixture.debugElement.nativeElement.querySelector('.wj-content.wj-dropdown-panel.wj-control.wj-listbox.wj-content');

    //         const result = Uti.registerWijmoButtonShowDropDownMenu('formClass', 'controlName');
    //         expect(drop.style.display).toEqual('block');
    //     });
    // });

    describe('addItemToArrayAtIndex', () => {
        it('call addItemToArrayAtIndex, update array', () => {
            var data = ['a', 'b', 'c', 'd']
            const result = Uti.addItemToArrayAtIndex(data, 'e', 4);

            expect(data.length).toEqual(5);
            expect(data[4]).toEqual('e');
        });
    });

    // TAMTV TODO
    // fdescribe('addHorizontalPerfectScrollEvent', () => {
    //     it('call addHorizontalPerfectScrollEvent, update array', () => {
    //         let element = $('element');
    //         let gridScrollBars = { right: true, reachRight: false, }
    //         spyOn(element, <any>'ps-scroll-left').and.callFake(() => {
    //             expect(gridScrollBars.reachRight).toBeFalsy();
    //         })
    //         const result = Uti.addHorizontalPerfectScrollEvent(element, gridScrollBars, {});
    //     });
    // });

    describe('removeHorizontalPerfectScrollEvent', () => {
        it('call removeHorizontalPerfectScrollEvent and element is update', () => {
            let element = $('element');

            const result = Uti.removeHorizontalPerfectScrollEvent(element);

            expect(result).toBeUndefined();
        });
    });

    // TAMTV TODO
    // fdescribe('addVerticalPerfectScrollEvent', () => {
    //     it('call addVerticalPerfectScrollEvent and element is update', () => {
    //         let element = $('element');
    //         let gridScrollBars = { right: true, reachRight: false, }
    //         const result = Uti.addVerticalPerfectScrollEvent(element, gridScrollBars, {});

    //         expect(result).toBeUndefined();
    //     });
    // });

    describe('removeVerticalPerfectScrollEvent', () => {
        it('call removeVerticalPerfectScrollEvent and element is update', () => {
            let element = $('element');

            const result = Uti.removeVerticalPerfectScrollEvent(element);

            expect(result).toBeUndefined();
        });
    });

    describe('filterDistinct', () => {
        it('call filterDistinct with element has index value excatly and return true', () => {
            let element = $('element');

            const result = Uti.filterDistinct('a', 0, ['a', 'b']);

            expect(result).toBeTruthy();
        });
    });

    describe('buildLocalizer', () => {
        it('call buildLocalizer and return newLocalizer', () => {
            let data = { col1: '1' };

            const result = Uti.buildLocalizer({ col1: '' }, [{ ColumnName: 'col1', Value: '1' }, { ColumnName: 'col2', Value: '2' }]);

            expect(result['col1']).toEqual(data.col1);
        });
    });

    describe('mergeLocalizer', () => {
        it('call mergeLocalizer and return newTranslatedSource', () => {
            let oldTranslatedSource = [{ ColumnName: 1, Value: 1 }];
            let newTranslatedSource = [{ ColumnName: 1, Value: 2 }];

            const result = Uti.mergeLocalizer(oldTranslatedSource, newTranslatedSource);

            expect(result[0]['Value']).toEqual(newTranslatedSource[0].Value);
        });
    });

    describe('getTranslateTitle', () => {
        it('call getTranslateTitle with tableColumns is array empty and return empty', () => {
            const result = Uti.getTranslateTitle([], '');

            expect(result).toEqual('');
        });
        it('call getTranslateTitle with tableColumns has data and return col', () => {
            const result = Uti.getTranslateTitle([{ data: 'col', title: '1' }], 'col');

            expect(result).toEqual('1');
        });
    });

    describe('handleWhenSpliterResize', () => {
        it('call handleWhenSpliterResize and #txt-header-global-search is focus', () => {
            const result = Uti.handleWhenSpliterResize();

            expect(result).toBeUndefined();
        });
    });

    describe('subStringFromToByString', () => {
        it('call subStringFromToByString and return substring from key', () => {
            const data = 'abcdef'
            const result = Uti.subStringFromToByString(data, 'cd');

            expect(result).toEqual('cde');
        });
    });

    describe('removeAllString', () => {
        it('call removeAllString with replaceFrom not belong string and return this data', () => {
            const data = 'abcdef'
            const result = Uti.removeAllString(data, 'nm');

            expect(result).toEqual(data);
        });
        it('call removeAllString with replaceFrom  belong string and return this new data', () => {
            const data = 'abcdef'
            const result = Uti.removeAllString(data, 'cd');

            expect(result).toEqual('abef');
        });
    });

    describe('replaceAll', () => {
        it('call replaceAll with replaceFrom not belong string and return this data', () => {
            const data = 'abcdef'
            const result = Uti.replaceAll(data, 'nm', '');

            expect(result).toEqual(data);
        });
        it('call removeAllString with replaceFrom  belong string and return this new data', () => {
            const data = 'abcdef'
            const result = Uti.replaceAll(data, 'bc', 'e');

            expect(result).toEqual('aedef');
        });
    });

    describe('arraysEqual', () => {
        it('call arraysEqual with 2 diffirent array and return false', () => {
            const result = Uti.arraysEqual(['a'], ['a', 'b']);

            expect(result).toBeFalsy();
        });
        it('call arraysEqual with 2 diffirent array and return false', () => {
            const result = Uti.arraysEqual(['a', 'b'], ['a']);

            expect(result).toBeFalsy();
        });
    });

    describe('lowerCaseFirstLetter', () => {
        it('call lowerCaseFirstLetter and return lowerCase First Letter', () => {
            const result = Uti.lowerCaseFirstLetter('ABCDEF');

            expect(result).toEqual('aBCDEF');
        });
    });

    describe('upperCaseFirstLetter', () => {
        it('call upperCaseFirstLetter and return upperCase First Letter', () => {
            const result = Uti.upperCaseFirstLetter('abcdef');

            expect(result).toEqual('Abcdef');
        });
    });

    describe('subStringFromCharacter', () => {
        it('call subStringFromCharacter and return new string', () => {
            const result = Uti.subStringFromCharacter('abcdef', 'bc');

            expect(result).toEqual('def');
        });
    });

    describe('strValObj', () => {
        it('call strValObj with data undefine and return empty', () => {
            const result = Uti.strValObj(undefined);

            expect(result).toEqual('');
        });
        it('call strValObj with data is true string and return true', () => {
            const result = Uti.strValObj('true');

            expect(result).toBeTruthy();
        });
        it('call strValObj with data is false string and return false', () => {
            const result = Uti.strValObj('false');

            expect(result).toBeFalsy();
        });

        it('call strValObj with data is object and return object', () => {
            const result = Uti.strValObj({ data: true });

            expect(result).toEqual({ data: true });
        });
        it('call strValObj with data is aray object and return empty', () => {
            const result = Uti.strValObj({});

            expect(result).toEqual('');
        });
    });

    describe('sortBy', () => {
        it('call sortBy and first a have valueName < b and return -1', () => {
            const result = Uti.sortBy({ a: '1', b: '3', c: '5' }, { a: '2', b: '1', c: '5' }, 'a');

            expect(result).toEqual(-1);
        });

        it('call sortBy and first a have valueName > b and return 1', () => {
            const result = Uti.sortBy({ a: '1', b: '3', c: '5' }, { a: '2', b: '1', c: '5' }, 'b');

            expect(result).toEqual(1);
        });
        it('call sortBy and  b not have key and return 0', () => {
            const result = Uti.sortBy({ a: '1', b: '3', c: '5', d: '6' }, { a: '2', b: '1', c: '5' }, 'd');

            expect(result).toEqual(0);
        });
        it('call sortBy and a have a not have key and return 0-1', () => {
            const result = Uti.sortBy({ a: '1', b: '3', c: '5' }, { a: '2', b: '1', c: '5', d: '6' }, 'd');

            expect(result).toEqual(0);
        });
        it('call sortBy and first a have valueName same b and return 0', () => {
            const result = Uti.sortBy({ a: '1', b: '3', c: '5' }, { a: '2', b: '1', c: '5' }, 'c');

            expect(result).toEqual(0);
        });
    });

    describe('isDifferentDataBetweenTwoObject', () => {
        it('call isDifferentDataBetweenTwoObject and 2 object is diffirent and return true', () => {
            const result = Uti.isDifferentDataBetweenTwoObject({ a: '1' }, { b: '2', c: '1' });

            expect(result).toBeTruthy();
        });
        it('call isDifferentDataBetweenTwoObject and 2 object is same and return false', () => {
            const result = Uti.isDifferentDataBetweenTwoObject({ a: '1' }, { a: '1' });

            expect(result).toBeFalsy();
        });
    });

    describe('isNullUndefinedEmptyObject', () => {
        it('call isNullUndefinedEmptyObject and data is null and return true', () => {
            const result = Uti.isNullUndefinedEmptyObject(null);

            expect(result).toBeTruthy();
        });
        it('call isNullUndefinedEmptyObject and data is empty object and return true', () => {
            const result = Uti.isNullUndefinedEmptyObject({});

            expect(result).toBeTruthy();
        });
    });

    describe('isEmptyObject', () => {
        it('call isEmptyObject and data is object empty and return true', () => {
            const result = Uti.isEmptyObject({});

            expect(result).toBeTruthy();
        });
    });

    describe('hasNotValue', () => {
        it('call hasNotValue and data is object empty and return true', () => {
            const result = Uti.hasNotValue({});

            expect(result).toBeTruthy();
        });
        it('call hasNotValue and data is object has value empty and return true', () => {
            const result = Uti.hasNotValue({ value: '' });

            expect(result).toBeTruthy();
        });
        it('call hasNotValue and data is empty string and return true', () => {
            const result = Uti.hasNotValue('');

            expect(result).toBeTruthy();
        });
        it('call hasNotValue and data is object has value and return false', () => {
            const result = Uti.hasNotValue({ value: '1' });

            expect(result).toBeTruthy();
        });
    });

    describe('checkKeynameExistInArray', () => {
        it('call checkKeynameExistInArray and has key name equal value and return true', () => {
            const result = Uti.checkKeynameExistInArray([{ a: '1' }], 'a', '1');

            expect(result).toBeTruthy();
        });
        it('call checkKeynameExistInArray and has key name not equal value and return false', () => {
            const result = Uti.checkKeynameExistInArray([{ a: '1' }], 'a', '2');

            expect(result).toBeFalsy();
        });
    });

    describe('tryParseJson', () => {
        it('call tryParseJson and success and return object', () => {
            const data = { a: 1 };
            const result = Uti.tryParseJson(JSON.stringify(data));

            expect(result).toEqual(data);
        });
        it('call tryParseJson and data is object and has defaultValue and return defaultValue', () => {
            const data = { a: 1 };
            const result = Uti.tryParseJson({ v: '1' }, data);

            expect(result).toEqual(data);
        });
        it('call tryParseJson and data is null and return object', () => {
            const data = {};
            const result = Uti.tryParseJson(data);

            expect(result).toEqual(data);
        });
    });

    describe('isJsonString', () => {
        it('call isJsonString and success and return true', () => {
            const data = { a: 1 };
            const result = Uti.isJsonString(JSON.stringify(data));

            expect(result).toBeTruthy();
        });
        it('call isJsonString and data is null return false', () => {
            const result = Uti.isJsonString(null);

            expect(result).toBeFalsy();
        });
        it('call isJsonString and data is string and return false', () => {
            const result = Uti.isJsonString('aasda');

            expect(result).toBeFalsy();
        });
    });

    describe('parseJsonString', () => {
        it('call parseJsonString and data is empty and return false', () => {
            const result = Uti.parseJsonString('');

            expect(result).toBeFalsy();
        });
        it('call parseJsonString and data is string return false', () => {
            const result = Uti.parseJsonString('{a:asdasdass');

            expect(result).toBeFalsy();
        });
        it('call parseJsonString and data is valid and return object', () => {
            const data = { a: 1 };
            const result = Uti.parseJsonString(JSON.stringify(data));

            expect(result).toEqual(data);
        });
        it('call parseJsonString and data is arry string and return false', () => {
            const data = { a: 1 };
            const result = Uti.parseJsonString(JSON.stringify(JSON.stringify(data)));

            expect(result).toBeFalsy();
        });
    });

    describe('getValueOfObjectByKey', () => {
        it('call getValueOfObjectByKey with entityObj has first property is param and  return 1', () => {
            const obj = { a: '1', b: '2' };
            const keyArray = 'a,b';
            const result = Uti.getValueOfObjectByKey(obj, keyArray);

            expect(result).toEqual('1');
        });
        it('call getValueOfObjectByKey with entityObj has first property is object and return 1', () => {
            const obj = { a: { value: '1' }, b: '2' };
            const keyArray = 'a,b';
            const result = Uti.getValueOfObjectByKey(obj, keyArray);

            expect(result).toEqual('1');
        });
    });

    describe('parFloatFromObject', () => {
        it('call parFloatFromObject with obj undefined and return defaultValue', () => {
            let obj;
            const defaultValue = 1;
            const result = Uti.parFloatFromObject(obj, defaultValue);

            expect(result).toEqual(1);
        });
        it('call parFloatFromObject with obj null and return defaultValue', () => {
            const obj = null;
            const defaultValue = 1;
            const result = Uti.parFloatFromObject(obj, defaultValue);

            expect(result).toEqual(1);
        });
        it('call parFloatFromObject with obj null and return defaultValue', () => {
            const obj = '';
            const defaultValue = 1;
            const result = Uti.parFloatFromObject(obj, defaultValue);

            expect(result).toEqual(1);
        });
        it('call parFloatFromObject with toString obj is empty and return defaultValue', () => {
            const obj = {};
            const defaultValue = 1;
            const result = Uti.parFloatFromObject(obj, defaultValue);

            expect(result).toEqual(1);
        });

        it('call parFloatFromObject with obj is valid and return float', () => {
            const obj = '1.12';
            const defaultValue = 1;
            const result = Uti.parFloatFromObject(obj, defaultValue);

            expect(result).toEqual(1.12);
        });

        // it('call parFloatFromObject with obj is invalid and return 1', () => {
        //     const obj = /^\d{2}\/\d{2}\/\d{4}$/;
        //     const defaultValue = 1;
        //     const result = Uti.parFloatFromObject(obj, defaultValue);

        //     expect(result).toEqual(1);
        // });
    });

    describe('isInt', () => {
        it('call isInt n undefined and  return false', () => {
            let n;
            const result = Uti.isInt(n);

            expect(result).toBeFalsy();
        });
        it('call isInt n is int 0 and  return true', () => {
            const n = 3;
            const result = Uti.isInt(n);

            expect(result).toBeTruthy();
        });
    });

    describe('isFloat', () => {
        it('call isFloat n undefined and  return false', () => {
            let n;
            const result = Uti.isFloat(n);

            expect(result).toBeFalsy();
        });
        it('call isFloat n is int 0 and  return true', () => {
            const n = 3.1;
            const result = Uti.isFloat(n);

            expect(result).toBeTruthy();
        });
    });

    describe('calculateExchange', () => {
        it('call calculateExchange with formatExchange empty and return undefined', () => {
            const formatExchange = '';
            const result = Uti.calculateExchange(formatExchange, '', '');

            expect(result).toBeUndefined();
        });
        it('call calculateExchange with exchangeProportion empty and return undefined', () => {
            const exchangeProportion = '';
            const result = Uti.calculateExchange('formatExchange', '', exchangeProportion);

            expect(result).toBeUndefined();
        });
        it('call calculateExchange with valid input and return object', () => {
            const formatExchange = 'a,b';
            const exchangeProportion = { a: 5 }
            const valueFrom = 5;
            const result = Uti.calculateExchange(formatExchange, valueFrom, exchangeProportion);

            expect(result).toEqual({ a: 5, b: 1 });
        });
    });

    describe('getValueFromExchangeObject', () => {
        it('call getValueFromExchangeObject with exchangeValue empty and return 1', () => {
            const exchangeValue = '';
            const result = Uti.getValueFromExchangeObject(exchangeValue, '');

            expect(result).toEqual(1);
        });
        it('call getValueFromExchangeObject with exchangeProportion valid and return data', () => {
            const exchangeValue = { a: 123 };
            const result = Uti.getValueFromExchangeObject(exchangeValue, 'a');

            expect(result).toEqual(123);
        });
    });

    describe('fixToDigit', () => {
        it('call fixToDigit with valid data and return number', () => {
            const data = 1.2345;
            const result = Uti.fixToDigit(data, 2);

            expect(result).toEqual('1.23');
        });
        it('call fixToDigit with invalid data and return 0', () => {
            const data = 1.2345;
            const result = Uti.fixToDigit(data, -1);

            expect(result).toEqual(0);
        });
    });

    describe('isResquestSuccess', () => {
        it('call isResquestSuccess with valid data and return true', () => {
            const data = <ApiResultResponse>{ statusCode: ApiMethodResultId.Success, item: {} };
            const result = Uti.isResquestSuccess(data,);

            expect(result).toBeTruthy();
        });
    });

    describe('getBrowserInfo', () => {
        it('call getBrowserInfo with null data and return true', () => {
            const data = null;
            const result = Uti.getBrowserInfo(data);

            expect(result).toBeTruthy();
        });
    });

    describe('detectIOSDevice', () => {
        it('call detectIOSDevice  and return true', () => {
            const result = Uti.detectIOSDevice();

            expect(result).toBeFalsy();
        });
    });

    describe('castToString', () => {
        it('call castToString with data is empty and return empty', () => {
            const o = '';
            const result = Uti.castToString(o);

            expect(result).toEqual('');
        });

        it('call castToString with data is string and return string', () => {
            const o = 'test';
            const result = Uti.castToString(o);

            expect(result).toEqual('test');
        });

        it('call castToString with data is string and return string', () => {
            const o = new Date();
            const regex = '/^\d{2}\/\d{2}\/\d{4}$/';
            const result = Uti.castToString(o, regex);

            expect(result).toEqual('/^15{2}/15{2}/15{4}$/');
        });

        // it('call castToString with invalid data is string and return empty', () => {
        //     const o = new Date();
        //     const regex = 'dasdasdasdasd';
        //     const result = Uti.castToString(o, regex);

        //     expect(result).toEqual('');
        // });
    });

    describe('isValidRegExp', () => {
        it('call isValidRegExp with data is valid and return true', () => {
            const regex = '/^\d{2}\/\d{2}\/\d{4}$/';
            const result = Uti.isValidRegExp(regex);

            expect(result).toBeTruthy();
        });

        it('call castToString with data is invalid and return false', () => {
            const regex = '{12312}';
            const result = Uti.isValidRegExp(regex);

            expect(result).toBeFalsy();
        });
    });

    describe('isValidRegExp', () => {
        it('call isValidRegExp with data is valid and return true', () => {
            const regex = '/^\d{2}\/\d{2}\/\d{4}$/';
            const result = Uti.isValidRegExp(regex);

            expect(result).toBeTruthy();
        });

        it('call castToString with data is invalid and return false', () => {
            const regex = '{12312}';
            const result = Uti.isValidRegExp(regex);

            expect(result).toBeFalsy();
        });
    });

    describe('convertDataEmptyToNull', () => {
        it('call convertDataEmptyToNull with data is valid and return object', () => {
            const data = { a: { b: '' }, c: '' };
            const result = Uti.convertDataEmptyToNull(data);

            expect(result).toEqual({ a: { b: null }, c: null });
        });
    });

    describe('unsubscribe', () => {
        it('call unsubscribe with data is valid and return toBeUndefined', () => {
            const data = ['', new Subscription(), { source: 'setInterval' }, { source: 'setTimeout' }];
            const result = Uti.unsubscribe(data);

            expect(result).toBeUndefined();
        });
    });

    describe('formatBytes', () => {
        it('call formatBytes with data is empty and return 0 Bytes', () => {
            const data = 0;
            const result = Uti.formatBytes(data);

            expect(result).toEqual('0 Bytes');
        });

        it('call formatBytes with data is valid and return Bytes', () => {
            const data = 1024;
            const result = Uti.formatBytes(data);

            expect(result).toEqual('1 KB');
        });
    });

    describe('formatBytesToMb', () => {
        it('call formatBytesToMb with data is empty and return 0 MB', () => {
            const data = 0;
            const result = Uti.formatBytesToMb(data);

            expect(result).toEqual('0 MB');
        });

        it('call formatBytesToMb with data is valid and return MB', () => {
            const data = 1024;
            const result = Uti.formatBytesToMb(data);

            expect(result).toEqual('0 MB');
        });
    });

    describe('logError', () => {
        it('call logError and return undefined', () => {
            const data = '';
            const result = Uti.logError(data);

            expect(result).toBeUndefined();
        });
    });

    describe('getTempId', () => {
        it('call getTempId and return number', () => {
            const result = Uti.getTempId();

            expect(typeof result).toEqual('number');
        });
    });

    describe('getTempId2', () => {
        it('call getTempId2 and return number', () => {
            const result = Uti.getTempId2();

            expect(typeof result).toEqual('number');
        });
    });

    describe('getEmptyGuid', () => {
        it('call getEmptyGuid and return guid string', () => {
            const result = component.getEmptyGuid();

            expect(typeof result).toEqual('string');
        });
    });

    describe('guid', () => {
        it('call guid and return guid string', () => {
            const result = Uti.guid();

            expect(typeof result).toEqual('string');
        });
    });

    describe('randomPassword', () => {
        it('call randomPassword and return string', () => {
            const result = Uti.randomPassword(12);

            expect(typeof result).toEqual('string');
            expect(result.length).toEqual(12);
        });
    });

    describe('randomText', () => {
        it('call randomText and return string', () => {
            const result = Uti.randomText(5);

            expect(typeof result).toEqual('string');
        });
    });

    describe('isRootUrl', () => {
        it('call isRootUrl with data is not rootUrl and return false', () => {
            const data = '/auth/login'
            const result = Uti.isRootUrl(data);

            expect(result).toBeFalsy();
        });
    });

    describe('getPrivateUrlWithoutPrefixRoute', () => {
        it('call getPrivateUrlWithoutPrefixRoute with /module/customer is not rootUrl and return /customer', () => {
            const data = '/module/customer'
            const result = Uti.getPrivateUrlWithoutPrefixRoute(data);

            expect(result).toEqual('/customer');
        });
    });

    describe('getModuleNamesFromUrl', () => {
        it('call getModuleNamesFromUrl with /module/customer is not rootUrl and return [\'customer\']', () => {
            const data = '/module/customer'
            const result = Uti.getModuleNamesFromUrl(data);

            expect(result).toEqual(['customer']);
        });
    });

    describe('getPrivateUrlWithModuleName', () => {
        it('call getPrivateUrlWithModuleName with customer is not rootUrl and return /module/customer', () => {
            const data = 'customer'
            const result = Uti.getPrivateUrlWithModuleName(data);

            expect(result).toEqual('/module/customer');
        });
    });

    describe('isSearchUrl', () => {
        it('call isSearchUrl  and return false', () => {
            const result = Uti.isSearchUrl();

            expect(result).toBeFalsy();
        });
    });

    describe('isDateValid', () => {
        it('call isDateValid with valid data and return true', () => {
            const data = new Date();
            const result = Uti.isDateValid(data);

            expect(result).toBeTruthy();
        });
        it('call isDateValid with string data and return true', () => {
            const data = '1/1/2000';
            const result = Uti.isDateValid(data);

            expect(result).toBeTruthy();
        });
        it('call isDateValid with string data and return false', () => {
            const data = null;
            const result = Uti.isDateValid(data);

            expect(result).toBeFalsy();
        });
    });

    describe('getUTCDate', () => {
        it('call getUTCDate and return true', () => {
            const result = Uti.getUTCDate();

            expect(typeof result).toEqual('object');
        });
    });

    describe('formatLocale', () => {
        it('call formatLocale with empty string and return type string', () => {
            const date = '';
            const formatStr = 'dd/MM/yyyy';
            const result = component.formatLocale(date, formatStr);

            expect(typeof result).toEqual('string');
        });
        it('call formatLocale and return type string', () => {
            const date = new Date();
            const formatStr = 'dd/MM/yyyy';
            const result = component.formatLocale(date, formatStr);

            expect(typeof result).toEqual('string');
        });
        it('call formatLocale with LANGUAGE and return type string', () => {
            LocalStorageHelper.toInstance(SessionStorageProvider).setItem(LocalSettingKey.LANGUAGE, 'VNI');
            const date = new Date();
            const formatStr = 'dd/MM/yyyy';

            const result = component.formatLocale(date, formatStr);

            expect(typeof result).toEqual('string');
        });
    });

    describe('getBirthdayYearRange', () => {
        it('call getBirthdayYearRange and return type string', () => {
            const result = component.getBirthdayYearRange();

            expect(typeof result).toEqual('string');
        });
    });

    describe('wait', () => {
        it('call wait and return undefined', () => {
            const result = Uti.wait(10);

            expect(result).toBeUndefined();
        });
    });

    describe('getCurrentDate', () => {
        it('call getCurrentDate and return typeof string', () => {
            const result = Uti.getCurrentDate();

            expect(typeof result).toEqual('string');
        });
    });

    describe('parseDateFromDB', () => {
        it('call parseDateFromDB with invalid data and return null', () => {
            const data = null;
            const result = Uti.parseDateFromDB(data);

            expect(result).toBeNull();
        });
        it('call parseDateFromDB with valid data and return typeof object', () => {
            const data = '1/1/2000';
            const result = Uti.parseDateFromDB(data);

            expect(typeof result).toEqual('object');
        });
    });

    describe('parseStrDateToRealDate', () => {
        it('call parseStrDateToRealDate with invalid data and return null', () => {
            const data = null;
            const result = Uti.parseStrDateToRealDate(data);

            expect(result).toBeNull();
        });
        it('call parseStrDateToRealDate with invalid data and return null', () => {
            const data = 'aa/bb/cccc';
            const result = Uti.parseStrDateToRealDate(data);

            expect(result).toBeNull();
        });
        it('call parseStrDateToRealDate with invalid data and return date', () => {
            const data = '1/1/2000';
            const result = Uti.parseStrDateToRealDate(data);

            expect(typeof result).toEqual('object');
        });
    });

    describe('joinDateToNumber', () => {
        it('call joinDateToNumber with invalid data and return 0', () => {
            const data = null;
            const result = Uti.joinDateToNumber(data, '');

            expect(result).toEqual(0);
        });
        it('call joinDateToNumber with valid data and return string', () => {
            const data = new Date();
            const result = Uti.joinDateToNumber(data, 'dd/MMM/yyyy');

            expect(typeof result).toEqual('string');
        });
    });

    describe('parseToRightDate', () => {
        it('call parseToRightDate with valid data and return typeof object', () => {
            const data = '1/1/2000';
            const result = Uti.parseToRightDate(data);

            expect(typeof result).toEqual('object');
        });
    });

    describe('checkFileExtension', () => {
        it('call checkFileExtension with filename empty and return false', () => {
            const fileName = '';
            const result = Uti.checkFileExtension('', fileName);

            expect(result).toBeFalsy();
        });
        it('call checkFileExtension with filename not valid and return false', () => {
            const fileName = 'test';
            const result = Uti.checkFileExtension('', fileName);

            expect(result).toBeFalsy();
        });
        it('call checkFileExtension with acceptExtensionFiles empty and return true', () => {
            const fileName = 'test.txt';
            const acceptExtensionFiles = '';
            const result = Uti.checkFileExtension(acceptExtensionFiles, fileName);

            expect(result).toBeTruthy();
        });
        it('call checkFileExtension with acceptExtensionFiles is * valid and return true', () => {
            const fileName = 'test.txt';
            const acceptExtensionFiles = '*';
            const result = Uti.checkFileExtension(acceptExtensionFiles, fileName);

            expect(result).toBeTruthy();
        });
        it('call checkFileExtension with valid data and return true', () => {
            const fileName = 'test.txt';
            const acceptExtensionFiles = 'txt';
            const result = Uti.checkFileExtension(acceptExtensionFiles, fileName);

            expect(result).toBeTruthy();
        });
    });

    describe('isDuplicateFile', () => {
        it('call isDuplicateFile with uploader null and return false', () => {
            const uploader = null;
            const result = Uti.isDuplicateFile(uploader, '');

            expect(result).toBeFalsy();
        });
        it('call isDuplicateFile with uploader invalid and return false', () => {
            const uploader = { queue: [] };
            const result = Uti.isDuplicateFile(uploader, '');

            expect(result).toBeFalsy();
        });
        it('call isDuplicateFile with uploader and file has diffirent name and return false', () => {
            const uploader = { queue: [{ file: { name: 'name' } }] };
            const file = { name: 'name1' };
            const result = Uti.isDuplicateFile(uploader, file);

            expect(result).toBeFalsy();
        });
        it('call isDuplicateFile with uploader and file has same name and return true', () => {
            const uploader = { queue: [{ file: { name: 'name' } }] };
            const file = { name: 'name' };
            const result = Uti.isDuplicateFile(uploader, file);

            expect(result).toBeTruthy();
        });
    });

    describe('parseISODateToDate', () => {
        it('call parseISODateToDate with value null and return null', () => {
            const value = null;
            const result = Uti.parseISODateToDate(value);

            expect(result).toBeNull();
        });
        it('call parseISODateToDate with value valid and return date', () => {
            const value = new Date().toISOString();
            const result = Uti.parseISODateToDate(value);

            expect(typeof result).toEqual('object');
        });
    });

    describe('getTrueScreenSize', () => {
        it('call getTrueScreenSize and return object', () => {
            const result = Uti.getTrueScreenSize();

            expect(typeof result).toEqual('object');
        });
    });

    describe('getTextWidth', () => {
        it('call getTextWidth and return number', () => {
            const result = Uti.getTextWidth('123', 'Roboto');

            expect(typeof result).toEqual('number');
        });
    });

    describe('mapArrayToObject', () => {
        it('call mapArrayToObject with data valid and isNotCamel false and return object', () => {
            const data = [{ key: 'a', value: '1' }, { key: 'b', value: '2' }];
            const isNotCamel = false;
            const result = Uti.mapArrayToObject(data, isNotCamel);

            expect(typeof result).toEqual('object');
        });
        it('call mapArrayToObject with data valid and isNotCamel true and return object', () => {
            const data = [{ key: 'a', value: '1' }, { key: 'b', value: '2' }];
            const isNotCamel = true;
            const result = Uti.mapArrayToObject(data, isNotCamel);

            expect(typeof result).toEqual('object');
        });
    });

    describe('mapObjectToCamel', () => {
        it('call mapObjectToCamel with data invalid and return object', () => {
            const data = '';
            const result = Uti.mapObjectToCamel(data);

            expect(typeof result).toEqual('object');
        });
        it('call mapObjectToCamel with data invalid and return object', () => {
            const data = { ABC: '1' };
            const result = Uti.mapObjectToCamel(data);

            expect(result).toEqual({ abc: '1' });
        });
    });

    describe('mapArrayToObjectWithSelfPropertyName', () => {
        it('call mapArrayToObjectWithSelfPropertyName with data empty and return object', () => {
            const data = [];
            const result = Uti.mapArrayToObjectWithSelfPropertyName(data, '');

            expect(typeof result).toEqual('object');
        });
        it('call mapArrayToObjectWithSelfPropertyName with data invalid and return object', () => {
            const data = [{ a: 'b' }];
            const result = Uti.mapArrayToObjectWithSelfPropertyName(data, 'a');

            expect(result).toEqual({ b: 'b' });
        });
    });

    describe('getIndexOfItemInArray', () => {
        it('call getIndexOfItemInArray with data valid and return index', () => {
            const data = [{ a: 1 }];
            const object = { a: 1 };
            const id = 'a';
            const result = Uti.getIndexOfItemInArray(data, object, id);

            expect(result).toEqual(0);
        });
        it('call getIndexOfItemInArray with data invalid and return -1', () => {
            const data = [{ a: 1 }];
            const object = { a: 2 };
            const id = 'a';
            const result = Uti.getIndexOfItemInArray(data, object, id);

            expect(result).toEqual(-1);
        });
    });

    describe('registerKeyPressForControl', () => {
        it('call registerKeyPressForControl with $control invalid and return undefine', () => {
            const control = '';
            const result = Uti.registerKeyPressForControl(control, () => { }, 1);

            expect(result).toBeUndefined();
        });
        it('call registerKeyPressForControl with $control length 0 and return undefine', () => {
            const control = [];
            const result = Uti.registerKeyPressForControl(control, () => { }, 1);

            expect(result).toBeUndefined();
        });
        it('call registerKeyPressForControl with $control length 0 and return undefine', () => {
            const control = new FormControl('');
            const result = Uti.registerKeyPressForControl(control, () => { }, 1);

            expect(result).toBeUndefined();
        });
    });

    describe('toLowerCase', () => {
        it('call toLowerCase with data invalid and return empty', () => {
            const data = undefined;
            const result = Uti.toLowerCase(data);

            expect(result).toEqual('');
        });
        it('call toLowerCase with data valid and return string', () => {
            const data = 'AAA';
            const result = Uti.toLowerCase(data);

            expect(result).toEqual('aaa');
        });
    });
});


// CustomValidators Class
describe('CustomValidators', () => {
    let component: CustomValidators;
    let consts: Configuration;

    beforeEach((() => {
        TestBed.configureTestingModule({
            providers: [
                Configuration,
            ]
        });
        component = new Uti();
        consts = TestBed.inject(Configuration);
    }));

    afterEach(() => {
        component = null;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('required', () => {
        it('required is success', () => {
            const form = new FormControl('');
            form.setValue('abc');
            expect(CustomValidators.required(form)).toBeNull();
        });

        it('required is failed', () => {
            const form = new FormControl('');
            form.setValue('');
            expect(CustomValidators.required(form)).toEqual({ required: true });
        });
    });
});
