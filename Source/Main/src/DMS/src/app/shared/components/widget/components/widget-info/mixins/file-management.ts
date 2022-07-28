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
} from '@app/services';
import { Constructor } from './constructor';
import { WidgetDetailInfo, WidgetAction } from './widget-base-mixin';
import { XnFileExplorerComponent, XnUploadTemplateFileComponent } from '@app/shared/components/xn-file';

export interface FileManagmentServiceInjector {
    widgetTemplateSettingService: WidgetTemplateSettingService;
}

export function MixinWidgetFileManagement<T extends Constructor<FileManagmentServiceInjector>>(base: T) {
    abstract class AbstractWidgetFileManagementBase extends base implements WidgetDetailInfo, WidgetAction {
        get xnUploadTemplateFileComponent(): XnUploadTemplateFileComponent {
            if (this.xnUploadTemplateFileComponents && this.xnUploadTemplateFileComponents.length) {
                const xnUploadTemplateFileComponent = this.xnUploadTemplateFileComponents.find(p => p.isActivated);
                if (xnUploadTemplateFileComponent) {
                    return xnUploadTemplateFileComponent;
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
        abstract get xnUploadTemplateFileComponents(): QueryList<XnUploadTemplateFileComponent>;

        // Implement interface Action Widget
        abstract updateWidgetEditedStatus(status: boolean);
        abstract cancelEditingWidget(data: WidgetDetail);
        abstract saveSuccessWidget(data: WidgetDetail);
        abstract editingWidget(data: WidgetDetail);
        abstract checkToShowCommandButtons(makeCommandButsHidden?: boolean);
        abstract controlMenuStatusToolButtons(value: boolean);

        /**
         * Get isOnFileManagement
         */
        public get isOnFileManagement() {
            if (this.xnUploadTemplateFileComponent) {
                return this.xnUploadTemplateFileComponent.isOnEditting;
            }
            return false;
        }

        /**
         * editFileManagement
         */
        protected editFileManagement() {
            if (!this.xnUploadTemplateFileComponent) return;
            this.xnUploadTemplateFileComponent.isOnEditting = true;
        }

        /**
         * saveFileManagement
         */
        protected saveFileManagement() {
            if (!this.xnUploadTemplateFileComponent) return;
            this.xnUploadTemplateFileComponent.submit();
        }

        /**
         * resetFileManagement
         */
        protected resetFileManagement() {
            this.xnUploadTemplateFileComponent.resetData();
        }

        protected toggleFileEditMode(toggle: boolean) {
            this.controlMenuStatusToolButtons(toggle);
        }
    };
    return AbstractWidgetFileManagementBase;
}
