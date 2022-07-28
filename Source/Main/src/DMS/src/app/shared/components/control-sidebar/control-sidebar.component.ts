import {
    Component,
    OnInit,
    OnDestroy,
    Output,
    EventEmitter,
    ElementRef,
    ChangeDetectorRef,
    HostListener,
    ChangeDetectionStrategy,
    ViewChild,
    AfterViewInit,
} from '@angular/core';
import {
    GlobalSettingService,
    PropertyPanelService,
    AppErrorHandler,
    CommonService,
    UserService,
    ModalService,
    AccessRightsService,
    ResourceTranslationService,
    UserProfileService,
    LoadingService,
} from '@app/services';
import {
    GlobalSettingModel,
    MainSettingModel,
    ColorSettingModel,
    LanguageSettingModel,
    WidgetPropertyModel,
    Module,
    ApiResultResponse,
    User,
    MessageModel,
} from '@app/models';
import { GlobalSettingConstant, AccessRightKeyEnum, Configuration } from '@app/app.constants';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import {
    WidgetTemplateActions,
    LayoutInfoActions,
    AdditionalInformationActions,
    ParkedItemActions,
    SearchResultActions,
    PropertyPanelActions,
    LayoutSettingActions,
    CustomAction,
} from '@app/state-management/store/actions';
import { PageSize, LocalSettingKey } from '@app/app.constants';
import * as uti from '@app/utilities';
import cloneDeep from 'lodash-es/cloneDeep';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { MessageModal } from '@app/app.constants';
import { SessionStorageProvider, LocalStorageHelper, LocalStorageProvider } from '@app/utilities';
import { ComboBox } from 'wijmo/wijmo.input';
import { DialogApplyWidgetSettingsComponent } from '@app/shared/components/dialog-apply-widget-settings';
import { filter, map, takeUntil } from 'rxjs/operators';
import { UserV2ActionNames, UserV2Actions } from '@app/pages/user-v2/user-v2.statemanagement/user-v2.actions';
import { UserV2Selectors } from '@app/pages/user-v2/user-v2.statemanagement/user-v2.selectors';

@Component({
    selector: 'app-aside',
    styleUrls: ['./control-sidebar.component.scss'],
    templateUrl: './control-sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlSidebarComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    @Output() onToggleWidgetTemplate = new EventEmitter<boolean>();
    private userMainSetting: GlobalSettingModel;
    private colorDefaultClassName = 'Light';
    private languageDefaultName = 'English';
    private currentMainSetting: MainSettingModel;
    public languages: LanguageSettingModel[] = [];
    public isWidgetTemplate = false;
    public isShowWidgetSetting = false;
    public isLayoutSetting: boolean = false;
    private properties: WidgetPropertyModel[] = [];
    private propertiesSettings: any;
    private propertiesSettingName = '';
    private orgGlobalProperties: any;
    public ofModuleLocal: Module;
    private selectedEntity: any;
    public activeModuleState: Observable<Module>;
    public activeSubModuleState: Observable<Module>;

    private activeModuleStateSubscription: Subscription;
    private requestSaveGlobalPropertiesStateSubscription: Subscription;
    private requestRollbackPropertiesState: Observable<any>;
    private requestRollbackPropertiesStateSubscription: Subscription;
    private globalSettingSerSubscription: Subscription;
    private selectedEntityState: Observable<any>;
    private selectedEntityStateSubscription: Subscription;
    private requestEditLayoutTogglePanelStateSubscription: Subscription;

    public showDialogApplyWidgetSettings = false;
    private requestSaveGlobalPropertiesState: Observable<any>;
    public currentUser: User;
    private isChangeLanguage: boolean;
    public enableLayoutCustomization: boolean = false;
    public htmlSkins: any[] = [];
    public isSkinComboboxFocused: boolean = false;
    public htmlLanguages: any[] = [];
    public isLanguageComboboxFocused: boolean = false;
    private colors: ColorSettingModel[] = [
        new ColorSettingModel({
            name: 'Dark',
            class1: 'skin-dark',
            class2: 'full-opacity-hover header-skin-shadow',
            class3: 'blue-header-left-theme',
            class4: 'blue-header-right-theme',
            class5: 'dark-body-left-theme',
            class6: 'dark-body-right-theme',
            class7: '',
            active: true,
        }),
        new ColorSettingModel({
            name: 'Light',
            class1: 'skin-light',
            class2: 'full-opacity-hover header-skin-shadow',
            class3: 'blue-header-left-theme',
            class4: 'blue-header-right-theme',
            class5: 'light-body-left-theme',
            class6: 'light-body-right-theme',
            class7: '',
            active: false,
        }),
    ];

    @HostListener('document:click.out-zone', ['$event'])
    onDocumentClick($event) {
        this.onClick($event);
    }

    @ViewChild('skinCombobox') skinCombobox: ComboBox;
    @ViewChild('languageCombobox') languageCombobox: ComboBox;

    private dialogApplyWidgetSettings: DialogApplyWidgetSettingsComponent;
    @ViewChild(DialogApplyWidgetSettingsComponent) set dialogApplyWidgetSettingsComponent(
        dialogApplyWidgetSettingsComponent: DialogApplyWidgetSettingsComponent,
    ) {
        this.dialogApplyWidgetSettings = dialogApplyWidgetSettingsComponent;
    }

    public accessRight: any = {};
    public tranlationStatus = false;
    public hasPermission = false;

    constructor(
        private _eref: ElementRef,
        private globalSettingSer: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
        private changeDetectorRef: ChangeDetectorRef,
        private store: Store<AppState>,
        private widgetTemplateActions: WidgetTemplateActions,
        private layoutInfoActions: LayoutInfoActions,
        private pageSize: PageSize,
        private additionalInformationActions: AdditionalInformationActions,
        private parkedItemActions: ParkedItemActions,
        private searchResultActions: SearchResultActions,
        private propertyPanelActions: PropertyPanelActions,
        private layoutSettingActions: LayoutSettingActions,
        private propertyPanelService: PropertyPanelService,
        private toasterService: ToasterService,
        private dispatcher: ReducerManagerDispatcher,
        private appErrorHandler: AppErrorHandler,
        private commonService: CommonService,
        private userServ: UserService,
        private modalService: ModalService,
        private accessRightsService: AccessRightsService,
        private resourceTranslationService: ResourceTranslationService,
        private userProfileService: UserProfileService,
        private loadingService: LoadingService,
        protected router: Router,
        private userManagementActions: UserV2Actions,
        protected userManagementSelectors: UserV2Selectors,
    ) {
        super(router);
        this.getCurrentUser();
        this.ofModuleLocal = this.ofModule;
        this.activeModuleState = store.select((state) => state.mainModule.activeModule);
        this.activeSubModuleState = store.select((state) => state.mainModule.activeSubModule);
        this.requestRollbackPropertiesState = this.store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, this.ofModule.moduleNameTrim)
                    .requestRollbackProperties,
        );
        this.requestSaveGlobalPropertiesState = this.store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).requestSaveGlobal,
        );
        this.selectedEntityState = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedEntity,
        );

        this.accessRight = {
            skin: this.accessRightsService.getAccessRightByKey(AccessRightKeyEnum.SettingMenu__Menu_Skin),
            globalSettings: this.accessRightsService.getAccessRightByKey(
                AccessRightKeyEnum.SettingMenu__Menu_GlobalSetting,
            ),
            widgetCustomization: this.accessRightsService.getAccessRightByKey(
                AccessRightKeyEnum.SettingMenu__Menu_WidgetCustomization,
            ),
            designPageLayout: this.accessRightsService.getAccessRightByKey(
                AccessRightKeyEnum.SettingMenu__Menu_DesignPageLayout,
            ),
            applyWidgetSettings: this.accessRightsService.getAccessRightByKey(
                AccessRightKeyEnum.SettingMenu__Menu_ApplyWidgetSetting,
            ),
        };
    }
    ngAfterViewInit(): void {}

    onRouteChanged() {
        this.buildModuleFromRoute();
        this.ofModuleLocal = this.ofModule;
    }

    ngOnInit(): void {
        this.userServ.currentUser.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((res) => {
            if (res?.id === null || res?.id === '') return;
            this.store.dispatch(this.userManagementActions.getUserByIdLoginAction({ UserIdLogin: res.id }));
        });

        this.getMainLanguages();
        this.activeModuleStateSubscription = this.activeModuleState.subscribe((activeModuleState: Module) => {
            this.appErrorHandler.executeAction(() => {
                if (activeModuleState && activeModuleState.idSettingsGUI) {
                    this.isShowWidgetSetting = true;
                } else {
                    this.isShowWidgetSetting = false;
                }

                this.changeDetectorRef.markForCheck();

                setTimeout(() => {
                    this.resourceTranslationService.updateStatus(this.tranlationStatus);
                });
            });
        });

        this.requestSaveGlobalPropertiesStateSubscription = this.requestSaveGlobalPropertiesState.subscribe(
            (requestSaveGlobalPropertiesState: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (requestSaveGlobalPropertiesState && requestSaveGlobalPropertiesState.globalProperties) {
                        requestSaveGlobalPropertiesState.globalProperties = this.propertyPanelService.resetDirty(
                            requestSaveGlobalPropertiesState.globalProperties,
                        );
                        this.reloadAndSavePropertiesConfig(requestSaveGlobalPropertiesState.globalProperties);
                    }
                });
            },
        );

        this.buildPropertiesSettingName();
        this.requestRollbackPropertiesStateSubscription = this.requestRollbackPropertiesState.subscribe(
            (requestRollbackPropertiesState: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (
                        requestRollbackPropertiesState &&
                        requestRollbackPropertiesState.data &&
                        requestRollbackPropertiesState.isGlobal
                    ) {
                        this.properties = cloneDeep(this.orgGlobalProperties);
                        this.propertyPanelService.globalProperties = this.properties;
                        this.store.dispatch(
                            this.propertyPanelActions.requestUpdateGlobalProperty(
                                this.orgGlobalProperties,
                                ModuleList.Base,
                            ),
                        );
                    }
                });
            },
        );

        this.requestEditLayoutTogglePanelStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === LayoutSettingActions.REQUEST_TOGGLE_PANEL &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
            )
            .subscribe((isShow: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.isLayoutSetting = isShow;
                    this.changeDetectorRef.markForCheck();
                });
            });

        this.requestEditLayoutTogglePanelStateSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === WidgetTemplateActions.TOGGLE_WIDGET_TEMPLATE_SETTING_PANEL &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
                map((action: CustomAction) => {
                    return action.payload;
                }),
            )
            .subscribe((isShow: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.onWidgetTemplateToggle(isShow, true);
                });
            });

        this.selectedEntityStateSubscription = this.selectedEntityState.subscribe((selectedEntityState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.selectedEntity = selectedEntityState;
            });
        });

        this.resourceTranslationService.translationStatus$
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((status) => {
                this.tranlationStatus = status;
            });

        this.enableLayoutCustomization = Configuration.PublicSettings.enableLayoutCustomization;

        this.buildSkins();
        setTimeout(() => {
            this.loadSkinFromSetting();
            this.getGlobalPropertiesFromSetting();
        }, 500);
        this.userManagementSelectors
            .actionSuccessOfSubtype$(UserV2ActionNames.USER_GET_BY_IDLOGIN)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    const res = action.payload?.item;
                    if (!res?.length) {
                        this.hasPermission = false;
                        this.changeDetectorRef.detectChanges();
                        return;
                    }
                    const permissionsString = res[0]?.[0]?.UserPermission;
                    if (!permissionsString) {
                        this.hasPermission = false;
                        this.changeDetectorRef.detectChanges();
                        return;
                    }
                    const permissions = JSON.parse(permissionsString);
                    const isSetting = permissions.find(
                        (x) => x.PermissionName === 'Setting' || x.PermissionType === 'Setting',
                    )?.IsSelected;
                    this.hasPermission = isSetting == 1;
                    this.changeDetectorRef.detectChanges();
                },
                (error) => {
                    this.hasPermission = false;
                    this.changeDetectorRef.detectChanges();
                },
            );
    }

    ngOnDestroy() {
        uti.Uti.unsubscribe(this);
        super.onDestroy();
    }

    /**
     * getCurrentUser
     */
    private getCurrentUser() {
        this.userServ.currentUser.subscribe((user: User) => {
            this.appErrorHandler.executeAction(() => {
                this.currentUser = user;
            });
        });
    }

    /**
     * getMainLanguages
     */
    private getMainLanguages() {
        this.commonService.getMainLanguages().subscribe(
            (data) => this.loadLanguagesSuccess(data),
            (error) => this.loadLanguagesError(error),
        );
    }

    private buildSkins() {
        this.htmlSkins = [];
        for (let i = 0; i < this.colors.length; i++) {
            let theme =
                `<div data-name="` +
                this.colors[i].name +
                `" data-class1="` +
                this.colors[i].class1 +
                `" style="display:flex; flex-direction: row; align-items: center">
                             <a tabindex="-1"                               
                               style="width:60px;cursor:pointer"
                               class="` +
                this.colors[i].class2 +
                `">
                                <div>
                                    <span class="` +
                this.colors[i].class3 +
                `"></span>
                                    <span class="` +
                this.colors[i].class4 +
                `"></span>
                                </div>
                                <div>
                                    <span class="` +
                this.colors[i].class5 +
                `"></span>
                                    <span class="` +
                this.colors[i].class6 +
                `"></span>
                                </div>
                            </a>
                            <span style="margin-left:5px;">` +
                this.colors[i].name +
                `</span>
                        </div>
                        `;
            this.htmlSkins.push({
                idValue: i,
                textValue: theme,
                data: this.colors[i],
            });
        }
    }

    private buildLanguagesCombobox() {
        this.htmlLanguages = [];
        for (let i = 0; i < this.languages.length; i++) {
            let language =
                `<div data-name="` +
                this.languages[i].name +
                `"
                              data-flag="` +
                this.languages[i].flag +
                `"
                              data-idRepLanguage="` +
                this.languages[i].idRepLanguage +
                `"
                              style="display:flex; flex-direction: row; align-items: center">
                             <a tabindex="-1"                               
                               style="cursor:pointer">
                                <span class="flag flag-` +
                this.languages[i].flag +
                `"></span>
                            </a>
                            <span style="margin-left:5px;">` +
                this.languages[i].name +
                `</span>
                        </div>
                        `;
            this.htmlLanguages.push({
                idValue: i,
                textValue: language,
                data: this.languages[i],
            });
        }
    }

    /**
     * loadLanguagesSuccess
     * @param data
     */
    private loadLanguagesSuccess(response: ApiResultResponse) {
        this.languages = [];
        if (response && response.item && response.item.data && response.item.data.length) {
            let languages: Array<any> = response.item.data[1];
            if (languages && languages.length) {
                let currentUserLanguage: string = this.userServ.getLanguage();
                let isModeLanguage = LocalStorageHelper.toInstance(SessionStorageProvider).getItem(
                    LocalSettingKey.SET_LANGUAGE_MODE,
                );
                if (isModeLanguage && isModeLanguage.isMain) {
                    currentUserLanguage = this.currentUser.preferredLang;
                }
                languages.forEach((language) => {
                    let userLanguage = new LanguageSettingModel({
                        flag: (language.LanguageCode as string).toLowerCase(),
                        name: language.DefaultValue,
                        active: language.IdRepLanguage == currentUserLanguage,
                        idRepLanguage: language.IdRepLanguage,
                        translateModuleType: '5',
                    });
                    this.languages.push(userLanguage);
                    if (userLanguage.active) {
                        LocalStorageHelper.toInstance(SessionStorageProvider).setItem(
                            LocalSettingKey.LANGUAGE,
                            userLanguage,
                        );
                    }
                });

                this.buildLanguagesCombobox();
                if (this.languageCombobox) {
                    setTimeout(() => {
                        const selectedLanguage = this.htmlLanguages.find(
                            (language) => language.data.idRepLanguage == currentUserLanguage,
                        );
                        if (selectedLanguage) {
                            this.languageCombobox.selectedItem = selectedLanguage;
                            this.changeDetectorRef.detectChanges();
                        }
                    }, 200);
                }
                this.changeDetectorRef.markForCheck();
            }
        }
    }

    /**
     * loadLanguagesError
     * @param error
     */
    private loadLanguagesError(error) {
        this.languages = [];
    }

    public onWidgetTemplateToggle(isExpanded: boolean, noDispatch?: boolean) {
        setTimeout(() => {
            this.isWidgetTemplate = isExpanded;
            this.onToggleWidgetTemplate.emit(this.isWidgetTemplate);
            if (!noDispatch) {
                this.store.dispatch(
                    this.layoutInfoActions.setRightMenuWidth(
                        this.isWidgetTemplate ? this.pageSize.ParkedItemShowSize.toString() : '0',
                        this.ofModule,
                    ),
                );
            }
            if (isExpanded) {
                this.openWidgetTemplateSetting();
            }
        });
    }

    private buildPropertiesSettingName() {
        this.propertiesSettingName = this.globalSettingConstant.globalWidgetProperties;
    }

    private loadSkinFromSetting() {
        this.globalSettingSerSubscription = this.globalSettingSer.getAllGlobalSettings().subscribe(
            (data) => this.loadSkinFromSettingSuccess(data),
            (error) => this.loadSkinFromSettingError(error),
        );
    }

    private loadSkinFromSettingSuccess(data: GlobalSettingModel[]) {
        if (!data || data.length <= 0) {
            return;
        }
        this.userMainSetting = data.find((x) => x.globalName === this.globalSettingConstant.settingUserMain);
        if (!this.userMainSetting || !this.userMainSetting.idSettingsGlobal) {
            this.setDefaultUserSetting(data);
            return;
        }
        const serverMainSetting = JSON.parse(this.userMainSetting.jsonSettings) as MainSettingModel;
        if (!serverMainSetting) {
            return;
        }
        this.setActiveForColorFromServer(serverMainSetting.color);
    }

    private loadSkinFromSettingError(error) {
        console.log(error);
    }

    private setActiveForColorFromServer(colorName: string) {
        this.setActiveForColor(colorName);
        const currentColor = this.colors.find((x) => x.active);
        if (!currentColor) {
            this.overrideSkinClass('skin-light');
            return;
        }
        this.overrideSkinClass(currentColor.class1);
    }

    private getGlobalPropertiesFromSetting() {
        this.globalSettingSerSubscription = this.globalSettingSer.getAllGlobalSettings().subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                this.properties = this.buildPropertiesFromGlobalSetting(data);
                this.orgGlobalProperties = cloneDeep(this.properties);
                this.propertyPanelService.globalProperties = this.orgGlobalProperties;
                this.store.dispatch(
                    this.propertyPanelActions.requestUpdateGlobalProperty(this.properties, ModuleList.Base),
                );
            });
        });
    }

    private buildPropertiesFromGlobalSetting(data: GlobalSettingModel[]): any[] {
        if (!data) return this.propertyPanelService.createDefaultGlobalSettings();

        this.propertiesSettings = data.find((x) => x.globalName === this.propertiesSettingName);
        if (!this.propertiesSettings || !this.propertiesSettings.idSettingsGlobal)
            return this.propertyPanelService.createDefaultGlobalSettings();

        const properties = JSON.parse(this.propertiesSettings.jsonSettings) as GlobalSettingModel[];
        if (!properties || !properties.length) return this.propertyPanelService.createDefaultGlobalSettings();

        const propAppearance: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            properties,
            'Appearance',
        );
        if (!propAppearance) {
            const appearance = this.propertyPanelService.createDefaultGlobalWidgetAppearanceProperties();
            properties.push(appearance);
        }

        const propApplicationSetting: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            properties,
            'ApplicationSettings',
        );
        if (!propApplicationSetting) {
            const applicationSetting = this.propertyPanelService.createDefaultGlobalApplicationSettingProperties();
            properties.push(applicationSetting);
        }

        const propIconSize: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            properties,
            'WidgetToolbarIconSize',
        );
        if (!propIconSize) {
            const widgetToolbarIconSize = this.propertyPanelService.createDefaultWidgetToolbarIconSizeProperty();
            const propWidgetToolbar = this.propertyPanelService.getItemRecursive(properties, 'WidgetToolbar');
            if (propWidgetToolbar && propWidgetToolbar.children) {
                propWidgetToolbar.children.push(widgetToolbarIconSize);
            }
        }

        const propShowScrollBar: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            properties,
            'ShowScrollBar',
        );
        if (!propShowScrollBar) {
            const showScrollBarDefault = this.propertyPanelService.createDefaultShowScrollBarProperty();
            const propWidgetStyle = this.propertyPanelService.getItemRecursive(properties, 'WidgetStyle');
            if (propWidgetStyle && propWidgetStyle.children) {
                propWidgetStyle.children.push(showScrollBarDefault);
            }
        }

        const propDisplayShadow: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            properties,
            'DisplayShadow',
        );
        if (!propDisplayShadow) {
            const propDisplayShadowDefault = this.propertyPanelService.createDefaultDisplayShadow();
            const propWidgetStyle = this.propertyPanelService.getItemRecursive(properties, 'WidgetStyle');
            if (propWidgetStyle && propWidgetStyle.children) {
                propWidgetStyle.children.push(propDisplayShadowDefault);
            }
        }

        const propSearchWithStar: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            properties,
            'SearchWithStar',
        );
        if (!propSearchWithStar) {
            const propSearchWithStarDefault = this.propertyPanelService.createDefaultSearchWithStarGlobalProperty();
            const propWidgetStyle = this.propertyPanelService.getItemRecursive(properties, 'ApplicationSettings');
            if (propWidgetStyle && propWidgetStyle.children) {
                propWidgetStyle.children.push(propSearchWithStarDefault);
            }
        }

        const propManualArticle: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            properties,
            'ManualArticle',
        );
        if (!propManualArticle) {
            const propManualArticleDefault = this.propertyPanelService.createDefaultManualArticleProperty();
            const propWidgetStyle = this.propertyPanelService.getItemRecursive(properties, 'ApplicationSettings');
            if (propWidgetStyle && propWidgetStyle.children) {
                propWidgetStyle.children.push(propManualArticleDefault);
            }
        }

        const propAutoCollapse: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
            properties,
            'AutoCollapse',
        );
        if (!propAutoCollapse) {
            const propAutoCollapseDefault = this.propertyPanelService.createDefaultAutoCollapseProperty();
            const propWidgetStyle = this.propertyPanelService.getItemRecursive(properties, 'ApplicationSettings');
            if (propWidgetStyle && propWidgetStyle.children) {
                propWidgetStyle.children.push(propAutoCollapseDefault);
            }
        }

        return properties;
    }

    private setActiveForColor(colorName: string) {
        colorName = colorName || this.colorDefaultClassName;
        for (const color of this.colors) {
            color.active = color.name === colorName;
        }

        if (this.skinCombobox) {
            setTimeout(() => {
                this.skinCombobox.selectedItem = this.htmlSkins.find((skin) => skin.data.name === colorName);
            }, 200);
        }

        this.changeDetectorRef.markForCheck();
    }

    private setActiveForLanguageFromServer(languageName: string) {
        languageName = languageName || this.languageDefaultName;
        for (const language of this.languages) {
            language.active = language.name === languageName;
        }
        this.changeDetectorRef.markForCheck();
    }

    private saveSkinToSetting() {
        this.globalSettingSerSubscription = this.globalSettingSer.getAllGlobalSettings().subscribe(
            (data) => this.saveNearExpireMessageSuccess(data),
            (error) => this.loadSkinFromSettingError(error),
        );
    }

    private saveNearExpireMessageSuccess(globalSettingModels: GlobalSettingModel[]) {
        this.userMainSetting = globalSettingModels.find(
            (x) => x.globalName === this.globalSettingConstant.settingUserMain,
        );
        if (!this.userMainSetting || !this.userMainSetting.idSettingsGlobal || !this.userMainSetting.globalName) {
            this.userMainSetting = new GlobalSettingModel({
                globalName: this.globalSettingConstant.settingUserMain,
                description: 'Skin setting each of User',
                isActive: true,
            });
        }
        this.userMainSetting.idSettingsGUI = -1;
        this.userMainSetting.jsonSettings = JSON.stringify(this.currentMainSetting);
        this.userMainSetting.isActive = true;

        this.globalSettingSerSubscription = this.globalSettingSer.saveGlobalSetting(this.userMainSetting).subscribe(
            (data) => this.saveGlobalSettingSuccess(data),
            (error) => this.loadSkinFromSettingError(error),
        );
    }

    private saveGlobalSettingSuccess(data: any) {
        this.globalSettingSer.saveUpdateCache('-1', this.userMainSetting, data);
        // Relogin to get the latest user info
        if (this.isChangeLanguage) {
            this.isChangeLanguage = false;
            location.reload();
        }
    }

    onClick(event) {
        // Click outside
        if (
            !this._eref.nativeElement.contains(event.target) &&
            !event.target.classList.contains('toggle-sidebar-right')
        ) {
            if (this._eref.nativeElement.children[0].classList.contains('control-sidebar-open')) {
                this.collapseSideBar();

                this.store.dispatch(this.layoutInfoActions.setRightMenuWidth('0', this.ofModule));
            }
        }
        if (event.target.classList.contains('toggle-sidebar-right')) {
            this.isWidgetTemplate = false;

            if (this._eref.nativeElement.children[0].classList.contains('control-sidebar-open')) {
                this.store.dispatch(
                    this.layoutInfoActions.setRightMenuWidth(
                        this.pageSize.ParkedItemShowSize.toString(),
                        this.ofModule,
                    ),
                );
            } else {
                this.store.dispatch(this.layoutInfoActions.setRightMenuWidth('0', this.ofModule));
            }
        }

        this.changeDetectorRef.markForCheck();
    }

    collapseSideBar() {
        this._eref.nativeElement.children[0].classList.remove('control-sidebar-open');
    }

    expandSideBar() {
        this._eref.nativeElement.children[0].classList.add('control-sidebar-open');
        this.isWidgetTemplate = false;

        this.changeDetectorRef.markForCheck();
    }

    public changeSkin(selectedItem) {
        if (!this.isSkinComboboxFocused) {
            return;
        }

        this.setActiveForColor(selectedItem.data.name);
        this.overrideSkinClass(selectedItem.data.class1);
        this.currentMainSetting = this.currentMainSetting || JSON.parse(this.userMainSetting.jsonSettings);
        this.currentMainSetting.color = selectedItem.data.name;
        this.currentMainSetting.language = this.languages.find((l) => l.active === true).name;
        this.saveSkinToSetting();
    }

    private overrideSkinClass(colorClass: string) {
        const classList = document.getElementsByTagName('body')[0].className.split(/\s+/);
        for (let i = 0; i < classList.length; i++) {
            if (classList[i].startsWith('skin-')) {
                $('body').removeClass(classList[i]);
            }
        }
        if (!colorClass) {
            colorClass = 'skin-light';
        }
        $('body').addClass('sidebar-mini');
        $('body').addClass(colorClass);
    }

    /**
     * changeLanguage
     * @param language
     */
    public changeLanguage(selectedLanguage) {
        if (!this.isLanguageComboboxFocused) {
            return;
        }

        this.modalService.confirmMessageHtmlContent(
            new MessageModel({
                headerText: 'Change Language ',
                messageType: MessageModal.MessageType.error,
                message: [{ key: '<p>' }, { key: 'Modal_Message___ChangeLanguageWillReload' }, { key: '<p>' }],
                buttonType1: MessageModal.ButtonType.danger,
                callBack1: () => {
                    this.isChangeLanguage = true;
                    LocalStorageHelper.toInstance(SessionStorageProvider).setItem(LocalSettingKey.SET_LANGUAGE_MODE, {
                        isMain: false,
                    });
                    LocalStorageHelper.toInstance(SessionStorageProvider).setItem(
                        LocalSettingKey.LANGUAGE,
                        selectedLanguage.data,
                    );

                    this.setActiveForLanguageFromServer(selectedLanguage.data.name);
                    this.currentMainSetting = this.currentMainSetting || new MainSettingModel();
                    this.currentMainSetting.language = selectedLanguage.data.name;
                    this.currentMainSetting.color = this.colors.find((c) => c.active === true).name;
                    this.saveSkinToSetting();
                },
                callBack2: () => {},
                callBackCloseButton: () => {},
            }),
        );
    }

    public openWidgetTemplateSetting() {
        this.collapseSideBar();
        this.isWidgetTemplate = true;

        this.store.dispatch(this.widgetTemplateActions.updateEditModeStatus(true, this.ofModule));
        //this.store.dispatch(this.layoutInfoActions.setRightMenuWidth('50', this.ofModule));
        this.store.dispatch(this.additionalInformationActions.requestTogglePanel(false, this.ofModule));
        this.store.dispatch(this.parkedItemActions.requestTogglePanel(false, this.ofModule));
        this.store.dispatch(this.searchResultActions.requestTogglePanel(false));
        this.store.dispatch(this.propertyPanelActions.requestClearProperties(this.ofModule));
        this.onToggleWidgetTemplate.emit(this.isWidgetTemplate);

        setTimeout(() => {
            $('.content-wrapper .content').css('width', 'calc(100vw - 50px)');
            $('.additional-information-collapse').addClass('design-widget');
        });

        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
    }

    public openGlobalWidgetSetting() {
        const parentData = {
            title: 'Global Widget Setting',
        };

        this.collapseSideBar();
        this.store.dispatch(this.additionalInformationActions.requestTogglePanel(false, this.ofModule));
        this.store.dispatch(
            this.propertyPanelActions.togglePanel(this.ofModule, true, parentData, this.properties, true),
        );
        this.store.dispatch(this.layoutInfoActions.setRightMenuWidth('0', this.ofModule));
    }

    private reloadAndSavePropertiesConfig(globalProperties) {
        this.globalSettingSerSubscription = this.globalSettingSer.getAllGlobalSettings().subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                this.savePropertiesConfig(data, globalProperties);
            });
        });
    }
    private savePropertiesConfig(data: GlobalSettingModel[], globalProperties: WidgetPropertyModel[]) {
        this.propertiesSettings = data.find((x) => x.globalName === this.propertiesSettingName);
        if (
            !this.propertiesSettings ||
            !this.propertiesSettings.idSettingsGlobal ||
            !this.propertiesSettings.globalName
        ) {
            this.propertiesSettings = new GlobalSettingModel({
                globalName: this.propertiesSettingName,
                description: 'Global Widget Properties',
                globalType: this.globalSettingConstant.globalWidgetProperties,
            });
        }
        this.propertiesSettings.idSettingsGUI = ModuleList.Base.idSettingsGUI;
        globalProperties = this.propertyPanelService.resetDirty(globalProperties);
        this.propertiesSettings.jsonSettings = JSON.stringify(globalProperties);
        this.propertiesSettings.isActive = true;

        this.globalSettingSerSubscription = this.globalSettingSer.saveGlobalSetting(this.propertiesSettings).subscribe(
            (_data) => this.savePropertiesConfigSuccess(_data),
            (error) => this.savePropertiesConfigError(error),
        );
    }

    private savePropertiesConfigSuccess(data: any) {
        this.toasterService.pop('success', 'Success', 'Global Settings saved successfully');
        this.store.dispatch(this.propertyPanelActions.togglePanel(this.ofModule, false));
        this.globalSettingSer.saveUpdateCache('-1', this.propertiesSettings, data);
    }

    private savePropertiesConfigError(error) {
        console.log(error);
    }

    public itemsTrackBy(index, item) {
        return item ? item.name : undefined;
    }

    public editLayoutSetting($event) {
        this.collapseSideBar();
        this.isLayoutSetting = true;

        this.store.dispatch(this.additionalInformationActions.requestTogglePanel(false, this.ofModule));
        this.store.dispatch(this.parkedItemActions.requestTogglePanel(false, this.ofModule));
        this.store.dispatch(this.searchResultActions.requestTogglePanel(false));
        this.store.dispatch(this.propertyPanelActions.requestClearProperties(this.ofModule));

        this.store.dispatch(this.layoutSettingActions.updateEditModeStatus(true, this.ofModule));

        this.changeDetectorRef.markForCheck();
    }

    public showWidgetLayoutSettings() {
        if (!this.ofModuleLocal) {
            return false;
        }

        switch (this.ofModuleLocal.idSettingsGUI) {
            case ModuleList.Processing.idSettingsGUI:
            case ModuleList.Contact.idSettingsGUI:
            case ModuleList.Invoice.idSettingsGUI:
            case ModuleList.Campaign.idSettingsGUI:
            case ModuleList.BusinessCosts.idSettingsGUI:
            case ModuleList.Briefe.idSettingsGUI:
            case ModuleList.Scan.idSettingsGUI:
            case ModuleList.Company.idSettingsGUI:
            case ModuleList.PreissChild.idSettingsGUI:
                //if (this.selectedEntity) {
                return true;
            //}
            //break;

            case ModuleList.Base.idSettingsGUI:
            case ModuleList.Tools.idSettingsGUI:
            case ModuleList.Selection.idSettingsGUI:
                return false;

            default:
                return true;
        }

        //return false;
    }

    public applyWidgetSettings() {
        this.showDialogApplyWidgetSettings = true;
        setTimeout(() => {
            if (this.dialogApplyWidgetSettings) {
                this.dialogApplyWidgetSettings.open();
            }
            this.changeDetectorRef.markForCheck();
        }, 50);
    }

    public onCloseDialogApplyWidgetSettings() {
        this.showDialogApplyWidgetSettings = false;
    }

    public toggleSystemTranslate() {
        // this.tranlationStatus = !this.tranlationStatus;
        this.resourceTranslationService.updateStatus(this.tranlationStatus);
    }

    public clickToggle() {
        this.tranlationStatus = !this.tranlationStatus;
        this.toggleSystemTranslate();
    }

    private setDefaultUserSetting(data: GlobalSettingModel[]) {
        this.userMainSetting = new GlobalSettingModel({
            globalName: this.globalSettingConstant.settingUserMain,
            description: 'Skin setting each of User',
            isActive: true,
            jsonSettings: JSON.stringify({
                color: this.colorDefaultClassName,
                language: this.languageDefaultName,
            }),
        });
        this.currentMainSetting = new MainSettingModel();
        this.currentMainSetting.color = this.colorDefaultClassName;
        this.currentMainSetting.language = this.languageDefaultName;

        this.setActiveForColorFromServer(this.colorDefaultClassName);
        this.setActiveForLanguageFromServer(this.languageDefaultName);

        data.push(this.userMainSetting);
        this.saveNearExpireMessageSuccess(data);
    }

    public resetDefaultWidget() {
        this.modalService.confirmMessageHtmlContent(
            new MessageModel({
                headerText: 'Reset default widget',
                messageType: MessageModal.MessageType.confirm,
                message: [{ key: '<p>' }, { key: 'Modal_Message___ResetYourWidgetSetting' }, { key: '<p>' }],
                buttonType1: MessageModal.ButtonType.danger,
                callBack1: () => {
                    this.loadingService.showLoading();
                    this.userProfileService
                        .saveUserWidgetLayout(this.currentUser.id, '-1', '1')
                        .finally(() => {
                            this.loadingService.hideLoading();
                            this.changeDetectorRef.markForCheck();
                        })
                        .subscribe(
                            (data: any) => {
                                console.log(data);
                                if (data && data.item && data.item.returnID) {
                                    this.toasterService.pop('success', 'Success', 'Apply widget settings successfully');
                                    location.reload();
                                } else {
                                    this.toasterService.pop(
                                        'error',
                                        'Failed',
                                        'Apply widget settings is not successful',
                                    );
                                }
                            },
                            (error) => {
                                console.log('error', error);
                                this.toasterService.pop('error', 'Failed', 'Apply widget settings is not successful');
                            },
                        );
                },
                callBack2: () => {},
                callBackCloseButton: () => {},
            }),
        );
    }
}
