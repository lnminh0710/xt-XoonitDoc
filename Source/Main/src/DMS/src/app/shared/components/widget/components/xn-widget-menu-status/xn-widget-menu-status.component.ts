import {
  ViewChild,
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  AfterViewInit,
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import { PropertyPanelActions, FileManagerActions, CustomAction } from '@app/state-management/store/actions';
import {
  FilterModeEnum,
  SavingWidgetType,
  WidgetFormTypeEnum,
  EditWidgetTypeEnum,
  OrderDataEntryWidgetLayoutModeEnum,
  GlobalSettingConstant,
  ControlType,
  RepWidgetAppIdEnum,
  AccessRightWidgetCommandButtonEnum,
  RepProcessingTypeEnum,
} from '@app/app.constants';
import {
  WidgetDetail,
  ColumnLayoutSetting,
  WidgetFormType,
  FilterMode,
  FieldFilter,
  GlobalSettingModel,
  FilterData,
  WidgetPropertiesStateModel,
  WidgetPropertyModel,
  Module,
  WidgetType,
  RowSetting,
  ApiResultResponse,
  ReloadMode,
  OrderDataEntryProperties,
  WidgetMenuStatusModel,
  WidgetMenuStatusPropertyModel,
  GroupFieldFilter,
} from '@app/models';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { WidgetUtils } from '../../utils';
import * as uti from '@app/utilities';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import {
  PropertyPanelService,
  GlobalSettingService,
  AppErrorHandler,
  DomHandler,
  CommonService,
  DatatableService,
} from '@app/services';
import * as wjcInput from 'wijmo/wijmo.angular2.input';
import { FilterMenuComponent } from '@app/shared/components/widget/components/filter-menu';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { BaseComponent } from '@app/pages/private/base';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import { DialogAddWidgetTemplateComponent } from '../dialog-add-widget-template';
import { Uti } from '@app/utilities';
import { ComboBox } from 'wijmo/wijmo.input';
import * as Slider from 'bootstrap-slider';
import { DialogUserRoleComponent } from '../dialog-user-role';
import { ChartTypeNgx } from '../widget-chart';
import { filter } from 'rxjs/operators';

export function getDropdownConfig(): BsDropdownConfig {
  return Object.assign(new BsDropdownConfig(), { autoClose: false });
}
@Component({
  selector: 'xn-widget-menu-status',
  styleUrls: ['./xn-widget-menu-status.component.scss'],
  templateUrl: './xn-widget-menu-status.component.html',
  providers: [{ provide: BsDropdownConfig, useFactory: getDropdownConfig }],
})
export class XnWidgetMenuStatusComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  public data: WidgetDetail;
  public randomNumb: string = uti.Uti.guid();
  public repWidgetAppIdEnum = RepWidgetAppIdEnum;
  public WidgetTypeView = WidgetType;

  public filterModes: FilterMode[] = [];
  public subFilterModes: FilterMode[] = [];
  public fieldFilters: FieldFilter[] = [];
  public groupFieldFilters: Array<GroupFieldFilter>;

  _isShowedResetButton = false;
  _iconColor = '';
  _cachedIconColor = '';
  public isCellMoveForward = true;
  private iconEditColor = '#fba026';
  private _copiedFieldFilter: FieldFilter[];
  allFields: FieldFilter[] = null;
  selectedFilter: FilterModeEnum = FilterModeEnum.ShowAll;
  selectedSubFilter: FilterModeEnum = FilterModeEnum.ShowAll;
  private position: any = null;
  public dropdownStatus: { isHidden: boolean } = { isHidden: false };
  public dropdownTableStatus: { isHidden: boolean } = { isHidden: false };
  public isShowEditDropdown = false;
  public isOpeningEditDropdown = false;
  public isShowedEditFormButton: boolean;
  public isShowedEditTableButton: boolean;
  public isShowedEditButtonsForCountry: boolean;
  public isShowedEditButtonsForTreeView: boolean;
  public isShowedUploadFiles: boolean;
  public isShowedDeleteFiles: boolean;
  public isShowedSaveFileExplorer: boolean;
  public isShowedExpandForTreeView: boolean;
  public isShowedEditRowTableButton: boolean;
  public isShowedAddNewRowTableButton: boolean;
  public isShowedDeleteRowTableButton: boolean;
  public isShowToolButtonsWihoutClick: boolean;
  public showFirstCombinationMenu = false;
  public showSecondCombinationMenu = false;
  public isShowToogleButton = false;
  public isDisableAddRowTableButton = false;
  public isDisableDeleteRowTableButton = true;
  public isDisableSaveTableButton = false;
  private currentToggleElement: any;
  private _isShowedFilterModes = true;
  private widgetFormTypes: WidgetFormType[] = [];
  public columnLayoutsetting: ColumnLayoutSetting = null;
  public gridLayoutSettings: any;
  public rowSetting: RowSetting = null;
  private selectedWidgetFormType: WidgetFormTypeEnum = WidgetFormTypeEnum.List;
  private widgetProperties: WidgetPropertyModel[] = [];
  private isFireEventUpdateOnInit = false;
  private hasSubMenu: any = { has: true };
  private globalWidgetProperties: WidgetPropertyModel[] = [];
  private toolbarSetting: any;
  private isViewMode = true;
  private editingWidgets: Array<any> = [];
  public isInitDisplayFields = false;
  private isInitImportantDisplayFields = false;
  private isUpdateOnInitFieldsFilter = false;
  public orderDataEntryWidgetLayoutMode: OrderDataEntryWidgetLayoutModeEnum;
  public orderDataEntryProperties: OrderDataEntryProperties;
  private editingWidgetType = null;
  public showToolButtons = false;
  private toolbarFilterValue = '';
  public showFilterTable = true;
  public isForAllCountryCheckbox: boolean;
  public isForAllCountryButton: boolean;
  public itemSelectedInFolderManagement: Array<any> = [];
  public isSelectFolder: boolean;
  public isFileExplorerDetailView: boolean;
  public allCountryCheckboxModel: any = {
    forAllCountryCheckbox: false,
  };

  private isViewModeState: Observable<boolean>;
  private editingWidgetsState: Observable<Array<any>>;

  private isViewModeStateSubscription: Subscription;
  private editingWidgetsStateSubscription: Subscription;

  public supportPrint: boolean;
  public settingChanged: boolean;
  public deletedRulesCount = 0;
  public selectedTemplate: any;
  public isEditTemplateMode = false;
  public widgetTemplates: any[] = [];
  public showDialogAddWidgetTemplate = false;
  public templateComboFocused = false;
  private ignoreOnChangedEmitter = false;
  private dialogAddWidgetTemplate: DialogAddWidgetTemplateComponent;

  private subscribeIsSelectInFolderManagement: Subscription;

  @ViewChild(DialogAddWidgetTemplateComponent) set dialogAddWidgetTemplateComponentInstance(
    dialogAddWidgetTemplateComponentInstance: DialogAddWidgetTemplateComponent,
  ) {
    this.dialogAddWidgetTemplate = dialogAddWidgetTemplateComponentInstance;
  }

  private templateCombo: ComboBox;
  @ViewChild('templateCombo') set templateComboInstance(templateComboInstance: ComboBox) {
    this.templateCombo = templateComboInstance;
  }

  @Input() widgetReloadMode: ReloadMode = ReloadMode.ListenKey;

  private _data: any = {};
  @Input()
  set dataInput(_data) {
    this._data = _data;
    if (_data) {
      this.data = _data.widgetDetail;
      this.handleDisplayEditButtons();
      this.isForAllCountryCheckbox = _data.isForAllCountryCheckbox;
      this.isForAllCountryButton = _data.isForAllCountryButton;
      this.selectedFilter = _data.selectedFilter;
      this.selectedSubFilter = _data.selectedSubFilter;
      this.initFieldArray(_data);
      this._copiedFieldFilter = cloneDeep(this.fieldFilters);

      if (_data.columnLayoutsetting && this.columnLayoutsetting != _data.columnLayoutsetting)
        this.columnLayoutsetting = cloneDeep(_data.columnLayoutsetting);

      if (!this.columnLayoutsetting) {
        this.columnLayoutsetting = cloneDeep(this.initColumnLayoutSetting());
      }

      this.gridLayoutSettings = _data.gridLayoutSettings;

      if (_data.rowSetting && this.rowSetting != _data.rowSetting) this.rowSetting = cloneDeep(_data.rowSetting);

      if (!this.rowSetting) {
        this.rowSetting = cloneDeep(this.initRowSetting());
      }

      if (!isNil(_data.selectedWidgetFormType)) this.selectedWidgetFormType = _data.selectedWidgetFormType;

      const hasFormType =
        this.data.idRepWidgetType == WidgetType.FieldSet ||
        this.data.idRepWidgetType == WidgetType.Combination ||
        this.data.idRepWidgetType == WidgetType.CombinationCreditCard ||
        this.data.idRepWidgetType == WidgetType.FieldSetReadonly;
      if (hasFormType && (!this.widgetFormTypes || !this.widgetFormTypes.length)) {
        this.widgetFormTypes = this.initWidgetFormType();
      }

      if (_data.widgetProperties && _data.widgetProperties != this.widgetProperties) {
        this.widgetProperties = _data.widgetProperties;
      }
      this.initBehaviorDataForWidgetProperties();

      this.filterModes.forEach(filterMode => {
        filterMode.selected = false;
        if (filterMode.mode == this.selectedFilter) {
          filterMode.selected = true;
        }
      });
      this.subFilterModes.forEach(item => {
        item.selected = false;
        if (item.mode == this.selectedSubFilter) {
          item.selected = true;
        }
      });

      let isChangeFormType = false;
      this.widgetFormTypes.forEach(setting => {
        if (setting.widgetFormType === this.selectedWidgetFormType) {
          isChangeFormType = !setting.selected;
          setting.selected = true;
        } else setting.selected = false;
      });
      if (isChangeFormType) this.widgetFormTypes = cloneDeep(this.widgetFormTypes);

      setTimeout(() => {
        this.initOwnerForMenuWidgetStatus();
      }, 500);

      this.hasSubMenu = cloneDeep(this.hasSubMenu);

      if (_data.orderDataEntryWidgetLayoutMode)
        this.orderDataEntryWidgetLayoutMode = _data.orderDataEntryWidgetLayoutMode;

      if (_data.orderDataEntryProperties) this.orderDataEntryProperties = _data.orderDataEntryProperties;

      this.supportPrint = this.widgetUtils.isSupportPrint(this.data);

      if (this.widgetReloadMode === ReloadMode.ListenKey) {
        this.toolbarFilterValue = '';
      }

      this.isShowWidgetSetting = this.widgetUtils.isSupportWidgetSetting(this.data);
      this.isShowToogleButton = this.widgetUtils.isShowToogleButton(this.data);
    }
  }

  @Input() listenKeyRequestItem: any;
  @Input() showInDialog = false;
  @Input() accessRight: any = {};
  @Input() allowEdit: boolean;
  @Input() set isShowedResetButton(data: any) {
    this._isShowedResetButton = data;
    if (this._isShowedResetButton) {
      this._iconColor = this.iconEditColor;
    } else if (this._iconColor === this.iconEditColor) {
      this._iconColor = this._cachedIconColor;
    }
  }

  @Input() allowTableEditRow: boolean;
  @Input() allowTableAddNewRow: boolean;
  @Input() allowTableDeleteRow: boolean;
  @Input() allowColTranslation: boolean;
  @Input() isShowProperties = true;
  @Input() isShowWidgetSetting = true;
  @Input() isShowOrderDataEntryPaymentSetting = false;
  @Input() isShowODEGridProperties = false;
  @Input() isShowToolPanelSetting = false;
  @Input() isFolderManagement: boolean;

  @Input()
  set isShowedFilterModes(_isShowed: boolean) {
    this._isShowedFilterModes = _isShowed;
    if (!_isShowed) {
      this.filterModes = [];
      this.subFilterModes = [];
    }
  }
  @Input() set iconColor(data: any) {
    this._cachedIconColor = data;
    if (this._isShowedResetButton) {
      this._iconColor = this.iconEditColor;
      return;
    }
    this._iconColor = data;
  }

  private _isSwitchedFromGridToForm: boolean = false;
  @Input() set isSwitchedFromGridToForm(isSwitched: boolean) {
    if (!isNil(isSwitched)) {
      this._isSwitchedFromGridToForm = isSwitched;
      if (isSwitched) {
        if (!this.widgetFormTypes || !this.widgetFormTypes.length) {
          this.widgetFormTypes = this.initWidgetFormType();
        }
      } else {
        this.widgetFormTypes = [];
      }
    }
  }

  get isSwitchedFromGridToForm() {
    return this._isSwitchedFromGridToForm;
  }

  @Input() gridWidgetComponent: any;
  @Input() gridWidgetDatasource: any;
  @Input() showFieldsTranslation = false;
  @Input() currentModule: Module;
  @Input() globalProperties: any;
  @Input() disableButtonEditWidget: boolean;
  @Input() treeViewMode: boolean;

  @Input() selectedNodes: Array<any>;
  @Input() groupTotal: number;
  @Input() groupNumber: number;

  /**
   * Output
   */
  @Output() onEditWidget = new EventEmitter<EditWidgetTypeEnum>();
  @Output() onSaveWidget = new EventEmitter<SavingWidgetType>();
  @Output() onResetWidget = new EventEmitter<boolean>();
  @Output() onRemoveWidget = new EventEmitter<boolean>();
  @Output() onChangeDisplayMode = new EventEmitter<any>();
  @Output() onChangeFieldFilter = new EventEmitter<FilterData>();
  @Output() onUpdateRowEditableTable = new EventEmitter<EditWidgetTypeEnum>();
  @Output() onTreeViewExpandWidget = new EventEmitter<boolean>();
  @Output() onChangeColumnLayoutsetting = new EventEmitter<ColumnLayoutSetting>();
  @Output() onChangeRowSetting = new EventEmitter<RowSetting>();
  @Output() onChangeODEProperties = new EventEmitter<any>();
  @Output() onChangeWidgetFormType = new EventEmitter<WidgetFormTypeEnum>();
  @Output() onPropertiesItemClick = new EventEmitter<any>();
  @Output() onClickUploadFiles = new EventEmitter<any>();
  @Output() onClickDeleteFiles = new EventEmitter<any>();
  @Output() onOpenTranslateWidget = new EventEmitter<any>();
  @Output() onEditWidgetInPopup = new EventEmitter<any>();
  @Output() onPrintWidget = new EventEmitter<boolean>();
  @Output() onToolbarFilterValueChanged = new EventEmitter<string>();
  @Output() onToolbarButtonsToggle = new EventEmitter<boolean>();
  @Output() onCursorFocusOutOfMenu = new EventEmitter<boolean>();
  @Output() onOpenArticleTranslate = new EventEmitter<any>();
  @Output() onOpenFieldTranslateWidget = new EventEmitter<any>();
  @Output() onCellDirectionChanged = new EventEmitter<any>();
  @Output() onAddWidgetTemplate = new EventEmitter<any>();
  @Output() onChangeWidgetTemplate = new EventEmitter<any>();
  @Output() onRefresh = new EventEmitter<any>();

  @Output() onSuccessRoleSaved = new EventEmitter<any>();
  @Output() onNextDoubletteGroup = new EventEmitter<number>();
  @Output() groupNumberChange: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('menuWidgetStatus1')
  private menuWidgetStatus1: wjcInput.WjPopup;

  @ViewChild('menuWidgetStatus2')
  private menuWidgetStatus2: wjcInput.WjPopup;

  @ViewChild('menuWidgetStatus3')
  private menuWidgetStatus3: wjcInput.WjPopup;

  @ViewChild('editFormDropdown')
  public editFormDropdown: wjcInput.WjPopup;

  @ViewChild('editTableDropdown')
  private editTableDropdown: wjcInput.WjPopup;

  @ViewChild('editCountryDropdown')
  private editCountryDropdown: wjcInput.WjPopup;

  @ViewChild('editTreeviewDropdown')
  private editTreeviewDropdown: wjcInput.WjPopup;

  @ViewChild('filterMenuForTable')
  private filterMenuForTable: FilterMenuComponent;

  constructor(
    private _eref: ElementRef,
    private store: Store<AppState>,
    private dispatcher: ReducerManagerDispatcher,

    private propertyPanelActions: PropertyPanelActions,
    private propertyPanelService: PropertyPanelService,
    private globalSettingSer: GlobalSettingService,
    private globalSettingConstant: GlobalSettingConstant,
    private appErrorHandler: AppErrorHandler,
    private domHandler: DomHandler,
    private widgetUtils: WidgetUtils,
    protected router: Router,
    private commonService: CommonService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private containerRef: ViewContainerRef,
    private datatableService: DatatableService,
    private folderManagementAction: FileManagerActions,
  ) {
    super(router);

    this.isViewModeState = store.select(
      state => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).isViewMode,
    );
    this.editingWidgetsState = store.select(
      state => widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).editingWidgets,
    );
  }

  public ngOnInit() {
    if (!this.filterModes || (this.filterModes && this.filterModes.length == 0)) {
      if (!this._isShowedFilterModes) {
        this.filterModes = [];
        this.subFilterModes = [];
      } else {
        this.filterModes = [
          new FilterMode({
            mode: FilterModeEnum.ShowAllWithoutFilter,
            value: 'Show all fields',
          }),
          new FilterMode({
            mode: FilterModeEnum.ShowAll,
            value: 'Show all',
          }),
          new FilterMode({
            mode: FilterModeEnum.HasData,
            value: 'Only has data',
          }),
          new FilterMode({
            mode: FilterModeEnum.EmptyData,
            value: 'Only empty data',
          }),
        ];

        this.filterModes.forEach(filterMode => {
          filterMode.selected = false;
          if (filterMode.mode == this.selectedFilter) {
            filterMode.selected = true;
          }
        });

        this.subFilterModes = cloneDeep(this.filterModes);
        this.subFilterModes.forEach(filterMode => {
          filterMode.selected = false;
          if (filterMode.mode == this.selectedSubFilter) {
            filterMode.selected = true;
          }
          filterMode.isSub = true;
        });
      }
    }

    if (
      this.data &&
      this.data.idRepWidgetType == WidgetType.FieldSet &&
      (!this.widgetFormTypes || !this.widgetFormTypes.length)
    ) {
      this.widgetFormTypes = this.initWidgetFormType();
    }

    this.subscribeIsSelectFolder();

    this.subscribeIsViewModeState();
    this.subscribeEditingWidgetsState();
    this.handleDisplayEditButtons();
    setTimeout(() => {
      this.getWidgetGlobalPropertiesFromSetting();
    }, 200);
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.initOwnerForMenuWidgetStatus();
      // this.mainToolbarMenu = this.buildMainToolbarMenu();
    }, 500);
    this.handleShowFilterTable(true);
  }

  ngOnDestroy() {
    uti.Uti.unsubscribe(this);
  }

  private hasChanges(changes) {
    return changes && changes.hasOwnProperty('currentValue') && changes.hasOwnProperty('previousValue');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['allowTableAddNewRow']) {
      const hasChanges = this.hasChanges(changes['allowTableAddNewRow']);
      if (hasChanges) {
        this.isShowedAddNewRowTableButton = this.allowTableAddNewRow;
      }
    }
    if (changes['allowTableDeleteRow']) {
      const hasChanges = this.hasChanges(changes['allowTableDeleteRow']);
      if (hasChanges) {
        this.isShowedDeleteRowTableButton = this.allowTableDeleteRow;
      }
    }
  }

  public editWidget(widgetType) {
    this.editingWidgetType = widgetType;
    this.getWidgetGlobalPropertiesFromSetting(this.editWidgetCallback.bind(this));
  }

  public resetToUpdateFieldsFilterFromOutside() {
    this.isUpdateOnInitFieldsFilter = false;
  }

  editWidgetCallback() {
    const editMode = this.propertyPanelService.getItemRecursive(this.globalWidgetProperties, 'EditIn');

    if (editMode) {
      switch (editMode.value) {
        case 'Popup':
          this.editWidgetInPopup(this.editingWidgetType);
          break;

        case 'Inline':
          this.editWidgetInline(this.editingWidgetType);
          break;
      }
    }
  }

  public handleShowFilterTable(isShow: boolean) {
    this.showFilterTable = isShow;
  }

  private handleDisplayEditButtons() {
    if (this.data) {
      switch (this.data.idRepWidgetType) {
        case WidgetType.FieldSet:
        case WidgetType.Combination:
        case WidgetType.CombinationCreditCard:
          this.isShowedEditFormButton = true;
          this.isShowedResetButton = true;
          this.toggleTableControlButtons();
          break;
        case WidgetType.Translation:
          this.isShowedEditFormButton = true;
          this.isShowedResetButton = true;
          this.toggleTranslationTableControlButtons();
          break;
        case WidgetType.EditableGrid:
        case WidgetType.EditableTable:
        case WidgetType.EditableRoleTreeGrid:
          this.isShowedEditTableButton = true;
          this.isShowedResetButton = true;
          this.toggleTableControlButtons();

          if (this.treeViewMode) {
            this.isShowedExpandForTreeView = true;
          }
          break;
        case WidgetType.FileExplorer:
        case WidgetType.ToolFileTemplate:
        case WidgetType.FileExplorerWithLabel:
          this.isShowedResetButton = true;
          this.isShowedSaveFileExplorer = true;
          this.isShowedUploadFiles = true;
          this.isShowedDeleteFiles = true;
          break;
        case WidgetType.FileTemplate:
          this.isShowedSaveFileExplorer = true;
          this.isShowedResetButton = true;
          break;
        case WidgetType.Country:
          this.isShowedEditButtonsForCountry = true;
          this.isShowedResetButton = true;
          break;
        case WidgetType.TreeView:
        case WidgetType.EditableRoleTreeGrid:
          this.isShowedEditButtonsForTreeView = true;
          this.isShowedResetButton = true;
          this.isShowedExpandForTreeView = true;
          break;
        case WidgetType.DataGrid:
          if (this.widgetUtils.isGroupTable(this.data)) {
            this.isShowedExpandForTreeView = true;
          }
          break;
        case WidgetType.Upload:
        case WidgetType.ArticleDetailView:
          this.isShowedResetButton = true;
          this.isShowedUploadFiles = true;
          this.isShowedDeleteFiles = false;
          break;
        case WidgetType.DoubleGrid:
        case WidgetType.CountrySelection:
          this.isShowedResetButton = true;
          break;
      }
    }
  }

  private toggleTableControlButtons() {
    this.isShowedEditRowTableButton = this.allowTableEditRow;
    this.isShowedAddNewRowTableButton = this.allowTableAddNewRow;
    this.isShowedDeleteRowTableButton = this.allowTableDeleteRow;
  }

  private toggleTranslationTableControlButtons() {
    this.isShowedAddNewRowTableButton = false;
    this.isShowedDeleteRowTableButton = false;
  }

  private getWidgetGlobalPropertiesFromSetting(callback?) {
    this.globalSettingSer.getAllGlobalSettings().subscribe((data: any) => {
      this.appErrorHandler.executeAction(() => {
        if (!data || !data.length) {
          return;
        }

        this.globalWidgetProperties = this.buildPropertiesFromGlobalSetting(data);

        if (callback) {
          callback();
        }
      });
    });
  }

  private buildPropertiesFromGlobalSetting(data: GlobalSettingModel[]): any[] {
    const propertiesSettingName = this.globalSettingConstant.globalWidgetProperties;

    const propertiesSettings = data.find(x => x.globalName === propertiesSettingName);
    if (!propertiesSettings || !propertiesSettings.idSettingsGlobal) {
      return this.propertyPanelService.createDefaultGlobalSettings();
    }

    const properties = JSON.parse(propertiesSettings.jsonSettings) as GlobalSettingModel[];
    if (!properties || !properties.length) {
      return this.propertyPanelService.createDefaultGlobalSettings();
    }

    return properties;
  }

  private subscribeEditingWidgetsState() {
    this.editingWidgetsStateSubscription = this.editingWidgetsState.subscribe((editingWidgets: Array<any>) => {
      this.appErrorHandler.executeAction(() => {
        this.editingWidgets = editingWidgets;
      });
    });
  }

  private subscribeIsViewModeState() {
    this.isViewModeStateSubscription = this.isViewModeState.subscribe((isViewModeState: boolean) => {
      this.appErrorHandler.executeAction(() => {
        this.isViewMode = isViewModeState;
      });
    });
  }

  private initWidgetFormType(): WidgetFormType[] {
    return [
      new WidgetFormType({
        widgetFormType: WidgetFormTypeEnum.List,
        selected: true,
        label: 'List',
      }),
      new WidgetFormType({
        widgetFormType: WidgetFormTypeEnum.Group,
        selected: false,
        label: 'Group',
      }),
    ];
  }

  private initColumnLayoutSetting() {
    return new ColumnLayoutSetting({
      isFitWidthColumn: false,
      columnLayout: null,
    });
  }

  private initRowSetting() {
    return new RowSetting({
      showTotalRow: false,
    });
  }

  private initFieldArray(data): void {
    this.initAllFields(data.widgetDetail);
    if (!this.fieldFilters || !this.fieldFilters.length) this.updateFilter(data.widgetDetail);
    if (
      this.fieldFilters &&
      this.fieldFilters.length &&
      data.fieldFilters &&
      data.fieldFilters.length &&
      !this.isUpdateOnInitFieldsFilter
    ) {
      this.updateFilterSelectedFileds(data.fieldFilters);
      this.isUpdateOnInitFieldsFilter = true;
    }
  }

  private initBehaviorDataForWidgetProperties() {
    if (!this.widgetProperties || !this.widgetProperties.length || !this.data)
      // || this.data.idRepWidgetType == WidgetType.OrderDataEntry)
      return;
    let isFireEventUpdate = false;
    let temp_isFireEventUpdate = false;

    // init propDisplayFields
    temp_isFireEventUpdate = this.initPropDisplayFields();
    isFireEventUpdate = isFireEventUpdate || temp_isFireEventUpdate;
    // init PropDisplayMode
    temp_isFireEventUpdate = this.initPropDisplayMode();
    isFireEventUpdate = isFireEventUpdate || temp_isFireEventUpdate;

    // init propImportantDisplayFields
    temp_isFireEventUpdate = this.initPropImportantDisplayFields();
    isFireEventUpdate = isFireEventUpdate || temp_isFireEventUpdate;

    // init PropWidgetType
    temp_isFireEventUpdate = this.initPropWidgetType();

    //init HasDocumentType
    temp_isFireEventUpdate = this.initHasDocumentType();

    isFireEventUpdate = isFireEventUpdate || temp_isFireEventUpdate;
    // fire event
    if (isFireEventUpdate || this.isFireEventUpdateOnInit) {
      if (!isEmpty(this.data)) {
        const widgetPropertiesStateModel: WidgetPropertiesStateModel = new WidgetPropertiesStateModel({
          widgetData: this.data,
          widgetProperties: this.widgetProperties,
        });
        this.store.dispatch(this.propertyPanelActions.updateProperties(widgetPropertiesStateModel, this.ofModule));
        this.isFireEventUpdateOnInit = false;
      } else this.isFireEventUpdateOnInit = true;
    }
  }

  private initPropWidgetType(): boolean {
    const propWidgetType: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
      this.widgetProperties,
      'WidgetType',
    );
    if (propWidgetType && (!propWidgetType.options || !propWidgetType.options.length)) {
      propWidgetType.options = [
        {
          key: WidgetFormTypeEnum.List,
          value: 'List',
        },
        {
          key: WidgetFormTypeEnum.Group,
          value: 'Group',
        },
      ];
      propWidgetType.value = this.selectedWidgetFormType;
      return true;
    }
    return false;
  }

  private initPropDisplayMode(): boolean {
    let isFireEventUpdateData = false;
    const isNotWidgetTable =
      this.data &&
      (this.data.idRepWidgetType == WidgetType.FieldSet || this.data.idRepWidgetType == WidgetType.FieldSetReadonly);
    //|| this.data.idRepWidgetType == WidgetType.OrderDataEntry);
    const isWidgetCombination =
      this.data &&
      (this.data.idRepWidgetType == WidgetType.Combination ||
        this.data.idRepWidgetType == WidgetType.CombinationCreditCard);
    const options = [
      {
        key: FilterModeEnum.ShowAll,
        value: 'Show all',
      },
      {
        key: FilterModeEnum.HasData,
        value: 'Only has data',
      },
      {
        key: FilterModeEnum.EmptyData,
        value: 'Only empty data',
      },
    ];

    if (isNotWidgetTable || isWidgetCombination) {
      const propDisplayFields: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
        this.widgetProperties,
        'DisplayField',
      );
      if (propDisplayFields && propDisplayFields.children && propDisplayFields.children.length) {
        const propDisplayMode: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
          propDisplayFields.children,
          'ShowData',
        );
        if (propDisplayMode && (!propDisplayMode.options || !propDisplayMode.options.length)) {
          propDisplayMode.options = options;
          propDisplayMode.value = this.selectedFilter;
          isFireEventUpdateData = true;
        }
      }
    }

    if (!isNotWidgetTable || isWidgetCombination) {
      const propDisplayColumns: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
        this.widgetProperties,
        'DisplayColumn',
      );
      if (propDisplayColumns && propDisplayColumns.children && propDisplayColumns.children.length) {
        const propDisplayMode: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
          propDisplayColumns.children,
          'ShowData',
        );
        if (propDisplayMode && (!propDisplayMode.options || !propDisplayMode.options.length)) {
          propDisplayMode.options = options;
          propDisplayMode.value = !isWidgetCombination ? this.selectedFilter : this.selectedSubFilter;
          isFireEventUpdateData = true;
        }
      }
    }
    return isFireEventUpdateData;
  }

  private initPropDisplayFields(): boolean {
    let isFireEventUpdateData = false;
    const isNotWidgetTable =
      this.data &&
      (this.data.idRepWidgetType == WidgetType.FieldSet || this.data.idRepWidgetType == WidgetType.FieldSetReadonly);
    const isChartWidget = this.data && this.data.idRepWidgetType === WidgetType.Chart;
    //|| this.data.idRepWidgetType == WidgetType.OrderDataEntry);
    const isWidgetCombination =
      this.data &&
      (this.data.idRepWidgetType == WidgetType.Combination ||
        this.data.idRepWidgetType == WidgetType.CombinationCreditCard);
    // init propDisplayFields
    const propDisplayFields: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
      this.widgetProperties,
      'DisplayField',
    );
    const isNotTableWidget = isNotWidgetTable || isWidgetCombination;
    const isReadonlyTable = this.data.idRepWidgetType == WidgetType.DataGrid;
    const hasFilterData = this.fieldFilters && this.fieldFilters.length;
    const hasNoDisplayFieldOptions =
      propDisplayFields && (!propDisplayFields.options || !propDisplayFields.options.length);
    if (
      (isNotTableWidget || isReadonlyTable || this.data.idRepWidgetApp === RepWidgetAppIdEnum.OrderListSummary) &&
      propDisplayFields &&
      hasFilterData &&
      !this.isInitDisplayFields
    ) {
      if (hasNoDisplayFieldOptions) propDisplayFields.options = [];
      this.fieldFilters.forEach(item => {
        if (!item.isTableField) {
          const indexFilteredItem = propDisplayFields.options.findIndex(_item => _item.key === item.fieldName);
          const newItem = {
            key: item.fieldName,
            value: item.fieldDisplayName,
            selected: item.selected,
            isHidden: item.isHidden,
            isEditable: item.isEditable,
          };
          if (indexFilteredItem < 0) propDisplayFields.options.push(newItem);
          else propDisplayFields.options[indexFilteredItem] = newItem;
        }
      });
      isFireEventUpdateData = true;
    }

    // init propDisplayFields
    const propDisplayColumns: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
      this.widgetProperties,
      'DisplayColumn',
    );
    const isFieldSetOrCombinationWidget = !isNotWidgetTable || isWidgetCombination;
    const hasNoDisplayColumnOptions =
      propDisplayColumns && (!propDisplayColumns.options || !propDisplayColumns.options.length);
    if (isFieldSetOrCombinationWidget && propDisplayColumns && hasFilterData && !this.isInitDisplayFields) {
      if (hasNoDisplayColumnOptions) propDisplayColumns.options = [];
      this.fieldFilters.forEach(item => {
        if (item.isTableField || !isWidgetCombination) {
          const indexFilteredItem = propDisplayColumns.options.findIndex(_item => _item.key === item.fieldName);
          const newItem = {
            key: item.fieldName,
            value: item.fieldDisplayName,
            selected: item.selected,
            isHidden: item.isHidden,
            isEditable: item.isEditable,
            isTableField: item.isTableField,
          };
          if (indexFilteredItem < 0) propDisplayColumns.options.push(newItem);
          else propDisplayColumns.options[indexFilteredItem] = newItem;
        }
      });
      isFireEventUpdateData = true;
    }

    if (isChartWidget) {
      if (hasFilterData && !this.isInitDisplayFields) {
        let chartType = this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ChartType');

        this.buildChartSeries(this.widgetProperties, 'SingleXSerie', this.fieldFilters, false);
        this.buildChartSeries(this.widgetProperties, 'SingleYSerie', this.fieldFilters, false);
        this.buildChartSeries(this.widgetProperties, 'MultiXSerie', this.fieldFilters, false);
        this.buildChartSeries(this.widgetProperties, 'MultiYSeries', this.fieldFilters, true);
        this.buildChartSeries(this.widgetProperties, 'ComboSingleXSerie', this.fieldFilters, false);
        this.buildChartSeries(this.widgetProperties, 'ComboSingleYSerie', this.fieldFilters, false);
        this.buildChartSeries(this.widgetProperties, 'ComboMultiXSerie', this.fieldFilters, false);
        this.buildChartSeries(this.widgetProperties, 'ComboMultiYSeries', this.fieldFilters, true);

        switch (chartType.value) {
          case ChartTypeNgx.VerticalBarChart:
          case ChartTypeNgx.HorizontalBarChart:
          case ChartTypeNgx.PieChart:
          case ChartTypeNgx.AdvancedPieChart:
          case ChartTypeNgx.PieGrid:
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'SingleXSerie').visible = true;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'SingleYSerie').visible = true;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'MultiXSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'MultiYSeries').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboSingleXSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboSingleYSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboMultiXSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboMultiYSeries').visible = false;
            break;

          case ChartTypeNgx.GroupedVerticalBarChart:
          case ChartTypeNgx.GroupedHorizontalBarChart:
          case ChartTypeNgx.StackedVerticalBarChart:
          case ChartTypeNgx.StackedHorizontalBarChart:
          case ChartTypeNgx.NormalizedVerticalBarChart:
          case ChartTypeNgx.NormalizedHorizontalBarChart:
          case ChartTypeNgx.LineChart:
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'SingleXSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'SingleYSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'MultiXSerie').visible = true;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'MultiYSeries').visible = true;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboSingleXSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboSingleYSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboMultiXSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboMultiYSeries').visible = false;
            break;

          case ChartTypeNgx.ComboChart:
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'SingleXSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'SingleYSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'MultiXSerie').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'MultiYSeries').visible = false;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboSingleXSerie').visible = true;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboSingleYSerie').visible = true;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboMultiXSerie').visible = true;
            this.propertyPanelService.getItemRecursive(this.widgetProperties, 'ComboMultiYSeries').visible = true;
            break;
        }

        isFireEventUpdateData = true;
      }
    }

    if (isFireEventUpdateData) this.isInitDisplayFields = true;
    return isFireEventUpdateData;
  }

  private buildChartSeries(properties, propName, columns, isMultiCombobox) {
    const prop: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(properties, propName);

    if (prop) {
      prop.options = [];
      columns.forEach(col => {
        let newItem: any;
        if (isMultiCombobox) {
          let isChecked = false;
          let found = prop.value.find(x => x.key == col.fieldName);
          if (found) {
            isChecked = found.$checked;
          }
          newItem = {
            key: col.fieldName,
            value: col.fieldDisplayName,
            $checked: isChecked,
          };
        } else {
          newItem = {
            key: col.fieldDisplayName,
            value: col.fieldDisplayName,
          };
        }

        let visible = false;

        prop.options.push(newItem);
      });
    }
  }

  private initPropImportantDisplayFields(): boolean {
    let isFireEventUpdateData = false;
    const isNotWidgetTable =
      this.data &&
      (this.data.idRepWidgetType == WidgetType.FieldSet || this.data.idRepWidgetType == WidgetType.FieldSetReadonly);
    //|| this.data.idRepWidgetType == WidgetType.OrderDataEntry);
    const isWidgetCombination =
      this.data &&
      (this.data.idRepWidgetType == WidgetType.Combination ||
        this.data.idRepWidgetType == WidgetType.CombinationCreditCard);
    // init propDisplayFields
    const propDisplayFields: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
      this.widgetProperties,
      'ImportantDisplayFields',
    );
    const isNotTableWidget = isNotWidgetTable || isWidgetCombination;
    const hasFilterData = this.fieldFilters && this.fieldFilters.length;
    const isReadonlyTable = this.data.idRepWidgetType == WidgetType.DataGrid;
    const hasNoDisplayFieldOptions =
      propDisplayFields && (!propDisplayFields.options || !propDisplayFields.options.length);
    if (
      (isNotTableWidget || isReadonlyTable || this.data.idRepWidgetApp === RepWidgetAppIdEnum.OrderListSummary) &&
      propDisplayFields &&
      hasFilterData &&
      !this.isInitImportantDisplayFields
    ) {
      if (hasNoDisplayFieldOptions) propDisplayFields.options = [];
      this.fieldFilters.forEach(item => {
        if (!item.isTableField) {
          let index = -1;
          const filteredItem = propDisplayFields.options.find((_item, _index) => {
            if (_item.key === item.fieldName) {
              index = _index;
              return true;
            }
          });
          const newItem = {
            key: item.fieldName,
            value: item.fieldDisplayName,
            selected: index >= 0 ? filteredItem.selected : false,
            isHidden: item.isHidden,
            isEditable: item.isEditable,
          };
          if (index < 0) propDisplayFields.options.push(newItem);
          else propDisplayFields.options[index] = newItem;
        }
      });
      isFireEventUpdateData = true;
      this.isInitImportantDisplayFields = true;
    }
    return isFireEventUpdateData;
  }

  private initHasDocumentType(): boolean {
    const prop: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
      this.widgetProperties,
      'HasDocumentType',
    );
    if (prop && (!prop.options || !prop.options.length)) {
      prop.options = [
        {
          key: 0,
          value: 'All',
        },
        {
          key: RepProcessingTypeEnum.Offer,
          value: 'Offer',
        },
        {
          key: RepProcessingTypeEnum.Order,
          value: 'Order',
        },
        {
          key: RepProcessingTypeEnum.Invoice,
          value: 'Invoice',
        },
      ];
      prop.value = 0;
      return true;
    }
    return false;
  }

  updateFilter(widgetDetail: WidgetDetail) {
    if (!this.fieldFilters || (this.fieldFilters && this.fieldFilters.length == 0)) {
      this.fieldFilters = [];
      this.fieldFilters = cloneDeep(this.buildCollectionFieldFilter(widgetDetail, false));
    }
  }

  /**
   * Handle for special cases such as Customer History
   * @param headerCols
   */
  manualAddFieldFilters(headerCols: Array<any>) {
    if (!this.fieldFilters || (this.fieldFilters && this.fieldFilters.length == 0)) {
      this.fieldFilters = [];
      this.fieldFilters = headerCols.map(x => {
        let isHidden: boolean;
        if (x.setting) {
          const setting = uti.Uti.getCloumnSettings(x.setting);
          isHidden =
            setting.DisplayField && setting.DisplayField.Hidden && parseInt(setting.DisplayField.Hidden, 10) > 0;
        }
        return new FieldFilter({
          fieldName: x.fieldName,
          fieldDisplayName: x.fieldDisplayName,
          selected: true,
          isHidden: isHidden || false,
        });
      });
      this._copiedFieldFilter = cloneDeep(this.fieldFilters);

      // Sync to display in property panel
      const propDisplayColumns: WidgetPropertyModel = this.propertyPanelService.getItemRecursive(
        this.widgetProperties,
        'DisplayColumn',
      );
      const hasNoDisplayColumnOptions =
        propDisplayColumns && (!propDisplayColumns.options || !propDisplayColumns.options.length);

      if (propDisplayColumns) {
        if (hasNoDisplayColumnOptions) propDisplayColumns.options = [];
        this.fieldFilters.forEach(item => {
          const indexFilteredItem = propDisplayColumns.options.findIndex(_item => _item.key === item.fieldName);
          if (indexFilteredItem < 0) {
            const newItem = {
              key: item.fieldName,
              value: item.fieldDisplayName,
              selected: item.selected,
              isHidden: item.isHidden,
              isEditable: item.isEditable,
              isTableField: item.isTableField,
            };
            propDisplayColumns.options.push(newItem);
          }
        });

        const widgetPropertiesStateModel: WidgetPropertiesStateModel = new WidgetPropertiesStateModel({
          widgetData: this.data,
          widgetProperties: this.widgetProperties,
        });
        if (this.data.idRepWidgetType === WidgetType.OrderDataEntry) {
          this.updateFilterSelectedFileds(this._data.fieldFilters);
          this._copiedFieldFilter = cloneDeep(this.fieldFilters);
        }
        this.store.dispatch(this.propertyPanelActions.updateProperties(widgetPropertiesStateModel, this.ofModule));
      }
    }
  }

  updateFilterSelectedFileds(sourceFieldsFilter: FieldFilter[]) {
    if (sourceFieldsFilter && sourceFieldsFilter.length) {
      sourceFieldsFilter.forEach(item => {
        const index = this.fieldFilters.findIndex(_item => _item.fieldName === item.fieldName);
        if (index >= 0) this.fieldFilters[index].selected = item.selected;
      });
    }
  }

  initAllFields(widgetDetail: WidgetDetail) {
    if (!this.allFields || !this.allFields.length) {
      this.allFields = this.buildCollectionFieldFilter(widgetDetail, true);
    }
  }

  private buildCollectionFieldFilter(widgetDetail: WidgetDetail, isAllField?: boolean) {
    const result: Array<any> = [];
    if (
      widgetDetail &&
      (widgetDetail.idRepWidgetType == WidgetType.FieldSet ||
        widgetDetail.idRepWidgetType == WidgetType.FieldSetReadonly ||
        widgetDetail.idRepWidgetType == WidgetType.Combination ||
        widgetDetail.idRepWidgetType == WidgetType.FileExplorer ||
        widgetDetail.idRepWidgetType == WidgetType.ToolFileTemplate ||
        widgetDetail.idRepWidgetType == WidgetType.FileExplorerWithLabel ||
        widgetDetail.idRepWidgetType == WidgetType.CombinationCreditCard)
    ) {
      //|| widgetDetail.idRepWidgetType == WidgetType.OrderDataEntry)) {
      if (widgetDetail.contentDetail && widgetDetail.contentDetail.data && widgetDetail.contentDetail.data.length > 0) {
        const widgetInfo = widgetDetail.contentDetail.data;
        if (!widgetInfo[1]) return;
        const contentList: Array<any> = widgetInfo[1];
        contentList.forEach(content => {
          const _item = this.buildFieldFilterByDataSet(content);
          if (!isNil(isAllField) && isAllField) _item.selected = true;
          result.push(_item);
        });
      }

      if (widgetDetail.idRepWidgetType == WidgetType.Combination) {
        const contentDetail = widgetDetail.contentDetail;
        if (contentDetail && contentDetail.data[2][0].columnSettings) {
          const widgetSetting = contentDetail.data[2][0].columnSettings;
          const keys = Object.keys(widgetSetting);
          keys.forEach(key => {
            const _item = this.buildFieldFilterByDataTable(widgetSetting[key], true, true);
            if (!isNil(isAllField) && isAllField) _item.selected = true;
            result.push(_item);
          });
        }
      }
    } else if (widgetDetail.idRepWidgetType == WidgetType.DocumentProcessing) {
      if (widgetDetail.contentDetail && widgetDetail.contentDetail.data && widgetDetail.contentDetail.data.length > 0) {
        let dataSource = widgetDetail.contentDetail.data;
        let generalDataSource: any;
        let invoiceDataSource: any;
        let orderDataSource: any;
        let offerDataSource: any;

        const generalDataSourceIndex = 1;
        const invoiceDataSourceIndex = 3;
        const orderDataSourceIndex = 5;
        const offerDataSourceIndex = 7;

        if (dataSource[generalDataSourceIndex]) {
          generalDataSource = dataSource[generalDataSourceIndex];
        }
        if (dataSource[invoiceDataSourceIndex]) {
          invoiceDataSource = dataSource[invoiceDataSourceIndex];
        }
        if (dataSource[orderDataSourceIndex]) {
          orderDataSource = dataSource[orderDataSourceIndex];
        }
        if (dataSource[offerDataSourceIndex]) {
          offerDataSource = dataSource[offerDataSourceIndex];
        }
        this.groupFieldFilters = [];
        if (generalDataSource) {
          this.buildGroupFieldFilter(generalDataSource, 'General Information', isAllField, true);
        }
        if (invoiceDataSource) {
          this.buildGroupFieldFilter(invoiceDataSource, 'Invoice', isAllField, false);
        }
        if (orderDataSource) {
          this.buildGroupFieldFilter(orderDataSource, 'Order', isAllField, false);
        }
        if (offerDataSource) {
          this.buildGroupFieldFilter(offerDataSource, 'Offer', isAllField, false);
        }
      }
    } else {
      let widgetDetailData;
      if (widgetDetail.contentDetail) {
        if (widgetDetail.contentDetail.columnSettings) {
          widgetDetailData = { ...widgetDetail };
        } else if (widgetDetail.contentDetail.data) {
          widgetDetailData = {
            ...widgetDetail,
            contentDetail: this.datatableService.formatDataTableFromRawData(widgetDetail.contentDetail.data),
          };
        }
      }

      if (widgetDetailData && widgetDetailData.contentDetail && widgetDetailData.contentDetail.columnSettings) {
        const widgetSetting = widgetDetailData.contentDetail.columnSettings;
        const keys = Object.keys(widgetSetting);
        const isEditable = widgetDetailData.idRepWidgetType == WidgetType.Chart;
        keys.forEach(key => {
          const _item = this.buildFieldFilterByDataTable(widgetSetting[key], isEditable, false);
          if (!isNil(isAllField) && isAllField) _item.selected = true;
          result.push(_item);
        });
      }
    }
    return result;
  }

  private buildGroupFieldFilter(contentList, name, isAllField, hasDivider) {
    let result: Array<any> = [];
    contentList.forEach(content => {
      let item = this.buildFieldFilterByDataSet(content);
      if (!isNil(isAllField) && isAllField) item.selected = true;
      result.push(item);
    });
    this.groupFieldFilters.push(
      new GroupFieldFilter({
        name: name,
        hasDivider: hasDivider,
        fieldFilters: result,
        isSelectedAllField: true,
      }),
    );
  }

  private buildFieldFilterByDataSet(content: any): FieldFilter {
    let isHidden = false;
    if (content.Setting && content.Setting.length) {
      const settingArray: any = JSON.parse(content.Setting);
      const setting = uti.Uti.getCloumnSettings(settingArray);
      isHidden = setting.DisplayField && setting.DisplayField.Hidden && parseInt(setting.DisplayField.Hidden, 10) > 0;
    }
    return new FieldFilter({
      fieldName: content.OriginalColumnName,
      fieldDisplayName: content.ColumnName,
      selected: true,
      isHidden: isHidden,
      isEditable: true,
      isTableField: false,
    });
  }

  private buildFieldFilterByDataTable(setting: any, isEditableTable?: boolean, isTableField?: boolean): FieldFilter {
    let isHidden = false;
    let isEditable = true;
    if (setting.Setting && setting.Setting.length) {
      const _setting = uti.Uti.getCloumnSettings(setting.Setting);
      // should not show in filter field
      // in case of a required/combo-box type field in ediable table
      if (
        isEditableTable &&
        ((_setting.Validation && _setting.Validation.IsRequired) ||
          (_setting.ControlType && _setting.ControlType.Type.toLowerCase() == ControlType.ComboBox))
      ) {
        isEditable = false;
      }
      isHidden =
        _setting.DisplayField && _setting.DisplayField.Hidden && parseInt(_setting.DisplayField.Hidden, 10) > 0;
    }
    return new FieldFilter({
      fieldName: setting.OriginalColumnName,
      fieldDisplayName: setting.ColumnHeader,
      selected: true,
      isHidden: isHidden,
      isEditable: isEditable,
      isTableField: isTableField,
    });
  }

  changeDisplayMode(evt) {
    const value = evt.value;
    const isSub = evt.isSub;
    const key: string = FilterModeEnum[<string>value];
    if (!isSub) this.selectedFilter = <FilterModeEnum>FilterModeEnum[key];
    else this.selectedSubFilter = <FilterModeEnum>FilterModeEnum[key];
    if (!isSub) this.editSelectedDisplayModeItem(this.filterModes, value);
    else this.editSelectedDisplayModeItem(this.subFilterModes, value);
    if (value === FilterModeEnum.ShowAllWithoutFilter + '') {
      this.onChangeDisplayMode.emit({
        selectedFilter: !isSub ? this.selectedFilter : this.selectedSubFilter,
        fieldFilters: this.allFields,
        isSub: isSub,
      });
      return;
    }
    this.updateFilter(this.data);
    this.onChangeDisplayMode.emit({
      selectedFilter: !isSub ? this.selectedFilter : this.selectedSubFilter,
      fieldFilters: this._copiedFieldFilter,
      isSub: isSub,
    });
  }

  private editSelectedDisplayModeItem(filterModes: FilterMode[], value: any) {
    // remove current selected
    let selectedDisplayModeItem = filterModes.find(item => item.selected);
    if (selectedDisplayModeItem) selectedDisplayModeItem.selected = false;

    // apply new selected
    selectedDisplayModeItem = filterModes.find(item => item.mode + '' === value);
    if (selectedDisplayModeItem) selectedDisplayModeItem.selected = true;
  }

  changeFieldFilter(evt: FilterData) {
    this._copiedFieldFilter.forEach(item => {
      const _item = (evt.fieldFilters as FieldFilter[]).find(c => c.fieldName == item.fieldName);
      if (_item) item.selected = _item.selected;
    });
    this.fieldFilters = cloneDeep(this._copiedFieldFilter);
    this.hideMenuWidgetStatus();
    this.onChangeFieldFilter.emit(evt);
  }

  removeWidget(): void {
    this.onRemoveWidget.emit(true);
  }

  saveFormWidget(): void {
    if (this.data.idRepWidgetType == WidgetType.Combination) this.onSaveWidget.emit(SavingWidgetType.Combination);
    else if (this.data.idRepWidgetType == WidgetType.CombinationCreditCard)
      this.onSaveWidget.emit(SavingWidgetType.CombinationCreditCard);
    else this.onSaveWidget.emit(SavingWidgetType.Form);
  }

  saveEditableTableWidget(): void {
    if (this.data.idRepWidgetType == WidgetType.Combination) this.onSaveWidget.emit(SavingWidgetType.Combination);
    else this.onSaveWidget.emit(SavingWidgetType.EditableTable);
  }

  saveCountryWidget(): void {
    this.onSaveWidget.emit(SavingWidgetType.Country);
  }

  resetWidget(): void {
    if (!this.showToolButtons) {
      this.showToolButtons = true;
    }

    this.toggleEditTemplateMode(false);

    this.isShowToolButtonsWihoutClick = false;
    this.onResetWidget.emit(true);
    this.settings_Class_ShowToolButtons();
  }

  public treeViewExpandAll(isExpand: boolean) {
    this.onTreeViewExpandWidget.emit(isExpand);
  }

  public saveTreeViewWidget(): void {
    this.onSaveWidget.emit(SavingWidgetType.TreeView);
  }

  deleteRowEditableTable(): void {
    this.onEditWidget.emit(EditWidgetTypeEnum.EditableDeleteRow);
  }

  addRowEditableTable(): void {
    if (this.toolbarFilterValue) {
      this.toolbarFilterValue = '';
      this.onFilterValueChanged();
    }
    this.onEditWidget.emit(EditWidgetTypeEnum.EditableAddNewRow);
  }

  manageAddRowTableButtonStatus(isDisable: boolean): void {
    this.isDisableAddRowTableButton = isDisable;
  }

  manageDeleteRowTableButtonStatus(isDisable: boolean): void {
    this.isDisableDeleteRowTableButton = isDisable;
  }

  manageSaveTableButtonStatus(isDisable: boolean): void {
    this.isDisableSaveTableButton = isDisable;
  }

  public toggled(open: boolean): void {}

  public toggledTable(open: boolean): void {}

  public onclickDDMainMenu(event) {
    setTimeout(() => {
      this.currentToggleElement = $(event.target).closest('a.dropdown-toggle');
      const topParent = $(this._eref.nativeElement).closest('div.widget-module-info-container, div.widget-edit-dialog');
      if (topParent) this.position = { parent: topParent, toggleElement: this.currentToggleElement };
    });
  }

  public onclickDDSubMenu(event) {
    setTimeout(() => {
      this.currentToggleElement = $(event.target).closest('a.dropdown-toggle');
      const topParent = $(this._eref.nativeElement).closest('div.widget-module-info-container, div.widget-edit-dialog');
      if (topParent) this.position = { parent: topParent, toggleElement: this.currentToggleElement };
    });
  }

  public toggleEditDropdown(isShow, widgetType?: EditWidgetTypeEnum) {
    this.isOpeningEditDropdown = isShow;
    setTimeout(() => {
      switch (widgetType) {
        case EditWidgetTypeEnum.Form:
          if (this.editFormDropdown) {
            isShow ? this.editFormDropdown.show() : this.editFormDropdown.hide();
          }
          break;

        case EditWidgetTypeEnum.Table:
          if (this.editTableDropdown) {
            isShow ? this.editTableDropdown.show() : this.editTableDropdown.hide();
          }
          break;

        case EditWidgetTypeEnum.Country:
          if (this.editCountryDropdown) {
            isShow ? this.editCountryDropdown.show() : this.editCountryDropdown.hide();
          }
          break;

        case EditWidgetTypeEnum.TreeView:
          if (this.editTreeviewDropdown) {
            isShow ? this.editTreeviewDropdown.show() : this.editTreeviewDropdown.hide();
          }
          break;
      }
    });
  }

  private initOwnerForMenuWidgetStatus() {
    if (this.menuWidgetStatus1 && !this.menuWidgetStatus1.owner)
      this.menuWidgetStatus1.owner = $('#btnMenuWidgetStatus1' + this.randomNumb, $(this._eref.nativeElement)).get(0);

    if (this.menuWidgetStatus2 && !this.menuWidgetStatus2.owner)
      this.menuWidgetStatus2.owner = $('#btnMenuWidgetStatus2' + this.randomNumb, $(this._eref.nativeElement)).get(0);

    if (this.menuWidgetStatus3 && !this.menuWidgetStatus3.owner)
      this.menuWidgetStatus3.owner = $('#btnMenuWidgetStatus3' + this.randomNumb, $(this._eref.nativeElement)).get(0);

    if (this.editFormDropdown && !this.editFormDropdown.owner) {
      this.editFormDropdown.owner = $('#btnEditFormDropdown' + this.randomNumb, $(this._eref.nativeElement)).get(0);
      this.editFormDropdown.addEventListener(
        this.editFormDropdown.hostElement,
        'mouseleave',
        event => this.manageEditFormDropdown(event, true, 'form'),
        null,
      );
    }

    if (this.editTableDropdown && !this.editTableDropdown.owner) {
      this.editTableDropdown.owner = $('#btnEditTableDropdown' + this.randomNumb, $(this._eref.nativeElement)).get(0);
      this.editTableDropdown.addEventListener(
        this.editTableDropdown.hostElement,
        'mouseleave',
        event => this.manageEditFormDropdown(event, true, 'table'),
        null,
      );
    }

    if (this.editCountryDropdown && !this.editCountryDropdown.owner) {
      this.editCountryDropdown.owner = $('#btnEditCountryDropdown' + this.randomNumb, $(this._eref.nativeElement)).get(
        0,
      );
      this.editCountryDropdown.addEventListener(
        this.editCountryDropdown.hostElement,
        'mouseleave',
        event => this.manageEditFormDropdown(event, true, 'country'),
        null,
      );
    }

    if (this.editTreeviewDropdown && !this.editTreeviewDropdown.owner) {
      this.editTreeviewDropdown.owner = $(
        '#btnEditTreeviewDropdown' + this.randomNumb,
        $(this._eref.nativeElement),
      ).get(0);
      this.editTreeviewDropdown.addEventListener(
        this.editTreeviewDropdown.hostElement,
        'mouseleave',
        event => this.manageEditFormDropdown(event, true, 'treeview'),
        null,
      );
    }
  }
  private isCloseDDMenuFromInside = false;
  public hideMenuWidgetStatus() {
    if (this.menuWidgetStatus1 && this.menuWidgetStatus1.isVisible) this.menuWidgetStatus1.hide();

    if (this.menuWidgetStatus2 && this.menuWidgetStatus2.isVisible) this.menuWidgetStatus2.hide();

    if (this.menuWidgetStatus3 && this.menuWidgetStatus3.isVisible) this.menuWidgetStatus3.hide();

    this.isCloseDDMenuFromInside = true;
  }

  public wjPopupHidden(event, menuWidgetStatus) {
    // hide all opening sub menu
    if (menuWidgetStatus) {
      $('.sub-menu.filter-menu .sub-menu', menuWidgetStatus.hostElement).hide();
    }
    if (this.isCloseDDMenuFromInside) {
      this.isCloseDDMenuFromInside = false;
      return;
    }
    const container = $(this._eref.nativeElement).closest('div.box-default');
    if (
      container.hasClass('edit-mode') ||
      container.hasClass('edit-table-mode') ||
      container.hasClass('edit-country-mode') ||
      container.hasClass('edit-field-mode') ||
      container.hasClass('edit-form-mode')
    )
      return;
    setTimeout(() => {
      if (container.hasClass('click')) container.removeClass('click');
      else this.onCursorFocusOutOfMenu.emit(true);
    }, 500);
  }

  /**
   * onChangeWidgetFormType
   */
  changeWidgetFormType($event: WidgetFormTypeEnum) {
    this.onChangeWidgetFormType.emit($event);
  }

  /**
   * changeColumnLayoutsetting
   */
  changeColumnLayoutsetting($event: ColumnLayoutSetting) {
    this.onChangeColumnLayoutsetting.emit($event);
  }

  changeRowSetting($event: RowSetting) {
    this.onChangeRowSetting.emit($event);
  }

  changeODEProperties($event: any) {
    this.onChangeODEProperties.emit($event);
  }

  public saveFileExplorerWidget() {
    let savingWidgetType = SavingWidgetType.FileExplorer;
    switch (this.data.idRepWidgetType) {
      case WidgetType.FileTemplate:
        savingWidgetType = SavingWidgetType.FileTemplate;
        break;
    }

    this.onSaveWidget.emit(savingWidgetType);
  }

  public onPropertiesItemClickHandler(eventData) {
    this.onPropertiesItemClick.emit(eventData);
    this.hideMenuWidgetStatus();
  }

  public clickUploadFiles(event) {
    this.onClickUploadFiles.emit();
  }

  public clickDeleteFiles() {
    this.onClickDeleteFiles.emit();
  }

  /**
   * openTranslateWidget
   * @param mode
   */
  public openTranslateWidget(mode) {
    this.onOpenTranslateWidget.emit({
      mode: mode,
    });
  }

  /**
   * openArticleTranslate
   */
  public openArticleTranslate() {
    this.onOpenArticleTranslate.emit(true);
  }

  public editWidgetInline(widgetType: EditWidgetTypeEnum) {
    this.toggleEditDropdown(false, widgetType);
    this.getWidgetTemplateCombobox();
    this.onEditWidget.emit(widgetType);
  }

  public manageEditFormDropdown(event, isCheckToElement, widgetType) {
    if (!this.isOpeningEditDropdown) return;

    let isRemoveHoverClass = true;
    if (isCheckToElement) {
      let parentElm;
      if (event.toElement) {
        parentElm = this.domHandler.findParent(event.toElement, 'edit-dropdown, div.edit-widget');
      } else if (event.relatedTarget) {
        parentElm = this.domHandler.findParent(event.relatedTarget, 'edit-dropdown, div.edit-widget');
      }

      if (parentElm && parentElm.length) {
        isRemoveHoverClass = false;
      }
    }
    if (isRemoveHoverClass) this.toggleEditDropdown(false, widgetType);
    this.isOpeningEditDropdown = !isRemoveHoverClass;
  }

  public editWidgetInPopup(widgetType: EditWidgetTypeEnum) {
    this.toggleEditDropdown(false, widgetType);
    // TODO: open popup for editing widget
    this.onEditWidget.emit(EditWidgetTypeEnum.InPopup);
  }

  /**
   * printWidget
   */
  public printWidget(): void {
    this.onPrintWidget.emit(true);
  }

  public togleToolButtonWithoutEmit(isShow: boolean) {
    this.showToolButtons = isShow;
    this.settings_Class_ShowToolButtons();
    this.allCountryCheckboxModel.forAllCountryCheckbox = false;
    if (!this.showToolButtons) {
      this.toolbarFilterValue = '';
      this.onFilterValueChanged();
    }

    if (!isShow) {
      this.toggleEditTemplateMode(false);
    }
  }

  public toggleToolButtons(isShow: boolean) {
    this.togleToolButtonWithoutEmit(isShow);
    this.toggleTableControlButtons();
    this.onToolbarButtonsToggle.emit(this.showToolButtons || this.showInDialog || this.isShowToolButtonsWihoutClick);
  }

  public toggleToolButtonsWithoutClick(isShow: boolean) {
    if (!this.isEditTemplateMode) {
      this.isShowToolButtonsWihoutClick = isShow;

      if (this.isEditTemplateMode) {
        this.toggleEditTemplateMode(false);
      }
      this.settings_Class_ShowToolButtons();
      this.onToolbarButtonsToggle.emit(this.showToolButtons || this.showInDialog || this.isShowToolButtonsWihoutClick);
    }
  }

  public onFilterValueChanged() {
    this.onToolbarFilterValueChanged.emit(this.toolbarFilterValue);
  }

  public onColumnsLayoutSettingsChanged() {
    if (this.filterMenuForTable) this.filterMenuForTable.onColumnsLayoutSettingsChanged();
  }

  public handleSubMenu($event, isShowFirstMenu, isShowSecondMenu) {
    if ($event.fromElement.tagName == 'LI') {
      const currentMenuEle = $($event.target);
      const currentMenuEleWidth = currentMenuEle.width();
      const screenWidth = screen.width;
      const mousePositionX = $event.screenX;
      const eleContainterWidth = $event.target.offsetParent.clientWidth;
      const eleOffsetLeft = $event.target.offsetLeft;

      if (currentMenuEleWidth + mousePositionX > screenWidth && $event.fromElement.children[1] !== undefined) {
        $event.fromElement.children[1].style.left = -(eleContainterWidth + eleOffsetLeft * 2) + 'px';
      }
    }

    this.showFirstCombinationMenu = isShowFirstMenu;
    this.showSecondCombinationMenu = isShowSecondMenu;
  }

  public openFieldTranslateWidget() {
    this.onOpenFieldTranslateWidget.emit();
  }

  public onClickCellMoveBtn($event) {
    this.isCellMoveForward = !this.isCellMoveForward;

    this.onCellDirectionChanged.emit(this.isCellMoveForward);
  }

  /**
   * settingMenuChanged
   * @param $event
   */
  public settingMenuChanged($event) {
    this.settingChanged = $event;
  }

  private getWidgetTemplateCombobox() {
    if (!this.data) {
      return;
    }

    let comboboxName: string,
      extraData: string = this.listenKeyRequestItem ? this.listenKeyRequestItem.value : null;
    switch (this.data.idRepWidgetApp) {
      case 111:
        comboboxName = 'salesCampaignAddOn_Mailing';
        break;
      case 112:
        comboboxName = 'salesCampaignAddOn_Product';
        break;
      case 113:
        comboboxName = 'salesCampaignAddOn_Global';
        break;
      case 114:
        comboboxName = 'salesCampaignAddOn_ShippingCosts';
        break;
      case 126:
        comboboxName = 'salesCampaignAddOn_PrinterControl';
        break;
    }

    if (comboboxName) {
      this.commonService.getListComboBox(comboboxName, extraData, true).subscribe((response: ApiResultResponse) => {
        this.appErrorHandler.executeAction(() => {
          if (!Uti.isResquestSuccess(response) || !response.item[comboboxName]) {
            return;
          }
          this.widgetTemplates = [];
          let widgetTemplates = response.item[comboboxName] || [];

          widgetTemplates = widgetTemplates.map(item => {
            return {
              ...item,
              editing: this.isEditTemplateMode,
            };
          });
          this.widgetTemplates = widgetTemplates;
        });
      });
    }
  }

  public editTemplateCheckboxChanged() {}

  public templateComboboxChanged(templateCombo: any) {
    if (!this.templateComboFocused) {
      if (templateCombo.selectedIndex !== -1) {
        templateCombo.selectedIndex = -1;
      }

      return;
    }

    if (templateCombo && templateCombo.selectedItem) {
      if (!this.ignoreOnChangedEmitter) {
        this.onChangeWidgetTemplate.emit(this.selectedTemplate.idValue);
      }
    }

    this.templateComboFocused = false;
    this.ignoreOnChangedEmitter = false;
  }

  public openAddWidgetTemplateDialog() {
    this.showDialogAddWidgetTemplate = true;

    setTimeout(() => {
      if (this.dialogAddWidgetTemplate) {
        this.dialogAddWidgetTemplate.open();
      }
    }, 50);
  }

  public onSaveWidgetTemplateDialog(templateName: string) {
    this.showDialogAddWidgetTemplate = false;

    if (this.widgetTemplates.length) {
      let existingNewItem = this.widgetTemplates.find(x => x.idValue == -1);
      if (existingNewItem) {
        existingNewItem.textValue = templateName;
        existingNewItem.editing = this.isEditTemplateMode;
      } else {
        this.widgetTemplates.push({
          idValue: -1,
          textValue: templateName,
          editing: this.isEditTemplateMode,
        });
      }
    } else {
      this.widgetTemplates.push({
        idValue: -1,
        textValue: templateName,
        editing: this.isEditTemplateMode,
      });
    }

    this.templateCombo.refresh();
    this.templateComboFocused = true;
    this.ignoreOnChangedEmitter = true;
    this.templateCombo.selectedIndex = this.widgetTemplates.length - 1;

    this.onAddWidgetTemplate.emit();
  }

  public onCloseWidgetTemplateDialog() {
    this.showDialogAddWidgetTemplate = false;
  }

  public toggleEditTemplateMode(isEditMode: boolean) {
    this.isShowToolButtonsWihoutClick = false;
    this.isEditTemplateMode = isEditMode;
    this.settings_Class_EditTemplateMode();
    this.settings_Class_ShowToolButtons();
    if (isEditMode) {
      this.editWidgetInline(EditWidgetTypeEnum.Table);
      this.onAddWidgetTemplate.emit();
    } else {
      this.widgetTemplates = [];
      this.showDialogAddWidgetTemplate = false;
      this.selectedTemplate = null;
    }
  }

  public refreshWidget() {
    this.onRefresh.emit();
  }

  // #region [Access Right]

  public getAccessRight(commandName: string) {
    if (this.accessRight && this.accessRight['orderDataEntry']) return true;
    return this.accessRight[commandName];
  }

  public getAccessRightForCommandButton(buttonName: string) {
    if (this.accessRight && this.accessRight['orderDataEntry']) return true;

    if (!this.accessRight || !this.accessRight[AccessRightWidgetCommandButtonEnum[buttonName]]) return false;

    return this.accessRight[AccessRightWidgetCommandButtonEnum[buttonName]]['read'];
  }

  // #endregion [Access Right]

  /** User Role  */
  public openUserRoleDialog() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(DialogUserRoleComponent);
    var componentRef: ComponentRef<DialogUserRoleComponent> = this.containerRef.createComponent(factory);
    const dialogUserRoleComponent: DialogUserRoleComponent = componentRef.instance;
    dialogUserRoleComponent.selectedUsers = this.selectedNodes;
    dialogUserRoleComponent.open(
      () => {
        componentRef.destroy();
      },
      () => {
        this.onSuccessRoleSaved.emit(this.selectedNodes);
      },
    );
  }

  /**
   * Next group for doublette widget
   * @param number
   */
  public nextDoubletteGroup(number) {
    this.onNextDoubletteGroup.emit(number);
    this.groupNumberChange.emit(this.groupNumber);
  }

  //#region New code
  private _settings: WidgetMenuStatusModel = new WidgetMenuStatusModel();
  @Input() set settings(settings: WidgetMenuStatusModel) {
    this._settings = settings;
  }
  get settings() {
    return this._settings;
  }

  private settings_Class_ShowToolButtons() {
    this.settings.class.showToolButtons =
      this.showToolButtons || this.showInDialog || this.isShowToolButtonsWihoutClick;
    this.settings.class.visibilityHidden = this.showToolButtons || this.isShowToolButtonsWihoutClick;
  }

  private settings_Class_EditTemplateMode() {
    this.settings.class.editTemplateMode = this.isEditTemplateMode;
  }
  //#endregion

  //#region Folder management

  private subscribeIsSelectFolder() {
    this.subscribeIsSelectInFolderManagement = this.dispatcher
      .pipe(
        filter((action: CustomAction) => {
          return action.type === FileManagerActions.SELECT_ITEM && action.payload.id === this.data.id;
        })
      )
      .subscribe((action: CustomAction) => {
        this.itemSelectedInFolderManagement = action.payload.item;
        this.isSelectFolder = action.payload.isSelectFolder;
      });
  }

  public clickFolderManagerAction(actionType: any) {
    if (actionType === 1) {
      this.isFileExplorerDetailView = true;
    } else if (actionType === 2) {
      this.isFileExplorerDetailView = false;
    }
    this.store.dispatch(
      this.folderManagementAction.clickButton({
        actionType,
        id: this.data.id,
      }),
    );
  }

  //#endregion

  public saveTableSetting() {
    this.filterMenuForTable.applyFilter();
  }
}
