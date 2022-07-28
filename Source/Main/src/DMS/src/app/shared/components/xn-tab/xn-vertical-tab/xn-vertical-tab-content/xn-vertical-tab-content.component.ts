import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    ChangeDetectorRef,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TabService, AppErrorHandler, PropertyPanelService } from '@app/services';
import { Configuration, DocumentFormNameEnum, DocumentGroupFieldEnum, MessageModal } from '@app/app.constants';
import { TabSummaryModel, TabSummaryInfoModel, BadgeTabEnum, TabFieldSummaryModel } from '@app/models';
import { SubLayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import {
    TabSummaryActions,
    ModuleSettingActions,
    WidgetDetailActions,
    CustomAction,
    LayoutInfoActions,
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
} from '@app/state-management/store/actions';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as layoutInfoReducer from '@app/state-management/store/reducer/layout-info';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Uti } from '@app/utilities';
import { Subject } from 'rxjs';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { TabWidgetContactColleague } from '@app/state-management/store/models/administration-document/captured-form-colleague.payload';
import { ExtractedDataOcrState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { OcrDataVisitor } from '@app/state-management/store/models/administration-document/ocr-data-visitor-pattern/ocr-data-visitor.payload';
import { IElement } from '@app/models/common/ielement.model';
import { CapturedFormElement } from '@app/state-management/store/models/administration-document/ocr-data-visitor-pattern/captured-form-element.payload';
import { cloneDeep } from 'lodash-es';
import { ToasterService } from 'angular2-toaster';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'xn-vertical-tab-content',
    styleUrls: ['./xn-vertical-tab-content.component.scss'],
    templateUrl: './xn-vertical-tab-content.component.html',
})
export class XnVerticalTabContentComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
    public gradientBackgroundStatus: boolean;
    public mainTabContent: any = {};
    public otherTabsContent: Array<any> = [];
    public tabContentStyle: Object = {};
    private selectedTabHeader: TabSummaryModel;
    private layoutInfo: SubLayoutInfoState;
    private isShowPersonalContact = false;
    private _tabContactColleague: TabWidgetContactColleague;
    private _capturedFormMode: CapturedFormModeEnum;
    private _extractedDataOcr: ExtractedDataOcrState[];
    private _ocrDataVisitor: OcrDataVisitor;
    private _tabFormElements: IElement[];

    private layoutInfoModelSubscription: Subscription;
    private selectedTabHeaderModelSubscription: Subscription;
    private globalPropertiesStateSubscription: Subscription;
    private initializedWidgetContainerSubscription: Subscription;

    private layoutInfoModel: Observable<SubLayoutInfoState>;
    private selectedTabHeaderModel: Observable<TabSummaryModel>;
    private globalPropertiesState: Observable<any>;
    public globalProperties: any;
    public activeBtnOcr: boolean;
    public BADGE_TAB_ENUM = BadgeTabEnum;

    @Input() setting: any;
    @Input() hasSplitter: boolean;
    @Input() newTabConfig: any = {};
    @Input() tabSummaryModels: TabSummaryModel[];

    @Output() onMainFormChanged: EventEmitter<any> = new EventEmitter();
    @Output() onOtherFormChanged: EventEmitter<any> = new EventEmitter();

    @ViewChild('btnOcr') btnOcr: ElementRef;

    constructor(
        private tabService: TabService,
        private store: Store<AppState>,
        private tabSummaryActions: TabSummaryActions,
        private layoutInfoActions: LayoutInfoActions,
        private configuration: Configuration,
        private moduleSettingActions: ModuleSettingActions,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelService: PropertyPanelService,
        private toasterService: ToasterService,
        protected router: Router,
        private dispatcher: ReducerManagerDispatcher,
        protected ref: ChangeDetectorRef,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
    ) {
        super(router);

        this.layoutInfoModel = store.select((state) =>
            layoutInfoReducer.getLayoutInfoState(state, this.ofModule.moduleNameTrim),
        );
        // this.selectedTabHeaderModel = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedTab);
        this.globalPropertiesState = store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties,
        );

        this._tabContactColleague = new TabWidgetContactColleague();
        this._tabContactColleague.notify = (toggle: boolean) => {
            this.togglePersonIcon(toggle);
        };
        this.store.dispatch(
            this.administrationActions.registerLinkConnectionContactFormColleague(this._tabContactColleague),
        );

        this._tabFormElements = [];
        this._ocrDataVisitor = new OcrDataVisitor(this._extractedDataOcr);
        this.store.dispatch(this.administrationActions.registerOcrDataVisitor(this._ocrDataVisitor));
    }

    ngOnInit() {
        this.subscribe();
    }

    ngOnDestroy() {
        super.onDestroy();
        Uti.unsubscribe(this);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!changes['setting'] && !changes['tabSummaryModels']) {
            return;
        }
        const hasChanges = this.hasChanges(changes['setting']) || this.hasChanges(changes['tabSummaryModels']);
        if (hasChanges) {
            let setting = this.setting;
            if (setting && !$.isEmptyObject(setting)) {
                this.mainTabContent = this.tabService.getMainTabContent(
                    setting.Content.CustomTabs,
                    this.tabSummaryModels,
                );
                if (this.mainTabContent.accessRight && this.mainTabContent.accessRight.read) {
                    this.mainTabContent.active = true;
                    this.mainTabContent.loaded = true;
                    this.store.dispatch(
                        this.moduleSettingActions.selectToolbarSetting(this.mainTabContent.Toolbar, this.ofModule),
                    );
                }

                this.otherTabsContent = this.tabService.getOtherTabsContent(
                    setting.Content.CustomTabs,
                    this.tabSummaryModels,
                );
                this.otherTabsContent = this.tabService.appendProp(this.otherTabsContent, 'active', false);

                if (this.tabSummaryModels && this.tabSummaryModels.length) {
                    this.tabSummaryModels.forEach((tab) => {
                        this.handleOnTabFieldChange(tab);
                    });
                }

                // if (this.selectedTabHeader) {
                //     this.processToSelectTab();
                // }
                if (!this.otherTabsContent || !this.otherTabsContent.length) return;

                for (let i = 0; i < this.tabSummaryModels.length; i++) {
                    const tabHeader = this.tabSummaryModels[i];
                    this.processToSelectTab(tabHeader);
                }
                this.tabService.unSelectTabs(this.otherTabsContent);
                this.tabService.unSelectCurentActiveTab(this.tabSummaryModels);
                this.otherTabsContent[0].active = true;
                this.tabSummaryModels[0].active = true;
                this.selectedTabHeader = this.tabSummaryModels[0];
                this.ref.detectChanges();
            }
        }
    }

    private subscribe() {
        this.subscribeLayoutInfoModel();
        // this.subscribeSelectedTabHeaderModel();
        this.subscribeGlobalProperties();
        this.subscribeInitializedWidgetContainerState();

        this.administrationSelectors.capturedFormMode$
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((capturedFormMode) => {
                this._capturedFormMode = capturedFormMode;
            });

        this.administrationSelectors.extractedDataFromOcr$
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((extractedDataFromOcrState: ExtractedDataOcrState[]) => {
                if (
                    !extractedDataFromOcrState ||
                    !extractedDataFromOcrState.length ||
                    this._capturedFormMode === CapturedFormModeEnum.Updated ||
                    this.areAllOcrDataEmpty(extractedDataFromOcrState)
                ) {
                    this.enableButtonOcr(false);
                    this._extractedDataOcr = null;
                } else {
                    this.enableButtonOcr(true);
                    this._extractedDataOcr = extractedDataFromOcrState;
                }
                this._ocrDataVisitor.ocrData = this._extractedDataOcr;
            });

        this.administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.REGISTER_TAB_FORM_ELEMENT)
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((action: CustomAction) => {
                const payload = action.payload as IElement;
                this._tabFormElements.push(payload);
            });
    }

    private handleOnTabFieldChange(tab: TabSummaryModel) {
        tab.badgeColor = BadgeTabEnum.None;
        tab.badgeColorChanged = new Subject<BadgeTabEnum>();
        tab.badgeColorChanged
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            ).subscribe((badgeColor) => {
                tab.badgeColor = badgeColor;
            });
    }

    private hasChanges(changes) {
        return changes && changes.hasOwnProperty('currentValue') && changes.hasOwnProperty('previousValue');
    }

    private subscribeLayoutInfoModel() {
        this.layoutInfoModelSubscription = this.layoutInfoModel.subscribe((layoutInfo: SubLayoutInfoState) => {
            this.appErrorHandler.executeAction(() => {
                this.layoutInfo = layoutInfo;
                this.tabContentStyle = {
                    // 0001141: Fix small widget issue after opening GS first
                    // 'height': `calc(100vh - ${layoutInfo.globalSearchHeight}px - ${layoutInfo.headerHeight}px - ${layoutInfo.tabHeaderHeight}px - ${layoutInfo.smallHeaderLineHeight}px - ${layoutInfo.dashboardPaddingTop}px)`
                    //'height': `calc(100vh - ${layoutInfo.headerHeight}px -
                    //                        ${this.ofModule.idSettingsGUI == 43 ? this.layoutInfo.tabHeaderBigSizeHeight : this.layoutInfo.tabHeaderHeight}px -
                    //                        ${layoutInfo.smallHeaderLineHeight}px - ${layoutInfo.dashboardPaddingTop}px)`
                    // 'height': `calc(100vh - ${layoutInfo.headerHeight}px -
                    //                         ${layoutInfo.smallHeaderLineHeight}px )`,
                    //'width': `calc(100% - ${layoutInfo.rightMenuWidth}px)`
                };
            });
        });
    }

    private subscribeSelectedTabHeaderModel() {
        this.selectedTabHeaderModelSubscription = this.selectedTabHeaderModel.subscribe(
            (selectedTabHeader: TabSummaryModel) => {
                this.appErrorHandler.executeAction(() => {
                    this.selectedTabHeader = selectedTabHeader;

                    if (this.selectedTabHeader && this.mainTabContent && this.otherTabsContent.length) {
                        this.processToSelectTab(selectedTabHeader);
                    }
                });
            },
        );
    }

    subscribeGlobalProperties() {
        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    this.globalProperties = globalProperties;
                    this.updatePropertiesFromGlobalProperties(globalProperties);
                }
            });
        });
    }

    /**
     * subscribeInitializedWidgetContainerState
     */
    private subscribeInitializedWidgetContainerState() {
        this.initializedWidgetContainerSubscription = this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === WidgetDetailActions.INITIALIZED_WIDGET_CONTAINER &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                })
            )
            .subscribe(() => {
                this.appErrorHandler.executeAction(() => {
                    setTimeout(() => {
                        // 0001141: Fix small widget issue after opening GS first
                        if (this.layoutInfo) {
                            this.tabContentStyle = {
                                // 'height': `calc(100vh - ${this.layoutInfo.globalSearchHeight}px - ${this.layoutInfo.headerHeight}px - ${this.layoutInfo.tabHeaderHeight}px - ${this.layoutInfo.smallHeaderLineHeight}px - ${this.layoutInfo.dashboardPaddingTop}px)`
                                //'height': `calc(100vh - ${this.layoutInfo.headerHeight}px -
                                //                        ${this.ofModule.idSettingsGUI == 43 ? this.layoutInfo.tabHeaderBigSizeHeight : this.layoutInfo.tabHeaderHeight}px -
                                //                        ${this.layoutInfo.smallHeaderLineHeight}px -
                                //                        ${this.layoutInfo.dashboardPaddingTop}px)`
                                height: `calc(100% - 12%)`,
                            };
                        }
                    }, 200);
                });
            });
    }

    /**
     * updatePropertiesFromGlobalProperties
     * @param globalProperties
     */
    protected updatePropertiesFromGlobalProperties(globalProperties) {
        const gradientColor = this.propertyPanelService.getItemRecursive(globalProperties, 'GradientColor');
        this.gradientBackgroundStatus = gradientColor ? gradientColor.value : false;
    }

    processToSelectTab(selectedTabHeader: TabSummaryModel) {
        if (!this.mainTabContent) {
            return;
        }

        if (
            this.mainTabContent.TabID == selectedTabHeader.tabSummaryInfor.tabID ||
            selectedTabHeader.tabSummaryInfor.tabID == this.configuration.defaultMainTabId
        ) {
            this.selectMainTabContent();
            if (
                this.mainTabContent.TabID != this.configuration.defaultMainTabId &&
                selectedTabHeader.tabSummaryInfor.tabID == this.configuration.defaultMainTabId
            ) {
                selectedTabHeader = new TabSummaryModel({
                    tabSummaryInfor: new TabSummaryInfoModel({
                        lastUpdate: selectedTabHeader.tabSummaryInfor.lastUpdate,
                        tabID: this.mainTabContent.TabID,
                        tabName: selectedTabHeader.tabSummaryInfor.tabName,
                        tabType: selectedTabHeader.tabSummaryInfor.tabType,
                        isMainTab: selectedTabHeader.tabSummaryInfor.isMainTab,
                    }),
                    tabSummaryData: selectedTabHeader.tabSummaryData,
                    tabSummaryMenu: selectedTabHeader.tabSummaryMenu,
                    active: selectedTabHeader.active,
                    disabled: selectedTabHeader.disabled,
                    visible: selectedTabHeader.visible,
                    accessRight: selectedTabHeader.accessRight,
                });
                this.store.dispatch(this.tabSummaryActions.selectTab(selectedTabHeader, this.ofModule));
            }
        } else {
            this.selectOtherTabsContent(selectedTabHeader.tabSummaryInfor.tabID);
        }
    }

    selectMainTabContent() {
        this.mainTabContent.active = true;
        this.mainTabContent.loaded = true;
        this.tabService.unSelectTabs(this.otherTabsContent);
        this.store.dispatch(this.moduleSettingActions.selectToolbarSetting(this.mainTabContent.Toolbar, this.ofModule));
    }

    // public clickOtherTabsHeader(tabHeader, event?) {
    //     if (!this.selectedTabHeader || (this.selectedTabHeader && this.selectedTabHeader.tabSummaryInfor.tabID != tabHeader.tabSummaryInfor.tabID)) {
    //         if (typeof tabHeader.disabled != 'undefined' && tabHeader.disabled != undefined && tabHeader.disabled == true) {
    //             event.preventDefault();
    //             $(event.currentTarget).removeAttr('data-toggle');
    //             return false;
    //         }

    //         this.willChangeTab = {
    //             tab: tabHeader,
    //             isMainTab: false
    //         };

    //         if (this.setting && this.setting.Content) {
    //             let tabSetting = this.setting.Content.CustomTabs.find(t => t.TabID == tabHeader.tabSummaryInfor.tabID);
    //             this.store.dispatch(this.processDataActions.requestChangeTab(tabSetting, this.ofModule));
    //         }
    //     }

    //     if (event && event.type == 'dblclick') {
    //         this.store.dispatch(this.tabButtonActions.dblClickTabHeader(this.ofModule));
    //     }
    // }

    selectOtherTabsContent(otherTabId) {
        this.mainTabContent.active = false;

        if (this.otherTabsContent.length) {
            this.tabService.unSelectTabs(this.otherTabsContent);

            const clickedOtherTab = this.otherTabsContent.filter((otherTab) => {
                return otherTab.TabID == otherTabId;
            });

            const selectedTabHeader = this.tabSummaryModels.find((tab) => tab.tabSummaryInfor.tabID === otherTabId);

            if (clickedOtherTab.length) {
                clickedOtherTab[0].active = true;
                clickedOtherTab[0].loaded = true;
                this.store.dispatch(
                    this.moduleSettingActions.selectToolbarSetting(clickedOtherTab[0].Toolbar, this.ofModule),
                );
                this.store.dispatch(this.tabSummaryActions.selectTab(selectedTabHeader, this.ofModule));
                this.store.dispatch(this.layoutInfoActions.setRightPropertyPanelWidth('0', this.ofModule));

                this.store.dispatch(this.tabSummaryActions.tabChangedSuccess(this.ofModule));
                this.selectedTabHeader = selectedTabHeader;
            }
        }
    }

    onMouseEnter() {
        this.store.dispatch(this.tabSummaryActions.toggleTabButton(true, this.ofModule));
    }

    onMainTabChanged(data) {
        if (data) {
            this.onMainFormChanged.emit(data);
        }
    }

    onOtherTabChanged(data) {
        if (data) {
            this.onOtherFormChanged.emit(data);
        }
    }

    showHidePersonalContact() {
        this.isShowPersonalContact = !this.isShowPersonalContact;
        this._tabContactColleague.sendToggle(this.isShowPersonalContact);
    }

    addNewNote() {
        this.store.dispatch(this.administrationActions.showDialogAddNewNoteAction());
    }

    resetForm() {
        const tabId =
            this.selectedTabHeader && this.selectedTabHeader.tabSummaryInfor
                ? this.selectedTabHeader.tabSummaryInfor.tabID
                : '';
        this.store.dispatch(this.administrationActions.resetDocumentAction(tabId));
    }

    clearForm() {
        const tabId =
            this.selectedTabHeader && this.selectedTabHeader.tabSummaryInfor
                ? this.selectedTabHeader.tabSummaryInfor.tabID
                : '';
        this.store.dispatch(this.administrationActions.clearDocumentAction(tabId));
    }

    public getOcrText() {
        if (!this.activeBtnOcr || !this._extractedDataOcr) return;

        let tabFormName: DocumentFormNameEnum;
        const clonedOcrDataVisitor = cloneDeep(this._ocrDataVisitor) as OcrDataVisitor;
        switch (this.selectedTabHeader.tabSummaryInfor.tabID) {
            case 'Kontakt':
                tabFormName = DocumentFormNameEnum.WIDGET_CONTACT;
                clonedOcrDataVisitor.ocrData = clonedOcrDataVisitor.ocrData.filter(
                    (item) => item.GroupField === DocumentGroupFieldEnum.CONTACT,
                );
                break;

            case 'Bank':
                tabFormName = DocumentFormNameEnum.WIDGET_BANK;
                clonedOcrDataVisitor.ocrData = clonedOcrDataVisitor.ocrData.filter(
                    (item) => item.GroupField === DocumentGroupFieldEnum.CONTACT,
                );
                break;

            case 'Rechnungsinformationen':
                tabFormName = DocumentFormNameEnum.WIDGET_INVOICE;
                clonedOcrDataVisitor.ocrData = clonedOcrDataVisitor.ocrData.filter(
                    (item) => item.GroupField === DocumentGroupFieldEnum.INVOICE,
                );
                break;

            case 'NotizenTags':
                tabFormName = DocumentFormNameEnum.WIDGET_NOTES;
                break;

            case 'Contract':
                tabFormName = DocumentFormNameEnum.WIDGET_CONTRACT;
                clonedOcrDataVisitor.ocrData = clonedOcrDataVisitor.ocrData.filter(
                    (item) => item.GroupField === DocumentGroupFieldEnum.CONTRACT,
                );
                break;

            default:
                return;
        }

        if (this.areAllOcrDataEmpty(clonedOcrDataVisitor.ocrData)) {
            this.toasterService.pop(MessageModal.MessageType.info, 'System', `There is no ocr text for this form`);
            return;
        }

        this.acceptOcrText(clonedOcrDataVisitor, tabFormName);
    }

    private enableButtonOcr(isEnabled: boolean) {
        this.activeBtnOcr = isEnabled;
    }

    private togglePersonIcon(toggle: boolean) {
        this.isShowPersonalContact = toggle;
    }

    private acceptOcrText(ocrDataVisitor: OcrDataVisitor, tabFormName: DocumentFormNameEnum) {
        for (let i = 0; i < this._tabFormElements.length; i++) {
            const element = this._tabFormElements[i] as CapturedFormElement;

            if (element.tabFormName !== tabFormName) continue;

            element.accept(ocrDataVisitor);
            element.notifyOnAccept();
        }
    }

    private areAllOcrDataEmpty(dataOcr: ExtractedDataOcrState[]) {
        return dataOcr.findIndex((item) => !!item.Value) === -1;
    }
}
