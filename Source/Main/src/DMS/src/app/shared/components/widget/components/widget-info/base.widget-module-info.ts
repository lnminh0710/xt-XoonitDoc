import {
    Component, OnInit, Input, Output, OnChanges, SimpleChanges,
    EventEmitter, ViewChild, OnDestroy, ElementRef, Injectable,
    ComponentFactoryResolver, ViewContainerRef, ComponentRef, ViewChildren, QueryList, ChangeDetectorRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { MessageModal, FilterModeEnum, ComboBoxTypeConstant, PropertyNameOfWidgetProperty } from '@app/app.constants';
import {
    WidgetDetail,
    IListenKeyConfig,
    WidgetPropertyModel,
    IDragDropCommunicationData,
    DragMode,
    WidgetType,
    MessageModel,
    Module,
    FieldFilter,
    TabSummaryModel,
    WidgetState,
    ReloadMode,

    GroupFieldFilter,

    IWidgetCommonAction
} from '@app/models';

import {
    AppErrorHandler,
    ModalService,
    PropertyPanelService,
    DomHandler,
    ScrollUtils,
    TreeViewService,
    WidgetTemplateSettingService,
    DatatableService,
    GlobalSettingService,
    ArticleService, PersonService
} from '@app/services';

import { WidgetUtils } from '../../utils';

import * as wijmo from 'wijmo/wijmo';
import * as wjcInput from 'wijmo/wijmo.input';
import { PaperworkComponent } from '../paperwork';
import { WidgetTranslationComponent } from '../widget-translation';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import * as Ps from 'perfect-scrollbar';
import { BaseWidgetModuleInfoMixin } from './mixins';
import { XnWidgetMenuStatusComponent } from '../xn-widget-menu-status';
import { WidgetArticleTranslationDialogComponent } from '../widget-article-translation';
import { WidgetFormComponent } from '../widget-form';
import { XnCountryCheckListComponent, XnCreditCardComponent } from '@app/shared/components/xn-control/';
import { EditingWidget } from '@app/state-management/store/reducer/widget-content-detail';
//import { ArticleMediaManagerComponent, ArticleDetailUploadComponent } from '@app/shared/components/article-media-manager';
import {
    XnTreeViewComponent
} from '@app/shared/components/xn-control';
import { WidgetRoleTreeGridComponent } from '../widget-role-tree-grid';
//import { HistoryContainerComponent } from '@app/shared/components/customer-history';
import { ICommunicationWidget, IWidgetInfo } from '../../components/widget-communication-dialog';
import { WidgetDetailActions, PropertyPanelActions } from '@app/state-management/store/actions';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { XnFileExplorerComponent, XnUploadTemplateFileComponent } from '@app/shared/components/xn-file';
import { DocumentFormComponent } from '../../../../../pages/private/modules/customer/components/document-form';
import { CustomerLogoComponent } from '@app/pages/private/modules/customer/components/customer-logo';
import { Uti } from '../../../../../utilities/uti';

/**
 * BaseWidgetModuleInfo
 */
@Injectable()
export abstract class BaseWidgetModuleInfo extends BaseWidgetModuleInfoMixin {
    @Input() pageId: string;
    @Input() columnFilter: any = null;
    @Input() currentModule: Module;
    @Input() toolbarSetting: any;
    @Input() selectedTabHeader: TabSummaryModel;
    @Input() activeSubModule: Module;
    @Input() showInDialog = false;
    @Input() tabID: string;
    @Input() isExpandedPropertyPanel = false;

    @Input() widgetStates: Array<WidgetState>;
    @Input() reloadMode: ReloadMode = ReloadMode.ListenKey;

    public isToolbarButtonsShowed = false;
    public initwidgetMenuStatusData: any;
    protected currentChartDataSourceObject;

    //Toggle: true: maximize, false: restore
    @Input() isMaximized: boolean = undefined;
    public hasJustRestoredFullScreen: boolean = false;//has just restored full screen

    //
    public get data(): WidgetDetail {
        if (this.widgetStates && this.widgetStates.length) {
            const selectedState = this.widgetStates.find(p => p.selected);
            if (selectedState) {
                return selectedState.data;
            }
        }
        return new WidgetDetail();
    };

    // Callback function for communicate between widgets
    public dragDataTransferCallback: any;
    //public isWidgetEdited = false;
    public displayReadonlyGridAsForm = false;
    public fieldFilters: Array<FieldFilter>;
    public groupFieldFilter: Array<GroupFieldFilter>;
    public selectedFilter: FilterModeEnum = FilterModeEnum.ShowAll;
    public selectedSubFilter: FilterModeEnum = FilterModeEnum.ShowAll;

    private _allowDesignEdit: boolean;
    protected editingWidgets: Array<EditingWidget> = [];

    @Input() set allowDesignEdit(status: boolean) {
        this._allowDesignEdit = status;
        this.checkLinkedWidgetStatus();
    };

    get allowDesignEdit() {
        return this._allowDesignEdit;
    }

    @Output() onSuccessLinkingWidget = new EventEmitter<WidgetDetail>();
    @Output() onRemoveLinkingWidget = new EventEmitter<any>();
    @Output() onLinkingWidgetClicked = new EventEmitter<any>();
    @Output() onConnectedWidgetLinkHover = new EventEmitter<WidgetDetail>();
    @Output() onConnectedWidgetLinkUnHover = new EventEmitter();
    @Output() onEditingWidget = new EventEmitter<WidgetDetail>();
    @Output() onCancelEditingWidget = new EventEmitter<WidgetDetail>();
    @Output() onSaveSuccessWidget = new EventEmitter<any>();
    @Output() onClickOutsideWidget = new EventEmitter<any>();
    @Output() reloadWidgets = new EventEmitter<Array<WidgetDetail>>();

    //@ViewChild(HistoryContainerComponent) historyContainerComponent: HistoryContainerComponent;
    @ViewChild(WidgetArticleTranslationDialogComponent) widgetArticleTranslationDialogComponent: WidgetArticleTranslationDialogComponent;
    @ViewChild(PerfectScrollbarDirective) directiveScroll: PerfectScrollbarDirective;
    @ViewChild(XnWidgetMenuStatusComponent) widgetMenuStatusComponent: XnWidgetMenuStatusComponent;
    @ViewChild('xnFileExplorerComponent') fileExplorerCmp: XnFileExplorerComponent;
    @ViewChildren(XnUploadTemplateFileComponent) xnUploadTemplateFileCmp: QueryList<XnUploadTemplateFileComponent>;
    //@ViewChild(ArticleMediaManagerComponent) articleMediaManagerCmp: ArticleMediaManagerComponent;
    @ViewChildren(XnAgGridComponent) widgetAgGridComponents: QueryList<XnAgGridComponent>;
    @ViewChildren(XnTreeViewComponent) xnTreeViewCmps: QueryList<XnTreeViewComponent>;
    @ViewChildren(WidgetRoleTreeGridComponent) widgetTreeGridComponents: QueryList<WidgetRoleTreeGridComponent>;
    @ViewChild(CustomerLogoComponent) widgetCustomerLogoComponent: CustomerLogoComponent;
    //@ViewChild(ArticleDetailUploadComponent) widgetArticleDetailUploadComponent: ArticleDetailUploadComponent;

    // Widget Form Component
    @ViewChildren(WidgetFormComponent)
    widgetFormComponents: QueryList<WidgetFormComponent>;

    @ViewChildren(DocumentFormComponent)
    widgetDocumentFormComponents: QueryList<DocumentFormComponent>;

    public allowWidgetInfoTranslation = false;
    public isRenderWidgetInfoTranslation = false;

    // Used for combination widget : table or form
    // mode = 'form'  : Translate for form widget
    // mode = 'table' : Translate for table widget
    public combinationTranslateMode: string;

    public widgetBorderColor = '';

    get widgetFormComponent(): WidgetFormComponent {
        if (this.widgetFormComponents && this.widgetFormComponents.length) {
            const widgetForm = this.widgetFormComponents.find(p => p.isActivated);
            if (widgetForm) {
                return widgetForm;
            }
        }
        return null;
    }

    get widgetDocumentFormComponent(): DocumentFormComponent {
        if (this.widgetDocumentFormComponents && this.widgetDocumentFormComponents.length) {
            const widgetDocumentFormComponent = this.widgetDocumentFormComponents.find(p => p.isActivated);
            if (widgetDocumentFormComponent) {
                return widgetDocumentFormComponent;
            }
        }
        return null;
    }

    // Widget Country Component
    @ViewChildren(XnCountryCheckListComponent)
    widgetCountryComponents: QueryList<XnCountryCheckListComponent>;

    get widgetCountryComponent(): XnCountryCheckListComponent {
        if (this.widgetCountryComponents && this.widgetCountryComponents.length) {
            const countryForm = this.widgetCountryComponents.find(p => p.isActivated);
            if (countryForm) {
                return countryForm;
            }
        }
        return null;
    }

    // Widget Credit Card Component
    @ViewChildren(XnCreditCardComponent)
    creditCardComponents: QueryList<XnCreditCardComponent>;

    get creditCardComponent(): XnCreditCardComponent {
        if (this.creditCardComponents && this.creditCardComponents.length) {
            const widget = this.creditCardComponents.find(p => p.isActivated);
            if (widget) {
                return widget;
            }
        }
        return null;
    }

    // Widget WidgetTranslationComponent
    @ViewChildren(WidgetTranslationComponent)
    widgetTranslationComponents: QueryList<WidgetTranslationComponent>;

    get widgetTranslationComponent(): WidgetTranslationComponent {
        if (this.widgetTranslationComponents && this.widgetTranslationComponents.length) {
            const widget = this.widgetTranslationComponents.find(p => p.isActivated);
            if (widget) {
                return widget;
            }
        }
        return null;
    }

    public scrollStatus: any = {
        top: false,
        left: false,
        right: false,
        bottom: false
    };

    private _scrollUtils: ScrollUtils;
    protected get scrollUtils() {
        if (!this._scrollUtils) {
            this._scrollUtils = new ScrollUtils(this.scrollBodyContainer, this.domHandler);
        }
        return this._scrollUtils;
    }

    public isActiveWidget: boolean;

    /*
    * Check if widget changed data.
    */
    public get isWidgetDataEdited() {
        let isEdited: boolean;
        switch (this.data.idRepWidgetType) {
            case WidgetType.FieldSet:
                if (this.widgetFormComponent) {
                    isEdited = this.widgetFormComponent.isFormChanged;
                }
                break;

            case WidgetType.EditableGrid:
                isEdited = this.isTableEdited;
                break;

            case WidgetType.Combination:
                if (this.widgetFormComponent) {
                    isEdited = this.widgetFormComponent.isFormChanged;
                }
                if (!isEdited) {
                    isEdited = this.isTableEdited;
                }
                break;

            case WidgetType.CombinationCreditCard:
                if (this.widgetFormComponent) {
                    isEdited = this.widgetFormComponent.isFormChanged;
                }
                if (!isEdited) {
                    if (this.creditCardComponent) {
                        isEdited = this.creditCardComponent.isFormChanged;
                    }
                }
                break;

            case WidgetType.Country:
                if (this.widgetCountryComponent) {
                    isEdited = this.widgetCountryComponent.isFormChanged;
                }
                break;

            case WidgetType.Translation:
                if (this.widgetTranslationComponent) {
                    isEdited = this.widgetTranslationComponent.isFormChanged;
                }
                break;

            case WidgetType.TreeView:
                if (this.xnTreeViewComponent) {
                    isEdited = this.xnTreeViewComponent.isFormChanged;
                }
                break;

            case WidgetType.FileTemplate:
                if (this.xnUploadTemplateFileComponent) {
                    isEdited = this.xnUploadTemplateFileComponent.isOnEditting;
                }
                break;

            case WidgetType.DocumentProcessing:
                if (this.widgetDocumentFormComponent) {
                    isEdited = this.widgetDocumentFormComponent.isFormChanged;
                }
                break;
        }
        return isEdited;
    };

    public set isWidgetDataEdited(status) {
        switch (this.data.idRepWidgetType) {
            case WidgetType.FieldSet:
                if (this.widgetFormComponent) {
                    this.widgetFormComponent.isFormChanged = status;
                }
                break;

            case WidgetType.EditableGrid:
                this.isTableEdited = status;
                break;

            case WidgetType.Combination:
                if (this.widgetFormComponent) {
                    this.widgetFormComponent.isFormChanged = status;
                }
                this.isTableEdited = status;
                break;

            case WidgetType.CombinationCreditCard:
                if (this.widgetFormComponent) {
                    this.widgetFormComponent.isFormChanged = status;
                }
                if (this.creditCardComponent) {
                    this.creditCardComponent.isFormChanged = status;
                }
                break;

            case WidgetType.Country:
                if (this.widgetFormComponent) {
                    this.widgetCountryComponent.isFormChanged = status;
                }
                break;

            case WidgetType.Translation:
                if (this.widgetTranslationComponent) {
                    this.widgetTranslationComponent.isFormChanged = status;
                }
                break;

            case WidgetType.TreeView:
                if (this.xnTreeViewComponent) {
                    this.xnTreeViewComponent.isFormChanged = status;
                }
                break;

            case WidgetType.FileTemplate:
                if (this.xnUploadTemplateFileComponent) {
                    this.xnUploadTemplateFileComponent.isOnEditting = status;
                }
                break;
        }
    }

    /*
    * Check if widget is edit mode
    */
    public get isWidgetEditMode() {
        let isEditMode: boolean;
        switch (this.data.idRepWidgetType) {
            case WidgetType.FieldSet:
                if (this.widgetFormComponent) {
                    isEditMode = this.widgetFormComponent.editFieldMode || this.widgetFormComponent.editFormMode;
                }
                break;

            case WidgetType.EditableGrid:
                isEditMode = this.isOnEditingTable;
                break;

            case WidgetType.Combination:
                if (this.widgetFormComponent) {
                    isEditMode = this.widgetFormComponent.editFieldMode || this.widgetFormComponent.editFormMode;
                }
                if (!isEditMode) {
                    isEditMode = this.isOnEditingTable;
                }
                break;

            case WidgetType.CombinationCreditCard:
                if (this.widgetFormComponent) {
                    isEditMode = this.widgetFormComponent.editFieldMode || this.widgetFormComponent.editFormMode;
                }
                if (!isEditMode) {
                    if (this.creditCardComponent) {
                        isEditMode = this.creditCardComponent.editMode;
                    }
                }
                break;

            case WidgetType.Country:
                if (this.widgetCountryComponent) {
                    isEditMode = this.widgetCountryComponent.editMode;
                }
                break;

            case WidgetType.Translation:
                if (this.widgetTranslationComponent) {
                    isEditMode = this.widgetTranslationComponent.editMode;
                }
                break;

            case WidgetType.TreeView:
                if (this.xnTreeViewComponent) {
                    isEditMode = this.xnTreeViewComponent.isOnEditTreeView;
                }
                break;

            case WidgetType.FileTemplate:
                if (this.xnUploadTemplateFileComponent) {
                    isEditMode = this.xnUploadTemplateFileComponent.isOnEditting;
                }
                break;
        }
        return isEditMode;
    };

    /**
     * Get isOnEditingCountry: Edit Mode
     */
    public get isOnEditingCountry() {
        const widgetCountryComponent = this.widgetCountryComponent;
        if (widgetCountryComponent) {
            return widgetCountryComponent.editMode;
        }
        return false;
    }

    constructor(
        protected _eref: ElementRef,
        public store: Store<AppState>,
        public modalService: ModalService,
        public propertyPanelService: PropertyPanelService,
        public widgetUtils: WidgetUtils,
        public treeViewService: TreeViewService,
        public widgetTemplateSettingService: WidgetTemplateSettingService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected containerRef: ViewContainerRef,
        protected domHandler: DomHandler,
        public datatableService: DatatableService,
        public globalSettingService: GlobalSettingService,
        public articleService: ArticleService,
        public personService: PersonService,
        public ref: ChangeDetectorRef,
        protected widgetDetailActions: WidgetDetailActions,
        public propertyPanelActions: PropertyPanelActions) {
        super(store, widgetUtils, propertyPanelService, modalService, widgetTemplateSettingService, treeViewService, datatableService, globalSettingService, articleService, personService, ref, propertyPanelActions);
        this.dragDataTransferCallback = this.connectWidgetSuccessCallback.bind(this);
    }

    /**
     * Override from abstract class
     */
    get widgetStatesInfo(): Array<WidgetState> {
        return this.widgetStates;
    }

    /**
     * Override from abstract class
     */
    get dataInfo(): WidgetDetail {
        return this.data;
    }

    /**
     * Override from abstract class
     */
    get moduleInfo(): Module {
        return this.currentModule;
    }

    /**
     * Override from abstract class
     */
    get showInDialogStatus(): boolean {
        return this.showInDialog;
    }

    /**
     * Override from abstract class
     */
    get fieldFiltersInfo(): Array<FieldFilter> {
        return this.fieldFilters;
    }

    /**
     * Override from abstract class
     */
    get selectedFilterInfo(): FilterModeEnum {
        return this.selectedFilter;
    }

    /**
     * Override from abstract class
     */
    get selectedSubFilterInfo(): FilterModeEnum {
        return this.selectedSubFilter;
    }

    /**
     * Override from abstract class
     */
    get widgetMenuStatusInfo(): XnWidgetMenuStatusComponent {
        return this.widgetMenuStatusComponent;
    }

    /**
     * Override from abstract class
     */
    get propertiesInfo(): WidgetPropertyModel[] {
        return this.properties;
    }

    /**
     * Override from abstract class
     */
    get columnFilterInfo(): any {
        return this.columnFilter;
    }

    /**
     * Override from abstract class
     */
    get widgetAgGridComponent(): any {
        return this.widgetAgGridComponents;
    }

    /**
     * Override from abstract class
     */
    get widgetTreeGridComponent(): any {
        return this.widgetTreeGridComponents;
    }

    ///**
    // * Override from abstract class
    // */
    //get historyContainerGridComponent() {
    //    return this.historyContainerComponent;
    //}

    /**
     * Override from abstract class
     */
    get xnFileExplorerComponent(): any {
        return this.fileExplorerCmp;
    }

    ///**
    // * Override from abstract class
    // */
    //get articleMediaManagerComponent(): any {
    //    return this.articleMediaManagerCmp;
    //}

    ///**
    //* Override from abstract class
    //*/
    //get articleDetailUploadComponent(): any {
    //    return this.widgetArticleDetailUploadComponent;
    //}

    /**
     * Override from abstract class
     */
    get xnTreeViewComponents(): any {
        return this.xnTreeViewCmps;
    } 

    /**
     * Override from abstract class
     */
    get xnUploadTemplateFileComponents(): any {
        return this.xnUploadTemplateFileCmp;
    }


    /**
     * Override from abstract class
     */
    updateWidgetEditedStatus(status: boolean) {
        this.isWidgetDataEdited = status;
    }

    /**
     * Override from abstract class
     */
    cancelEditingWidget(data: WidgetDetail) {
        this.onCancelEditingWidget.emit(data);
    }

    /**
     * Override from abstract class
     */
    saveSuccessWidget(data: WidgetDetail) {
        if (!data) return;
        this.onSaveSuccessWidget.emit(data);
    }

    /**
     * Override from abstract class
     */
    editingWidget(data: WidgetDetail) {
        this.onEditingWidget.emit(data);
    }

    /**
    * Override from abstract class
    */
    get widgetEditedStatus(): boolean {
        return this.isWidgetDataEdited || this.checkCurrentWidgetHasChildrenInEditMode();
    }

    /**
     * Get elementRef
     * @param data
     */
    public get elementRef() {
        return this._eref;
    }

    /**
     * onWidgetEdited
     * Set dirty status of Widget for checking dirty.
     * @param event
     */
    public onWidgetEdited(event): void {
        if (isNil(event) || this.isWidgetDataEdited === event)
            return;
        this.isWidgetDataEdited = event;
        if (event) {
            this.onEditingWidget.emit(this.data);
            this.controlMenuStatusToolButtons(true);
        }
        else
            this.onCancelEditingWidget.emit(this.data);
    }

    /**
     * initConfig
     * Default config set here (icon status, color, UI, ...)
     */
    protected initConfig() {
        this.supportLinkWidget = this.widgetUtils.isSupportLinkWidget(this.data);
    }

    /**
     * connectWidgetSuccessCallback
     * @param data
     */
    public connectWidgetSuccessCallback(data: WidgetDetail) {
        this.linkedSuccessWidget = true;
        this.onSuccessLinkingWidget.emit(this.data);
        this.updateConnectedWidgetStatusProperty(this.data);

        if (this.data.idRepWidgetType == WidgetType.Chart) {
            this.resetChartProperties();
            this.rebuildFieldFiltersForChart();

            this.initwidgetMenuStatusData = {
                ...this.initwidgetMenuStatusData,
                fieldFilters: this.fieldFilters,
            };
        }
    }

    /**
     * checkLinkedWidgetStatus
     */
    protected checkLinkedWidgetStatus() {
        // Only check at design mode        
        if (this.allowDesignEdit && this.data.widgetDataType) {
            const hasListenKeyAndMainKey = !isNil(this.data.widgetDataType.listenKey)
                && !isEmpty(this.data.widgetDataType.listenKey.key)
                && !isEmpty(this.data.widgetDataType.listenKey.main);

            const standAloneWidget = !isNil(this.data.widgetDataType.listenKey)
                && isEmpty(this.data.widgetDataType.listenKey.key)
                && isEmpty(this.data.widgetDataType.listenKey.main)
                && isEmpty(this.data.widgetDataType.listenKey.sub)
                && !this.data.widgetDataType.primaryKey;

            const hasConnectedWithParentWidget = this.data.widgetDataType.parentWidgetIds && this.data.widgetDataType.parentWidgetIds.length;
            const hasSyncToSameTypeWidget = this.data.syncWidgetIds && this.data.syncWidgetIds.length;

            if (hasConnectedWithParentWidget
                || hasSyncToSameTypeWidget
                || hasListenKeyAndMainKey
                || standAloneWidget) {
                this.linkedSuccessWidget = true;
            }

            if (hasConnectedWithParentWidget) {
                const communicationWidget: ICommunicationWidget = {
                    srcWidgetDetail: this.data,
                    relatingWidgetInfos: [{
                        id: this.data.widgetDataType.parentWidgetIds[0],
                        title: ''
                    }],
                    childrenRelatingWidgetInfos: null,
                    isConnectToMainSupport: null,
                    sameTypeWidgetInfos: null
                };
                this.store.dispatch(this.widgetDetailActions.setConnectForParentFromChildWidget(communicationWidget, this.currentModule));
            }

            if (standAloneWidget) {
                this.supportLinkWidget = false;
            }
        }
    }

    /**
     * removeLinkWidgetSuccess
     * Override from abstract method of parent
     */
    protected removeLinkWidgetSuccess(notRemoveChildrenConnection?) {
        const parentWidgetIds = this.data.widgetDataType.parentWidgetIds;
        this.data.widgetDataType.listenKey.main = null;
        this.data.widgetDataType.listenKey.sub = null;
        this.data.widgetDataType.parentWidgetIds = [];
        this.data.syncWidgetIds = [];

        if (this.data.idRepWidgetType == WidgetType.Chart) {
            this.resetChartProperties(true);

            this.initwidgetMenuStatusData = {
                ...this.initwidgetMenuStatusData,
                widgetDetail: this.data,
                fieldFilters: this.fieldFilters
            };
        }

        this.onRemoveLinkingWidget.emit({
            widgetDetail: this.data,
            notRemoveChildrenConnection: notRemoveChildrenConnection,
            parentWidgetIds: parentWidgetIds
        });
    }

    protected linkWidgetClicked() {
        this.onLinkingWidgetClicked.emit(this.data);
    }

    /**
     * isWidgetTranslationInEditMode
     * Override from abstract method of parent
     */
    protected isWidgetTranslationInEditMode() {
        if (this.widgetTranslationComponent.editMode || this.isToolbarButtonsShowed) {
            // Turn translate widget to edit mode
            this.controlMenuStatusToolButtons(true);
            setTimeout(() => {
                this.editWidget(1);
            }, 300);

            return true;
        }
        return false;
    }

    /**
     * onWidgetLinkUnHovering
     */
    public onWidgetLinkUnHovering(event) {
        const hasToElement_IsLinkBox = event.toElement && event.toElement.className && event.toElement.className.indexOf('link-box') >= 0;
        const hasRelatedTarget_IsLinkBox = event.relatedTarget && event.relatedTarget.className && event.relatedTarget.className.indexOf('link-box') >= 0;
        if (hasToElement_IsLinkBox || hasRelatedTarget_IsLinkBox) {
            return;
        }
        this.linkedWidgetCoverDisplay = false;
        this.onConnectedWidgetLinkUnHover.emit();
    }

    /**
     * onWidgetLinkHovering
     * @param event
     */
    onWidgetLinkHovering(event) {
        /*
        if (this.linkedSuccessWidget)
        {
            this.linkedWidgetCoverDisplay = true;
            this.onConnectedWidgetLinkHover.emit(this.data);
        }
        */
        this.onConnectedWidgetLinkHover.emit(this.data);
    }

    /**
     * onUpdateTranslationWidget
     */
    onUpdateTranslationWidget(dragDropCommunicationData: IDragDropCommunicationData) {
        // this.data.extensionData = dragDropCommunicationData;
        this.onSuccessLinkingWidget.emit(this.data);
    }

    /**
     * printWidget
     */
    public printWidget(): void {
        const factory = this.componentFactoryResolver.resolveComponentFactory(PaperworkComponent);
        var componentRef: ComponentRef<PaperworkComponent> = this.containerRef.createComponent(factory);
        const paperworkComponent: PaperworkComponent = componentRef.instance;
        paperworkComponent.registerWidgetModuleInfo(this);
        paperworkComponent.print();
        componentRef.destroy();
    }

    public isOpeningOnPopup = false;
    public openNewWindow() {
        Uti.openPopupCenter('/widget?pageId=' + this.pageId + '&widgetId=' + this.data.id + '&moduleId=' + this.currentModule.idSettingsGUI, 'Widget Standalone', 1280, 700);
        this.isOpeningOnPopup = true;
    }

    /**
     * scrollBodyContainer of widget
     */
    public get scrollBodyContainer() {
        if (this.directiveScroll) {
            return this.directiveScroll.elementRef.nativeElement;
        }
        return null;
    }

    /**
     * onScroll
     * @param mode
     */
    onScroll(mode) {
        if (mode) {
            if (this.agGridComponent) {
                this.agGridComponent.scrollToPosition(mode);
            }
        }
    }

    /**
     * onScrollHover
     * @param mode
     */
    onScrollHover(mode) {
        if (mode) {
            if (this.agGridComponent) {
                this.agGridComponent.scrollHover(mode);
            }
        }
    }

    /**
     * onScrollUnHover
     * @param mode
     */
    onScrollUnHover(mode) {
        if (mode) {
            if (this.agGridComponent) {
                this.agGridComponent.scrollUnHover(mode);
            }
        }
    }

    /**
     * onClickOutside
     * @param event
     */
    onClickOutside(event: any) {
        // Outside
        if (event && event['value'] === true) {
            if (!this.isClickInsideSpecialCase(event.target)) {
                // console.log('Outside');
                if (!this.isRenderWidgetInfoTranslation) {
                    if (this.isMaximized) {
                        this.isActiveWidget = true;
                    }
                    else {
                    this.isActiveWidget = false;
                        if (this.hasJustRestoredFullScreen) {
                            this.hasJustRestoredFullScreen = false;
                        }
                    }
                    
                    this.onClickOutsideWidget.emit({
                        widgetApp: this.data.idRepWidgetApp,
                        isActive: this.isActiveWidget,
                        id: this.data.id
                    });
                    this.widgetBorderColor = '';
                    this.reattach();
                    this.detach();
                }
            }
            else {
                this.reattach();
            }
        }
        // Inside
        else {
            // console.log('Inside');
            this.isActiveWidget = true;
            this.onClickOutsideWidget.emit({
                widgetApp: this.data.idRepWidgetApp,
                isActive: this.isActiveWidget,
                id: this.data.id
            });
            this.reattach();
        }
    }

    /**
     * isClickInsideSpecialCase
     */
    private isClickInsideSpecialCase(target) {
        let iRet: boolean = false;
        const selectorArray = [
            'wj-popup.menu-widget-status-ddl',
            'wj-popup.edit-widget-ddl',
            '.ui-widget-overlay',
            '.ui-dialog',
            'widget-translate',
            '.property-panel',
            '.widget-combination-translation'
        ];

        for (let i = 0; i < selectorArray.length; i++) {
            let node = this.domHandler.findParent(target, selectorArray[i]);
            if (node && node.length > 0) {
                iRet = true;
                break;
            }
        }
        return iRet;
    }

    /**
     * onTreeViewExpandWidget
     * @param event
     */
    public onTreeViewExpandWidget(event: any) {
        if (this.xnTreeViewComponent) {
            this.xnTreeViewComponent.setExpandForTree(event);
        }
        if (this.agGridComponent) {
            if (event) {
                this.agGridComponent.collapseGroupsToLevel(1);
            }
            else {
                this.agGridComponent.collapseGroupsToLevel(0);
            }
        }
    }

    /**
     * onWidgetHover
     * @param $event
     */
    public onWidgetHover($event) {
        this.reattach();
        //console.log('onWidgetHover');
    }

    /**
     * onWidgetLeave
     * @param $event
     */
    public onWidgetLeave($event) {
        if (!this.isClickInsideSpecialCase($event.toElement)) {
            //console.log('onWidgetLeave');
            this.detach();
        }
        else {
            this.reattach();
        }
    }

    /**
     * reattach
     */
    public reattach() {
        //console.log('reattach id:' + this.data.id);
        // this.ref.reattach();
    }

    /**
     * detach
     */
    public detach(timeOut?: number) {

        // if (timeOut) {
        //     setTimeout(() => {
        //         this.ref.detach();
        //         //console.log('detach timeOut :' + this.data.id);
        //     }, timeOut);
        // }
        // else {
        //     setTimeout(() => {
        //         this.ref.detach();
        //         //console.log('detach :' + this.data.id);
        //     });
        // }
    }

    /**
     * isWidgetCompletedRender
     */
    public isWidgetCompletedRender() {
        this.reattach();
        this.detach(500);
    }

    /**
     * checkCurrentWidgetHasChildrenInEditMode
     */
    public checkCurrentWidgetHasChildrenInEditMode() {
        let isFound = false;
        if (this.editingWidgets && this.editingWidgets.length && this.data.widgetDataType.primaryKey) {
            const primaryKeys: Array<string> = this.data.widgetDataType.primaryKey.split(',');
            this.editingWidgets.forEach((editingWidget: EditingWidget) => {
                const listenKeys: Array<string> = editingWidget.widgetDetail.widgetDataType.listenKey.key.split(',');
                const parentWidgetIds: Array<string> = editingWidget.widgetDetail.widgetDataType.parentWidgetIds;
                if (parentWidgetIds) {
                    let count = 0;
                    if (listenKeys && listenKeys.length) {
                        listenKeys.forEach(key => {
                            const iRet = primaryKeys.find(p => p == key);
                            if (iRet) {
                                count++;
                            }
                        });
                        let foundParent = parentWidgetIds.find(p => p == this.data.id);
                        if (count && count == primaryKeys.length && foundParent) {
                            isFound = true;
                        }
                    }
                }
            });
        }
        return isFound;
    }

    /**
     * getSavingData
     **/
    public getSavingData() {
        let data;
        let isTableWidget = this.widgetUtils.isTableWidgetDataType(this.data);
        if (isTableWidget) {
            data = this.getSavingDataTable();
            if (data && !data.length) {
                data = null;
            }
        }
        else {
            if (this.widgetFormComponent) {
                if (typeof this.widgetFormComponent.getSavingData === "function") {
                    data = this.widgetFormComponent.getSavingData();
                }
            }
            else if (this.widgetDocumentFormComponent) {
                if (typeof this.widgetDocumentFormComponent.getSavingData === "function") {
                    data = this.widgetDocumentFormComponent.getSavingData();
                }
            }
            else if (this.widgetCustomerLogoComponent) {
                if (typeof this.widgetCustomerLogoComponent.getSavingData === "function") {
                    data = this.widgetCustomerLogoComponent.getSavingData();
                }
            }
        }
        return data;
    }

    /**
     * isValidForSaving
     **/
    public isValidForSaving() {
        let status: boolean = true;
        switch (this.data.idRepWidgetType) {
            case WidgetType.FieldSet:
                status = this.widgetFormComponent.form.valid;
                if (!status) {
                    this.widgetFormComponent.focusOnFirstFieldError();
                }
                break;
            case WidgetType.EditableGrid:
                status = this.agGridComponent.hasError() ? false : true;
                break;

            case WidgetType.DocumentProcessing:
                status = this.widgetDocumentFormComponent.isValid();
                break;
        }
        return status;
    }

    private resetChartProperties(alsoClearData?: boolean) {
        this.fieldFilters = [];
        this.widgetMenuStatusComponent.fieldFilters = [];
        this.widgetMenuStatusComponent.isInitDisplayFields = false;
        this.currentChartDataSourceObject = null;

        if (alsoClearData) {
            this.data.contentDetail = null;
        }

        this.clearChartProperties(this.properties, 'SingleXSerie');
        this.clearChartProperties(this.properties, 'SingleYSerie');
        this.clearChartProperties(this.properties, 'MultiXSerie');
        this.clearChartProperties(this.properties, 'MultiYSeries', true);
        this.clearChartProperties(this.properties, 'ComboSingleXSerie');
        this.clearChartProperties(this.properties, 'ComboSingleYSerie');
        this.clearChartProperties(this.properties, 'ComboMultiXSerie');
        this.clearChartProperties(this.properties, 'ComboMultiYSeries', true);

        let dataSourceObject: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(this.properties, ComboBoxTypeConstant.chartDataSourceObject, PropertyNameOfWidgetProperty.ComboboxStoreObject);
        if (dataSourceObject) {
            dataSourceObject.value = null;
        }
    }

    private clearChartProperties(properties, propName, isMultiCombobox?: boolean) {
        let prop = this.propertyPanelService.getItemRecursive(this.properties, propName);
        if (prop) {
            prop.options = [];
            prop.value = isMultiCombobox ? [] : null;
        }
    }

    private rebuildFieldFiltersForChart() {
        Object.keys(this.data.contentDetail.columnSettings).forEach((key) => {
            this.fieldFilters.push(new FieldFilter({
                fieldDisplayName: this.data.contentDetail.columnSettings[key].ColumnName,
                fieldName: this.data.contentDetail.columnSettings[key].OriginalColumnName,
                selected: false,
                isHidden: false,
                isEditable: false
            }));
        });
    }    
}

