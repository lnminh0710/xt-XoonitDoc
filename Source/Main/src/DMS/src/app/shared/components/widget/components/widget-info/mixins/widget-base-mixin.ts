import { Input, ChangeDetectorRef } from '@angular/core';

import { WidgetUtils } from '../../../utils';
import { MixinWidgetCommunication } from './widget-communication';
import { MixinWidgetProperty } from './widget-property';
import { MixinWidgetTreeView } from './widget-tree-view';
import { MixinWidgetTable } from './widget-table';
import { MixinWidgetFileManagement } from './file-management';
import {  
    PropertyPanelService, ModalService,
    WidgetTemplateSettingService, TreeViewService,
    DatatableService, GlobalSettingService, ArticleService, PersonService
} from '@app/services';
import { WidgetDetail, Module, FieldFilter, WidgetPropertyModel, WidgetState} from '@app/models';
import { XnWidgetMenuStatusComponent } from '../../xn-widget-menu-status';
import {
    FilterModeEnum
} from '@app/app.constants';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { PropertyPanelActions } from '@app/state-management/store/actions';

export interface WidgetDetailInfo {
    widgetStatesInfo: Array<WidgetState>;
    dataInfo: WidgetDetail;
    moduleInfo: Module;
    showInDialogStatus: boolean;
    widgetEditedStatus: boolean;
    propertiesInfo: WidgetPropertyModel[];
}

export interface WidgetAction {
    updateWidgetEditedStatus(status: boolean);
    cancelEditingWidget(data: WidgetDetail);
    saveSuccessWidget(data: WidgetDetail);
    editingWidget(data: WidgetDetail);    
    checkToShowCommandButtons(makeCommandButsHidden?: boolean);
}

export interface WidgetMenu {
    selectedFilterInfo: FilterModeEnum;
    selectedSubFilterInfo: FilterModeEnum;
    fieldFiltersInfo: Array<FieldFilter>;
    widgetMenuStatusInfo: XnWidgetMenuStatusComponent;
    controlMenuStatusToolButtons(value: boolean);
    editWidget(widgetType?: any);
    onHiddenWidgetInfoTranslation(event?: any);
}

/**
 * WidgetModuleBase
 */
export class WidgetModuleBase {

    constructor(
        public store: Store<AppState>,
        public widgetUtils: WidgetUtils,
        public propertyPanelService: PropertyPanelService,
        public modalService: ModalService,
        public widgetTemplateSettingService: WidgetTemplateSettingService,
        public treeViewService: TreeViewService,
        public datatableService: DatatableService,
        public globalSettingService: GlobalSettingService,
        public articleService: ArticleService,
        public personService: PersonService,
        public changeDetectorRef: ChangeDetectorRef,
        public propertyPanelActions: PropertyPanelActions)
    { }
}

export const BaseWidgetModuleInfoMixin = MixinWidgetFileManagement(MixinWidgetTable(MixinWidgetTreeView(MixinWidgetProperty(MixinWidgetCommunication(WidgetModuleBase)))));
