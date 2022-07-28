import {
    Component, OnInit, Input, Output, OnChanges, SimpleChanges,
    EventEmitter, ViewChild, OnDestroy, ElementRef, Injectable, ViewChildren, QueryList
} from '@angular/core';
import { Router } from '@angular/router';
import * as wjcGrid from 'wijmo/wijmo.grid';
import { NgGrid, NgGridItem, NgGridConfig, NgGridItemConfig, NgGridItemEvent } from '@app/shared/components/grid-stack';
import {
    WidgetDetail,
    IListenKeyConfig,
    WidgetPropertyModel,
    FilterData,
    IDragDropCommunicationData,
    VersionPropertiesModel, LayoutPageInfoModel,
    WidgetType, WidgetKeyType, WidgetState, Module
} from '@app/models';

import {
    AppErrorHandler,
    ModalService,
    PropertyPanelService,
    ObservableShareService,
    AccessRightsService,
} from '@app/services';
import { WidgetUtils } from '../../utils';
import { WidgetTemplateSettingService } from '@app/services';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { WidgetDetailActions, XnCommonActions } from '@app/state-management/store/actions';
import { ICommunicationWidget, IWidgetInfo } from '../../components/widget-communication-dialog';
import cloneDeep from 'lodash-es/cloneDeep';
import uniqBy from 'lodash-es/uniqBy';
import { BaseComponent } from '@app/pages/private/base';
import { WidgetModuleComponent } from '../../components/widget-info';
import { Observable, Subscription } from 'rxjs';
import { Uti } from '@app/utilities';

/**
 * WidgetBox
 */
export class WidgetBox {
    id?: string;
    config?: NgGridItemConfig;
    //data?: WidgetDetail;
    widgetStates?: Array<WidgetState>;
    filterData?: FilterData;
    properties?: VersionPropertiesModel;
    columnsLayoutSettings?: any;
    isDeleted?: boolean;

    // Change position or resize width/height
    isDirty?: boolean;

    // Indicator Handler
    delayPromise?: number | any;
    isLoading?: any;
    promiseList?: Array<Promise<any> | Subscription>;
    payload: any;

    // Get selected data
    public get data() {
        if (this.widgetStates && this.widgetStates.length) {
            const selectedState = this.widgetStates.find(p => p.selected);
            if (selectedState) {
                return selectedState.data;
            }
        }
        return new WidgetDetail();
    }

    // Set selected data
    public set data(data) {
        if (this.widgetStates && this.widgetStates.length) {
            const selectedState = this.widgetStates.find(p => p.selected);
            if (selectedState) {
                selectedState.data = data;
            }
        }
    }

    public constructor(init?: Partial<WidgetBox>) {
        Object.assign(this, init);
    }
}

/**
 * IPromiseTrackerOptions
 */
interface IPromiseTrackerOptions {
    minDuration: number;
    delay: number;
}

/**
 * BaseWidgetContainer
 */
@Injectable()
export abstract class BaseWidgetContainer extends BaseComponent {

    @Input() currentModule: Module;
    @Input() filterWidgetIds: Array<string>;

    @ViewChildren(WidgetModuleComponent)
    public widgetModuleComponents: QueryList<WidgetModuleComponent>;

    @Input() pageId: string;
    @Input() tabID: string;

    private subscriptionArray: Array<Subscription> = [];

    private iPromiseTrackerOptions: IPromiseTrackerOptions = null;

    public isViewInitialized: boolean = false;

    // Collection of widgets
    protected widgetBoxes: Array<WidgetBox> = [];
    protected moduleName = '';
    // Display related widget dialog
    public displayConnectedWidgetDialog = false;
    // Communication Widget Info
    public communicationWidgetInfo: ICommunicationWidget;

    // Grid config 
    public gridConfig: NgGridConfig = <NgGridConfig>{
        'margins': [5],
        'draggable': false,
        'resizable': false,
        'max_cols': 0,
        'max_rows': 0,
        'visible_cols': 0,
        'visible_rows': 0,
        'min_cols': 1,
        'min_rows': 1,
        'col_width': 1,
        'row_height': 1,
        'cascade': 'up-left',
        'min_width': 2,
        'min_height': 2,
        'fix_to_grid': false,
        'auto_style': true,
        'auto_resize': false,
        'maintain_ratio': false,
        'prefer_new': false,
        'zoom_on_drag': false,
        'limit_to_screen': true
    };

    /**
     * widgetBoxesView
     */
    public get widgetBoxesView(): Array<WidgetBox> {
        return this.widgetBoxes.filter(p => !p.isDeleted);
    }

    protected widgetListenKey = '';

    protected layoutPageInfo: LayoutPageInfoModel[];

    // Check if there is any resizing/dragging widget
    // Set True in following cases:
    // + Resize Widget
    // + Drag Widget
    // + Add new Widget
    // + Remove Widget
    // + Resize Splitter
    // Set False after saving or reset page
    protected isWidgetDesignDirty: boolean;

    public currentWidgetStateKey: string = '';

    constructor(
        protected store: Store<AppState>,
        protected widgetDetailActions: WidgetDetailActions,
        protected widgetUtils: WidgetUtils,
        protected widgetTemplateSettingService: WidgetTemplateSettingService,
        protected obserableShareService: ObservableShareService,
        protected propertyPanelService: PropertyPanelService,
        protected xnCommonActions: XnCommonActions,
        protected router: Router,
        protected accessRightService: AccessRightsService
    ) {
        super(router);

        this.iPromiseTrackerOptions = {
            minDuration: 500,
            delay: 2000
        }
    }

    protected abstract saveWidgetPage(parmWidgetDetail?: WidgetDetail);

    protected overrideDefaultModule() {
        if (this.currentModule) {
            this.ofModule = this.currentModule;
        }
    }

    /**
     * destroy
     */
    protected destroy() {
        this.widgetUtils.clearWidgetDataTypeValuesByPageId(this.ofModule.moduleNameTrim, this.pageId);
        if (WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim]) {
            WidgetUtils.widgetDataTypeValues[this.ofModule.moduleNameTrim].renderFor = null;
        }
        const layoutPageInfo = new LayoutPageInfoModel({
            id: this.pageId,
            moduleName: this.moduleName,
            widgetboxesTitle: []
        });
        this.store.dispatch(this.xnCommonActions.setWidgetboxesInfo(layoutPageInfo, this.ofModule));
    }

    /**
     * checkWidgetIgnoreDefaultRequest
     * @param idRepWidgetType
     */
    protected checkWidgetIgnoreDefaultRequest(widgetDetail: WidgetDetail) {
        let ignoreRequest: boolean;
        switch (widgetDetail.idRepWidgetType) {
            case WidgetType.Upload:
            case WidgetType.OrderDataEntry:
            case WidgetType.CustomerHistory:
            case WidgetType.Doublette:
            case WidgetType.BlankWidget:
            case WidgetType.CountrySelection:
            case WidgetType.DoubleGrid:
            case WidgetType.DocumentProcessing:
            case WidgetType.SynchronizeElasticsSearch:
            case WidgetType.PaymentInformation:
                ignoreRequest = true;
                break;
            case WidgetType.ReturnRefund:
                ignoreRequest = true;
                if (widgetDetail.idRepWidgetApp == 81) {
                    ignoreRequest = false;
                }
                break;
        }
        return ignoreRequest;
    }

    /**
     * addPromise
     * @param widgetBox
     * @param promise
     */
    protected addPromise(widgetBox: WidgetBox, promise: Promise<any> | Subscription) {
        if (widgetBox.promiseList && widgetBox.promiseList.indexOf(promise) !== -1) {
            return;
        }

        if (!widgetBox.promiseList) {
            widgetBox.promiseList = [];
        }

        widgetBox.promiseList.push(promise);

        if (promise instanceof Subscription) {
            promise.add(() => this.finishPromise(widgetBox, promise));
        }
    }

    /**
     * finishPromise
     * @param widgetBox
     * @param promise
     */
    private finishPromise(widgetBox: WidgetBox, promise: Promise<any> | Subscription) {
        promise['busyFulfilled'] = true;
        const index = widgetBox.promiseList.indexOf(promise);
        if (index === -1) {
            return;
        }
        widgetBox.promiseList.splice(index, 1);
    }

    /**
     * addDelay
     * @param widgetBox
     */
    protected addDelay(widgetBox: WidgetBox) {
        if (!widgetBox)
            return;
        widgetBox.delayPromise = setTimeout(
            (wgBox: WidgetBox) => {
                wgBox.delayPromise = null;
            },
            this.iPromiseTrackerOptions.delay, widgetBox
        );

        widgetBox.isLoading = function () {
            if (this.delayPromise) {
                return false;
            }
            return this.promiseList && this.promiseList.length > 0;
        }
    }

    /**
     * initListenKeyFromPrimaryKey
     * @param widgetDetail
     */
    protected initListenKeyFromPrimaryKey(widgetDetail: WidgetDetail) {
        // Fieldset widget not raise listen key        
        if (!this.widgetUtils.isFieldsetWidget(widgetDetail)) {
            if (widgetDetail.widgetDataType.primaryKey) {
                const primayIdValues = widgetDetail.widgetDataType.primaryKey.split(',');
                primayIdValues.forEach(primayId => {
                    this.widgetUtils.updateWidgetDataTypeValues(this.ofModule.moduleNameTrim, primayId, '', WidgetKeyType.Sub, widgetDetail, this.pageId);
                });
            }
        }
    }

    /**
     * checkEditStatusOfWidget
     * @param widgetDetail
     */
    protected checkEditStatusOfWidget(widgetDetail: WidgetDetail): boolean {
        let isEdited: boolean = false;
        if (!this.widgetModuleComponents || !this.widgetModuleComponents.length) {
            return isEdited;
        }
        // Loop to find valid widget need to check
        this.widgetModuleComponents.forEach((widgetModuleComponent) => {
            if (!widgetModuleComponent.data || !widgetModuleComponent.data.widgetDataType || this.widgetUtils.ignoreDirtyCheck(widgetModuleComponent.data)) {
                return;
            }
            if (widgetDetail.id == widgetModuleComponent.data.id) {
                // If Widget changed data OR move to edit mode , we keep the state.
                isEdited = widgetModuleComponent.isWidgetDataEdited;

                // Check special case : 
                // If this widget is parent of the others , and one of this widget's children is on edit mode
                // Consider this widget is on edit mode.
                if (!isEdited) {
                    isEdited = widgetModuleComponent.checkCurrentWidgetHasChildrenInEditMode();
                }
            }
        });
        return isEdited;
    }

    /**
     * resetToViewModeForWidgetDetail
     * @param widgetDetail
     */
    protected resetToViewModeForWidgetDetail(widgetDetail: WidgetDetail) {
        if (!this.widgetModuleComponents || !this.widgetModuleComponents.length) {
            return;
        }

        const widgetModuleComponent = this.widgetModuleComponents.find(p => (p.data && p.data.id == widgetDetail.id));
        if (widgetModuleComponent) {
            widgetModuleComponent.resetWidgetToViewMode(true);
        }
    }

    /**
     * updateContentForWidgetBox
     * @param widgetBox
     * @param widgetDetail
     */
    protected updateContentForWidgetBox(widgetBox: WidgetBox, widgetDetail: WidgetDetail) {
        if (this.currentWidgetStateKey) {

            // Find & Remove the current selected widget which not edited yet.
            let isEditedCurrentState: boolean;
            const currentWidgetState = widgetBox.widgetStates.find(p => p.selected);
            if (currentWidgetState) {
                isEditedCurrentState = this.checkEditStatusOfWidget(widgetDetail);
                if (!isEditedCurrentState) {
                    widgetBox.widgetStates = widgetBox.widgetStates.filter(p => p.key != currentWidgetState.key);
                }
            }

            widgetBox.widgetStates.forEach(el => el.selected = false);
            const nextState = widgetBox.widgetStates.find(p => p.key == this.currentWidgetStateKey);
            if (nextState) {
                // Default Keeping the current reference to keep UI.
                nextState.selected = true;
                // Need to wait for UI completely render of selected state            
                setTimeout(() => {
                    const isEdited = this.checkEditStatusOfWidget(widgetDetail);
                    if (isEdited) {
                        // Keeping the current reference to keep UI.
                        nextState.data.contentDetail = widgetDetail.contentDetail;
                    }
                    else {
                        // Create new reference to redraw new data.
                        nextState.data = cloneDeep(widgetDetail)
                    }
                    widgetBox.widgetStates = Object.assign([], widgetBox.widgetStates);
                });
            }
            else {
                //widgetBox.widgetStates.push(new WidgetState({
                //    key: this.currentWidgetStateKey,
                //    data: cloneDeep(widgetDetail),
                //    selected: true
                //}));

                if (!currentWidgetState || isEditedCurrentState) {
                    widgetBox.widgetStates.push(new WidgetState({
                        key: this.currentWidgetStateKey,
                        data: cloneDeep(widgetDetail),
                        selected: true
                    }));
                }
                // Reuse widgetState to redraw data on the existing component (to avoid re-new the new component)
                else {
                    // We need to reset to view mode for widget module
                    this.resetToViewModeForWidgetDetail(widgetDetail);
                    currentWidgetState.key = this.currentWidgetStateKey;
                    currentWidgetState.data = cloneDeep(widgetDetail);
                    currentWidgetState.selected = true;
                    widgetBox.widgetStates.push(currentWidgetState);
                }

                widgetBox.widgetStates = Object.assign([], widgetBox.widgetStates);
            }
        }
        else {
            // Fix bug auto refresh widget Return & Refund
            if (!widgetBox.widgetStates || (widgetBox.widgetStates && !widgetBox.widgetStates.length)) {
                widgetBox.widgetStates = [];
                widgetBox.widgetStates.push(new WidgetState({
                    data: cloneDeep(widgetDetail),
                    selected: true
                }));
            }
            else {
                const state = widgetBox.widgetStates[0];
                state.data = cloneDeep(widgetDetail);
            }
            widgetBox.widgetStates = Object.assign([], widgetBox.widgetStates);
        }
    }

    /**
     * reloadSharingWidgetDetails
     * Only call 1 request for all the same type widgets
     * @param widgetDetails
     */
    public reloadSharingWidgetDetails(widgetDetails: Array<WidgetDetail>, callback?: any) {
        // Should not cancel request

        // for (let index = 0; index < this.subscriptionArray.length; index++) {
        //     this.subscriptionArray[index].unsubscribe();
        // }
        // this.subscriptionArray = [];

        let requestWidgetDetails = uniqBy(widgetDetails, (widgetDetail: WidgetDetail) => {
            const filterParam = widgetDetail.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim);
            return widgetDetail.idRepWidgetApp + '_' + widgetDetail.idRepWidgetType + '_' + JSON.stringify(filterParam);
        });

        requestWidgetDetails.forEach((wgDetail: WidgetDetail) => {
            let key = this.widgetUtils.getWidgetDetailKeyForObservable(wgDetail, this.ofModule.moduleNameTrim);
            let filterParam = wgDetail.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim);
            let observable: Observable<WidgetDetail> = this.widgetTemplateSettingService.getWidgetDetailByRequestString(wgDetail, filterParam);
            this.obserableShareService.setObservable(key, observable);
        });

        requestWidgetDetails.forEach((wgDetail: WidgetDetail) => {
            let key = this.widgetUtils.getWidgetDetailKeyForObservable(wgDetail, this.ofModule.moduleNameTrim);
            let observable$ = this.obserableShareService.getObservable(key);
            if (observable$) {
                const subscription = observable$.subscribe((widgetDetail: WidgetDetail) => {
                    if (widgetDetail) {
                        //
                        const filterParam = widgetDetail.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim);
                        widgetDetails.forEach((data: WidgetDetail) => {
                            const filterParamTarget = data.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim);
                            if (
                                (data.idRepWidgetApp == widgetDetail.idRepWidgetApp) &&
                                (data.idRepWidgetType == widgetDetail.idRepWidgetType) &&
                                JSON.stringify(filterParam) == JSON.stringify(filterParamTarget)) {
                                data.contentDetail = widgetDetail.contentDetail;
                                this.initListenKeyFromPrimaryKey(data);
                                for (let j = 0; j < this.widgetBoxes.length; j++) {
                                    if (this.widgetBoxes[j].id === data.id) {
                                        this.updateContentForWidgetBox(this.widgetBoxes[j], data);
                                        break;
                                    }
                                }
                            }
                        });
                    }
                    if (callback) {
                        callback(wgDetail);
                    }
                });
                // Should not cancel request
                this.subscriptionArray.push(subscription);
                const widgetBox = this.widgetBoxes.filter(p => p.id == wgDetail.id);
                if (widgetBox.length) {
                    this.addPromise(widgetBox[0], subscription);
                }
            }
        });
    }

    /**
     * reloadWidgetDetails
     * @param widgetDetails
     */
    public reloadWidgetDetails(widgetDetails: Array<WidgetDetail>, callback?: any) {
        // Should not cancel request

        // for (let index = 0; index < this.subscriptionArray.length; index++) {
        //     this.subscriptionArray[index].unsubscribe();
        // }
        // this.subscriptionArray = [];

        if (!widgetDetails || !widgetDetails.length) return;

        widgetDetails.forEach((wgDetail: WidgetDetail) => {
            if (!wgDetail.widgetDataType) {
                return;
            }

            let accessRight: any;
            if (wgDetail.idRepWidgetType === WidgetType.Translation || wgDetail.idRepWidgetType === WidgetType.BlankWidget) {
                accessRight = this.accessRightService.createFullAccessRight();
            } else {
                accessRight = this.accessRightService.SetAccessRightsForWidget({
                    idSettingsGUIParent: this.ofModule.idSettingsGUIParent,
                    idSettingsGUI: this.ofModule.idSettingsGUI,
                    idRepWidgetApp: wgDetail.idRepWidgetApp
                });
            }

            if (!accessRight || !accessRight.read) {
                return;
            }

            let filterParam = wgDetail.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim);
            const externalParam = this.getExternalParam(wgDetail);
            filterParam = Object.assign(filterParam, externalParam);
            if (this.widgetModuleComponents && this.widgetModuleComponents.length) {
                const widgetModuleComponent = this.widgetModuleComponents.find(p => p.data.id == wgDetail.id);
                if (widgetModuleComponent && widgetModuleComponent.templateId) {
                    filterParam['IsSetAsDefault'] = 1;
                    filterParam['IdRepSalesCampaignAddOnTemplate'] = widgetModuleComponent.templateId;

                    if (!widgetModuleComponent.widgetMenuStatusComponent.isEditTemplateMode) {
                        filterParam['IsLoadTemplate'] = 1;
                    }
                }

                if (widgetModuleComponent && widgetModuleComponent.data &&
                    (widgetModuleComponent.data.idRepWidgetApp == 116 || widgetModuleComponent.data.idRepWidgetApp == 117)) {
                    if (widgetModuleComponent.isCustomerStatusWidgetEdit) {
                        filterParam['IsShowOnlyActivated'] = '0';
                    } else {
                        filterParam['IsShowOnlyActivated'] = '1';
                    }
                }
            } else {
                if (wgDetail.idRepWidgetApp == 116 || wgDetail.idRepWidgetApp == 117) {
                    filterParam['IsShowOnlyActivated'] = '1';
                }
            }

            const subscription = this.widgetTemplateSettingService.getWidgetDetailByRequestString(wgDetail, filterParam)
                .subscribe((widgetDetail: WidgetDetail) => {
                    if (widgetDetail) {
                        this.initListenKeyFromPrimaryKey(widgetDetail);
                        for (let j = 0; j < this.widgetBoxes.length; j++) {
                            if (this.widgetBoxes[j].id === widgetDetail.id) {
                                this.updateContentForWidgetBox(this.widgetBoxes[j], widgetDetail);
                                break;
                            }
                        }
                    }
                    if (callback) {
                        callback(wgDetail);
                    }
                });

            // Should not cancel request
            // this.subscriptionArray.push(subscription);
            const widgetBox = this.widgetBoxes.filter(p => p.id == wgDetail.id);
            if (widgetBox.length) {
                this.addPromise(widgetBox[0], subscription);
            }
        });
    }

    /**
     * getExternalParam
     * @param widgetDetail
     */
    protected getExternalParam(widgetDetail: WidgetDetail) {
        let filterParam = {};
        const widgetBox = this.widgetBoxes.find(p => p.id == widgetDetail.id);
        if (widgetBox && widgetBox.properties) {
            const properties = widgetBox.properties.properties;
            if (properties) {
                const externalParam = this.propertyPanelService.getItemRecursive(properties, 'ExternalParam');
                if (externalParam && externalParam.value) {
                    if (Uti.isJsonString(externalParam.value)) {
                        let s1 = JSON.stringify(externalParam.value);
                        let s2 = JSON.stringify(s1);
                        let s3 = s2.substring(1, s2.length - 1);
                        filterParam['ExternalParam'] = s3;
                    }
                    else {
                        filterParam['ExternalParam'] = externalParam.value;
                    }
                }
                const propHasDocumentType = this.propertyPanelService.getItemRecursive(properties, 'HasDocumentType');
                if (propHasDocumentType && propHasDocumentType.value) {
                    filterParam['IdRepProcessingType'] = this.getIdRepProcessingType(propHasDocumentType.value);
                }
            }
        }
        return filterParam;
    }

    private getIdRepProcessingType(type) {
        switch (type) {
            case 1:
            case 'Offer':
                return 1;
            case 2:
            case 'Order':
                return 2;
            case 3:
            case 'Invoice':
                return 3;
        }
        return null;
    }

    /**
     * detectListenKeyAfterDrag
     * Specify listen key from Main Or Sub
     *      Case 1: Only listen from Main
     *      Case 2: Only listen from Sub
     *      Case 3: Listen from both Main/Sub
     * @param widgetDetail
     */
    protected detectListenKeyAfterDrag(widgetDetail: WidgetDetail): boolean {

        let listenToAny: boolean;
        let parentOfAny: boolean;

        if (!widgetDetail || !widgetDetail.widgetDataType) {
            return false;
        }

        if (widgetDetail.idRepWidgetType == WidgetType.OrderDataEntry) {
            return false;
        }

        if (widgetDetail.widgetDataType.listenKey && widgetDetail.widgetDataType.listenKey.key) {
            listenToAny = true;
        }

        if (widgetDetail.widgetDataType.primaryKey) {
            parentOfAny = true;
        }

        if (!listenToAny && !parentOfAny) {
            return false;
        }

        let isDisplayDialog = false;

        let relatingWidgetInfos: Array<IWidgetInfo>;
        let childrenRelatingWidgetInfos: Array<IWidgetInfo>;
        let sameTypeWidgetIds: Array<IWidgetInfo>;
        let chartLinkTableInfos: Array<IWidgetInfo>;
        let widgetDetailNeedToConnect: WidgetDetail;
        let isConnectToMainSupport: boolean;

        let mainCount = 0;
        let subCount = 0;
        let isListenOnMain = false;
        let isListenOnSub = false;

        if (listenToAny && this.widgetListenKey) {
            const listenKey = widgetDetail.widgetDataType.listenKey.key;
            const listenKeyArr = listenKey.split(',');

            const parkedItemKeyArr = this.widgetListenKey.split(',');
            for (const listenkey of listenKeyArr) {
                for (const parkedItemKey of parkedItemKeyArr) {
                    if (listenkey.toLowerCase() == parkedItemKey.toLowerCase()) {
                        mainCount += 1;
                        break;
                    }
                }
            }

            // Check if listen from main.
            if (mainCount == listenKeyArr.length) {
                isListenOnMain = true;
            }
        }

        relatingWidgetInfos = [];
        childrenRelatingWidgetInfos = [];
        sameTypeWidgetIds = [];
        chartLinkTableInfos = [];

        // Check for subs
        if (this.layoutPageInfo && this.layoutPageInfo.length) {
            this.layoutPageInfo.forEach((layoutPageInfoModel: LayoutPageInfoModel) => {
                if (layoutPageInfoModel.widgetboxesTitle && layoutPageInfoModel.widgetboxesTitle.length) {
                    layoutPageInfoModel.widgetboxesTitle.forEach(box => {
                        let targetWidgetDetail: WidgetDetail = box.widgetDetail;
                        if (targetWidgetDetail) {
                            let status = this.widgetUtils.isValidWidgetToConnect(widgetDetail, targetWidgetDetail);
                            if (status && status.isValid) {
                                subCount++;
                                switch (status.mode) {
                                    case 'child->parent':
                                        relatingWidgetInfos.push({
                                            id: targetWidgetDetail.id,
                                            title: targetWidgetDetail.title
                                        });
                                        break;
                                    case 'parent->child':
                                        childrenRelatingWidgetInfos.push({
                                            id: targetWidgetDetail.id,
                                            title: targetWidgetDetail.title
                                        });
                                        break;
                                    case 'same-widget':
                                        sameTypeWidgetIds.push({
                                            id: targetWidgetDetail.id,
                                            title: targetWidgetDetail.title
                                        });
                                        break;
                                    case 'chart-table':
                                        chartLinkTableInfos.push({
                                            id: targetWidgetDetail.id,
                                            title: targetWidgetDetail.title
                                        });
                                        break;
                                }
                            }
                        }
                    });
                }
            });
        }

        // Check if listen from sub.
        if (subCount > 0) {
            isListenOnSub = true;
        }

        // If listen on main & sub
        if (isListenOnMain && isListenOnSub) {
            // Display dialog            
            widgetDetailNeedToConnect = widgetDetail;
            isConnectToMainSupport = true;
            isDisplayDialog = true;
        }
        else {
            // Only listen on Main
            if (isListenOnMain) {
                this.widgetUtils.buildListenKeyConfigForWidgetDetail(widgetDetail, true);
            }
            // Only listen on Sub
            else if (isListenOnSub) {
                // Only listen from 1 parent
                // then connect without display dialog
                if ((relatingWidgetInfos && relatingWidgetInfos.length == 1) &&
                    (!childrenRelatingWidgetInfos || childrenRelatingWidgetInfos.length == 0)) {
                    this.widgetUtils.buildListenKeyConfigForWidgetDetail(widgetDetail, false);
                    widgetDetail.widgetDataType.parentWidgetIds = [relatingWidgetInfos[0].id];

                    // Set connect status for parent
                    const communicationWidget: ICommunicationWidget = {
                        srcWidgetDetail: widgetDetail,
                        childrenRelatingWidgetInfos: null,
                        relatingWidgetInfos: relatingWidgetInfos,
                        isConnectToMainSupport: null,
                        sameTypeWidgetInfos: null
                    };
                    this.store.dispatch(this.widgetDetailActions.setConnectForParentFromChildWidget(communicationWidget, this.ofModule));
                }
                // Only listen from 1 child
                // then connect without display dialog
                else if ((childrenRelatingWidgetInfos && childrenRelatingWidgetInfos.length == 1) &&
                    (!relatingWidgetInfos || relatingWidgetInfos.length == 0)) {
                    const communicationWidget: ICommunicationWidget = {
                        srcWidgetDetail: widgetDetail,
                        childrenRelatingWidgetInfos: childrenRelatingWidgetInfos,
                        relatingWidgetInfos: null,
                        isConnectToMainSupport: null,
                        sameTypeWidgetInfos: null
                    };
                    this.store.dispatch(this.widgetDetailActions.setConnectForChildFromParentWidget(communicationWidget, this.ofModule));
                }
                else {
                    // Display dialog                    
                    widgetDetailNeedToConnect = widgetDetail;
                    isDisplayDialog = true;
                }
            }
            //else {
            //    this.widgetUtils.buildListenKeyConfigForWidgetDetail(widgetDetail, true);
            //}
        }

        if (sameTypeWidgetIds.length || chartLinkTableInfos.length) {
            isDisplayDialog = true;
        }

        if (isDisplayDialog) {
            this.communicationWidgetInfo = {
                relatingWidgetInfos: relatingWidgetInfos,
                childrenRelatingWidgetInfos: childrenRelatingWidgetInfos,
                srcWidgetDetail: widgetDetailNeedToConnect || widgetDetail,
                isConnectToMainSupport: isConnectToMainSupport,
                sameTypeWidgetInfos: sameTypeWidgetIds,
                chartLinkTableInfos: chartLinkTableInfos
            };
        }

        return isDisplayDialog;
    }

    /**
     * onSuccessLinkingWidget
     * @param widgetDetail
     */
    public onSuccessLinkingWidget(widgetDetail: WidgetDetail) {
        this.displayConnectedWidgetDialog = false;
        this.communicationWidgetInfo = null;
        if (!widgetDetail) {
            return;
        }

        // Fix bug: [CAMPAIGN] number after title of Campaign Countries Table widget is lost after closing module and open again
        // We need to find and get WidgetDetail from WigetBox to have valid title
        const box = this.widgetBoxes.find(p => p.data.id === widgetDetail.id);
        if (box) {
            box.isDirty = true;
        }

        if (widgetDetail.idRepWidgetType != WidgetType.Translation) {
            this.reloadWidgetDetails([box.data]);
        }

        //const box = this.widgetBoxes.filter(p => p.data.id === widgetDetail.id);
        //if (box.length) {
        //    box[0].isDirty = true;
        //}
        //
        if (this.widgetModuleComponents && this.widgetModuleComponents.length) {
            const widgetModuleComponent = this.widgetModuleComponents.find(p => p.data.id == widgetDetail.id);
            if (widgetModuleComponent) {
                widgetModuleComponent.linkedSuccessWidget = true;
                widgetModuleComponent.reattach();
            }
        }
    }

    /**
     * onRemoveLinkingWidget
     * @param widgetDetail
     */
    public onRemoveLinkingWidget(eventData: any) {
        this.reloadWidgetDetails([eventData.widgetDetail]);
        const box = this.widgetBoxes.filter(p => p.data.id === eventData.widgetDetail.id);
        if (box.length) {
            box[0].isDirty = true;
        }

        // Remove connection for children widgets
        if (!eventData.notRemoveChildrenConnection) {
            this.store.dispatch(this.widgetDetailActions.requestRemoveConnectionFromParentWidget(eventData.widgetDetail.id, this.ofModule));
        }

        // Remove connection for parent widgets
        if (eventData.parentWidgetIds && eventData.parentWidgetIds.length) {
            this.store.dispatch(this.widgetDetailActions.requestRemoveConnectionFromChildWidget(eventData.parentWidgetIds, this.ofModule));
        }
    }

    /**
     * onConnectedWidgetLinkHover
     * @param Array
     */
    onConnectedWidgetLinkHover(data: WidgetDetail) {
        if (!data)
            return;

        let widgetIds: Array<string> = [];

        const foundWidgetDetails = this.findValidSyncSameTypeWidgets(data);
        if (foundWidgetDetails && foundWidgetDetails.length) {
            widgetIds = foundWidgetDetails.map(p => p.id);
        }

        if (data.widgetDataType.parentWidgetIds && data.widgetDataType.parentWidgetIds.length) {
            widgetIds = widgetIds.concat(data.widgetDataType.parentWidgetIds);
        }

        this.store.dispatch(this.widgetDetailActions.hoverAndDisplayRelatingWidget({
            mode: 'hover',
            relatingWidgetIds: widgetIds,
            scrWidgetDetail: data
        }, this.ofModule));
    }


    /**
     * onConnectedWidgetLinkUnHover
     */
    onConnectedWidgetLinkUnHover() {
        this.store.dispatch(this.widgetDetailActions.hoverAndDisplayRelatingWidget({
            mode: 'unHover',
            relatingWidgetIds: null,
            scrWidgetDetail: null
        }, this.ofModule));
    }

    /**
     * findValidSyncSameTypeWidgets
     * @param widgetDetail
     */
    findValidSyncSameTypeWidgets(widgetDetail: WidgetDetail) {
        let idx = 0;
        let foundWidgetDetails: Array<WidgetDetail> = [widgetDetail];
        this.findValidSyncWidgetRecursive(widgetDetail, foundWidgetDetails, idx);
        return foundWidgetDetails;
    }

    /**
     * findValidSyncWidgetRecursive
     * @param widgetDetail
     * @param foundWidgetDetails
     * @param index
     */
    private findValidSyncWidgetRecursive(widgetDetail: WidgetDetail, foundWidgetDetails: Array<WidgetDetail>, index: number) {

        let lengthBeforeFind = foundWidgetDetails.length;

        this.findValidSyncWidgetFromParent(widgetDetail, foundWidgetDetails);
        this.findValidSyncWidgetFromChild(widgetDetail, foundWidgetDetails);

        let lengthAfterFind = foundWidgetDetails.length;

        if (lengthAfterFind > lengthBeforeFind) {

            foundWidgetDetails.forEach((foundWidgetDetail, idx) => {
                if (idx > index) {
                    index = idx;
                    this.findValidSyncWidgetRecursive(foundWidgetDetail, foundWidgetDetails, index);
                }
            });
        }
        else {
            return;
        }
    }

    /**
     * findValidSyncWidgetFromParent
     * @param widgetDetail
     * @param foundWidgetDetail
     */
    private findValidSyncWidgetFromParent(widgetDetail: WidgetDetail, foundWidgetDetail: Array<WidgetDetail>) {
        if (widgetDetail.syncWidgetIds && widgetDetail.syncWidgetIds.length) {
            this.layoutPageInfo.forEach(pageInfo => {
                pageInfo.widgetboxesTitle.forEach(widgetbox => {
                    const iRet = widgetDetail.syncWidgetIds.filter(p => p == widgetbox.widgetDetail.id);
                    if (iRet.length) {
                        const rs = foundWidgetDetail.filter(p => p.id == widgetbox.widgetDetail.id);
                        if (!rs.length) {
                            foundWidgetDetail.push(widgetbox.widgetDetail);
                        }
                    }
                });
            })
        }
    }

    /**
     * findValidSyncWidgetFromChild
     * @param widgetDetail
     * @param foundWidgetDetail
     */
    private findValidSyncWidgetFromChild(widgetDetail: WidgetDetail, foundWidgetDetail: Array<WidgetDetail>) {
        this.layoutPageInfo.forEach(pageInfo => {
            pageInfo.widgetboxesTitle.forEach(widgetbox => {
                if (widgetbox.widgetDetail.syncWidgetIds && widgetbox.widgetDetail.syncWidgetIds.length) {
                    const iRet = widgetbox.widgetDetail.syncWidgetIds.filter(p => p == widgetDetail.id);
                    if (iRet.length) {
                        const rs = foundWidgetDetail.filter(p => p.id == widgetbox.widgetDetail.id);
                        if (!rs.length) {
                            foundWidgetDetail.push(widgetbox.widgetDetail);
                        }
                    }
                }
            });
        })
    }

    /**
     * trackWidget
     * @param index
     * @param widget
     */
    trackWidget(index, widget) {
        //console.log('index: ' + index + 'trackWidget : ' + widget);
        return widget ? widget.id : undefined;
    }

    /**
     * onInitializedGrid
     */
    onInitializedGrid(event) {
        // console.log('onInitializedGrid');
        this.store.dispatch(this.widgetDetailActions.initializedWidgetContainer(this.ofModule));
    }

    /**
     * resetWidgetTableOnEntityChanged
     */
    protected resetWidgetTableOnEntityChanged() {
        if (this.widgetModuleComponents && this.widgetModuleComponents.length) {
            this.widgetModuleComponents.forEach((widgetModuleComponent) => {
                if (!widgetModuleComponent.data || !widgetModuleComponent.data.widgetDataType) {
                    return;
                }
                if (this.widgetUtils.isTableWidgetDataType(widgetModuleComponent.data) && widgetModuleComponent.agGridComponent) {
                    widgetModuleComponent.agGridComponent.deselectRow();
                }
            });
        }
    }

    /**
     * onResetWidget
     * @param widgetDetail
     */
    public onResetWidget(widgetDetail: WidgetDetail) {
        this.reloadWidgetDetails([widgetDetail]);
    }

}
