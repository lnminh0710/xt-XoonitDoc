import { ViewChildren, QueryList } from '@angular/core';
import {
    WidgetDetail,
    WidgetType,
    Module,
    WidgetPropertyModel,
    WidgetState
} from '@app/models';
import {
    ModalService,
    WidgetTemplateSettingService,
    TreeViewService
} from '@app/services';
import { Constructor } from './constructor';
import cloneDeep from 'lodash-es/cloneDeep';
import { Uti } from '@app/utilities/uti';
import { WidgetDetailInfo, WidgetAction } from './widget-base-mixin';
import {
    XnTreeViewComponent
} from '@app/shared/components/xn-control';

export interface TreeViewServiceInjector {
    widgetTemplateSettingService: WidgetTemplateSettingService;
    treeViewService: TreeViewService;
}

export function MixinWidgetTreeView<T extends Constructor<TreeViewServiceInjector>>(base: T) {
    abstract class AbstractWidgetTreeViewBase extends base implements WidgetDetailInfo, WidgetAction {
        // @ViewChildren(XnTreeViewComponent)
        // xnTreeViewComponents: QueryList<XnTreeViewComponent>;

        get xnTreeViewComponent(): XnTreeViewComponent {
            if (this.xnTreeViewComponents && this.xnTreeViewComponents.length) {
                const wijmoGrid = this.xnTreeViewComponents.find(p => p.isActivated);
                if (wijmoGrid) {
                    return wijmoGrid;
                }
            }
            return null;
        }

        constructor(...args: any[]) {
            super(...args);
        }

        // Implement interface WidgetDetailInfo Widget
        abstract get widgetStatesInfo(): Array<WidgetState>;
        abstract get dataInfo(): WidgetDetail;
        abstract get moduleInfo(): Module;
        abstract get showInDialogStatus(): boolean;
        abstract get widgetEditedStatus(): boolean;
        abstract get propertiesInfo(): WidgetPropertyModel[];
        abstract get xnTreeViewComponents(): QueryList<XnTreeViewComponent>;

        // Implement interface Action Widget
        abstract updateWidgetEditedStatus(status: boolean);
        abstract cancelEditingWidget(data: WidgetDetail);
        abstract saveSuccessWidget(data: WidgetDetail);
        abstract editingWidget(data: WidgetDetail);
        abstract checkToShowCommandButtons(makeCommandButsHidden?: boolean);

        /**
         * Get isOnEditTreeView
         */
        public get isOnEditTreeView() {
            if (this.xnTreeViewComponent) {
                return this.xnTreeViewComponent.isOnEditTreeView;
            }
            return false;
        }

        /**
         * editTreeView
         */
        protected editTreeView() {
            if (!this.xnTreeViewComponent) return;
            this.xnTreeViewComponent.isOnEditTreeView = true;
            this.xnTreeViewComponent.setUpDataForTreeView(true);
        }

        /**
         * resetTreeView
         */
        protected resetTreeView() {
            if (!this.xnTreeViewComponent) return;
            if (!this.showInDialogStatus) {
                this.xnTreeViewComponent.isOnEditTreeView = false;
                this.xnTreeViewComponent.setUpDataForTreeView(false);
            } else {
                this.xnTreeViewComponent.setUpDataForTreeView(true);
            }
        }

        /**
         * resetOnInit
         */
        protected resetOnInit() {
            if (this.xnTreeViewComponent) {
                this.xnTreeViewComponent.resetOnInit();
                if (!this.showInDialogStatus) {
                    this.xnTreeViewComponent.isOnEditTreeView = false;
                }
            }
            this.updateWidgetEditedStatus(false);
        }

        /**
         * saveTreeView
         */
        protected saveTreeView() {
            if (!this.xnTreeViewComponent) return;
            let saveData = this.xnTreeViewComponent.getFinalData();
            if (!saveData || !saveData.length) {
                this.treeViewSavingComplete();
                return;
            }
             const strSaveData = JSON.stringify(saveData);
             const updateString = cloneDeep(this.dataInfo.updateRequest);
             this.widgetTemplateSettingService.updateWidgetInfo(saveData, updateString, this.moduleInfo, null, (s: string) => {
                 return s.replace(/"/g, '\\\\"');
             }).subscribe((rs) => {
                 this.treeViewSavingComplete();
             });
        }

        /**
         * treeViewSavingComplete
         */
        protected treeViewSavingComplete() {
            if (!this.showInDialogStatus) {
                this.xnTreeViewComponent.setUpDataForTreeView(false, true);
                this.cancelEditingWidget(this.dataInfo);
                this.resetOnInit();
                this.xnTreeViewComponent.isCacheViewData = false;
                this.xnTreeViewComponent.setUpDataForTreeView(false, false);
            } else {
                this.xnTreeViewComponent.setUpDataForTreeView(true, true);
                this.resetOnInit();
                this.xnTreeViewComponent.isCacheViewData = false;
                this.xnTreeViewComponent.setUpDataForTreeView(true, false);
            }

            this.saveSuccessWidget(this.dataInfo);
        }

        ///**
        // * onTreeViewExpandWidget
        // * @param event
        // */
        //protected onTreeViewExpandWidget(event: any) {
        //    this.xnTreeViewComponent.setExpandForTree(event);
        //}

        /**
         * treeViewDataChange
         * @param data
         */
        protected treeViewDataChange(data: any) {
            this.updateWidgetEditedStatus(true);
            this.editingWidget(this.dataInfo);
        }

    };
    return AbstractWidgetTreeViewBase;
}
