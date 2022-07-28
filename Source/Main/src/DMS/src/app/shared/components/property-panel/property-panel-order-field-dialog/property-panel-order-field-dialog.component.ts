import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import cloneDeep from 'lodash-es/cloneDeep';
import { Uti } from '@app/utilities';
import { WidgetTemplateSettingService, AppErrorHandler, ModalService } from '@app/services';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '@app/state-management/store';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { WidgetDetailActions } from '@app/state-management/store/actions/widget-content-detail';
import { OrderByModeEnum } from '@app/app.constants';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { Module } from '@app/models';

@Component({
    selector: 'property-panel-order-field-dialog',
    styleUrls: ['./property-panel-order-field-dialog.component.scss'],
    templateUrl: './property-panel-order-field-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyPanelOrderFieldDialogComponent implements OnInit, OnDestroy {

    public showDialog = false;
    public displayFieldsForAll: any[] = [];
    public displayFieldsForOnly: any[] = [];
    public isDirtyAll = false;
    public isDirtyOnly = false;
    public applyFor: OrderByModeEnum = OrderByModeEnum.Default;

    private propertiesParentData: any;
    private propertiesParentDataState: Observable<any>;
    private propertiesParentDataStateSubscription: Subscription;
    private widgetTemplateSettingServiceSubscription: Subscription;

    @Input() usingModule: Module;

    @Output() onApply = new EventEmitter<any>();

    constructor(private widgetTemplateSettingService: WidgetTemplateSettingService,
        private dragulaService: DragulaService,
        private store: Store<AppState>,
        private modalService: ModalService,
        private toasterService: ToasterService,
        private widgetDetailActions: WidgetDetailActions,
        private appErrorHandler: AppErrorHandler,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        this.propertiesParentDataState = this.store.select(state => propertyPanelReducer.getPropertyPanelState(state, this.usingModule.moduleNameTrim).propertiesParentData);
    }

    ngOnInit() {
        this.subscribePropertiesParentDataState();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public open() {
        this.widgetTemplateSettingServiceSubscription = this.widgetTemplateSettingService.getWidgetDetailByRequestString(this.propertiesParentData, this.propertiesParentData.widgetDataType.listenKeyRequest, false, true).subscribe(
            (result1: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.widgetTemplateSettingServiceSubscription = this.widgetTemplateSettingService.getWidgetOrderBy(this.propertiesParentData.idRepWidgetApp, this.propertiesParentData.id).subscribe(
                        (result: any) => {
                            this.appErrorHandler.executeAction(() => {
                                this.showDialog = true;
                                this.isDirtyAll = false;
                                this.isDirtyOnly = false;
                                this.applyFor = OrderByModeEnum.Default;
                                if (!result || !result.data || !result.data.length) {
                                    this.displayFieldsForAll = this.displayFieldsForOnly = [];
                                    return;
                                }
                                this.makeOrderByData(result.data[0]);

                                this.changeDetectorRef.markForCheck();
                            });
                        });
                });
            });
    }

    private makeOrderByData(data: any) {
        const dataForAll = data.filter(x => x.IsDefault);
        const dataForOnly = data.filter(x => !x.IsDefault);
        this.displayFieldsForAll = dataForAll.sort((a, b) => { return Uti.sortBy(a, b, 'OrderBy'); });
        this.displayFieldsForOnly = dataForOnly.sort((a, b) => { return Uti.sortBy(a, b, 'OrderBy'); });
    }

    public close() {
        if (this.isDirtyAll || this.isDirtyOnly) {
            this.confirmWhenClose();
        } else {
            this.showDialog = false;
        }
    }

    public apply() {
        if (!this.isDirtyAll && !this.isDirtyOnly) {
            this.saveCallback();
            return;
        }
        this.widgetTemplateSettingServiceSubscription = this.widgetTemplateSettingService.saveWidgetOrderBy(this.makeSaveData()).subscribe(
            (result: any) => {
                this.appErrorHandler.executeAction(() => {
                    this.saveCallback();
                    this.store.dispatch(this.widgetDetailActions.requestReload(this.usingModule));
                });
            });
    }

    private saveCallback() {
        this.toasterService.pop('success', 'Success', 'Order by field saved successfully');
        this.onApply.emit([...this.displayFieldsForAll, ...this.displayFieldsForOnly]);
        this.showDialog = false;

        this.changeDetectorRef.markForCheck();
    }

    private subscribePropertiesParentDataState() {
        this.widgetTemplateSettingServiceSubscription = this.propertiesParentDataStateSubscription = this.propertiesParentDataState.subscribe((propertiesParentDataState: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!propertiesParentDataState) return;
                this.propertiesParentData = cloneDeep(propertiesParentDataState || {});
            });
        });
    }

    private makeSaveData() {
        const saveData = [];
        if (this.isDirtyAll) {
            for (let i = 0; i < this.displayFieldsForAll.length; i++) {
                saveData.push({
                    IdSysWidgetFieldsOrderBy: this.displayFieldsForAll[i].IdSysWidgetFieldsOrderBy.toString(),
                    OrderBy: (i + 1).toString(),
                    IsDefault: 'true'
                });
            }
        }
        if (this.isDirtyOnly) {
            for (let i = 0; i < this.displayFieldsForOnly.length; i++) {
                saveData.push({
                    IdSysWidgetFieldsOrderBy: this.displayFieldsForOnly[i].IdSysWidgetFieldsOrderBy.toString(),
                    OrderBy: (i + 1).toString()
                });
            }
        }
        return {
            WidgetApp: this.propertiesParentData.idRepWidgetApp,
            WidgetGuid: this.propertiesParentData.id,
            WidgetOrderBys: saveData
        };
    }

    private confirmWhenClose() {
        this.modalService.unsavedWarningMessageDefault({
            onModalSaveAndExit: () => { this.apply(); },
            onModalExit: () => {
                this.showDialog = false;

                this.changeDetectorRef.markForCheck();
            }
        });
    }
}
