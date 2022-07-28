import { Input, HostListener, Directive, HostBinding, ElementRef, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Store, ReducerManagerDispatcher } from "@ngrx/store";
import { Observable, Subscription } from 'rxjs';
import {
    ProcessDataActions,
    CustomAction,
    WidgetDetailActions
} from '@app/state-management/store/actions';
import {
    AppErrorHandler, CustomerWidgetSavingProcessService, OrderProcessingSavingProcessService, DocumentService
} from '@app/services';
import { Module, FormOutputModel, MessageModel } from '@app/models';
import { WidgetContainerComponent } from "@app/shared/components/widget/container/widget-container/widget-container.component";
import { MenuModuleId, RequestSavingMode, MessageModal } from '@app/app.constants';
import { Uti } from '@app/utilities';
import { filter } from 'rxjs/operators';

@Directive({
    selector: '[widgetSavingProcess]',
    inputs: ['config: widgetSavingProcess'],
})

export class WidgetSavingProcessDirective implements OnDestroy {
    private dispatcherSubscription: Subscription;
    private widgetContainerSubscription: Subscription;
    private widgetContainers: Array<WidgetContainerComponent> = [];

    @Input() ofModule: Module;
    @Input() tabID: string;

    @Output() outputData: EventEmitter<any> = new EventEmitter();

    private savingMode: any;

    constructor(private store: Store<any>,
        private dispatcher: ReducerManagerDispatcher,
        private customerWidgetSavingProcessService: CustomerWidgetSavingProcessService,
        private orderProcessingSavingProcessService: OrderProcessingSavingProcessService,
        private appErrorHandler: AppErrorHandler,
        private documentService: DocumentService,
        private processDataActions: ProcessDataActions
    ) {

        this.subcribeRequestSaveState();
        this.subcribeWidgetContainerState();
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private _config;
    set config(confg: any) {
        this._config = confg;
    }

    /**
     * subcribeRequestSaveState
     **/
    private subcribeRequestSaveState() {
        this.dispatcherSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_SAVE
            })
        ).subscribe((data: CustomAction) => {
            this.appErrorHandler.executeAction(() => {
                this.savingMode = data.payload;
                this.submit();
            });
        });
    }

    /**
     * subcribeWidgetContainerState
     */
    private subcribeWidgetContainerState() {
        this.widgetContainerSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === WidgetDetailActions.SET_WIDGET_CONTAINER
            })
        ).subscribe((data: CustomAction) => {
            this.appErrorHandler.executeAction(() => {
                if (data.payload) {
                    this.widgetContainers.push(data.payload);
                }
            });
        });
    }


    /**
     * Validation && Collect Data && Saving
     **/
    private submit() {
        switch (this.ofModule.idSettingsGUI) {
            case MenuModuleId.contact:
                if (this.tabID == 'MainInfo') {
                    this.customerWidgetSavingProcessService.submit(this.widgetContainers, this.onSuccessCallback.bind(this), this.savingMode);
                }
                break;
            case MenuModuleId.orderProcessing:
                if (this.tabID == 'OrderProcessing' || this.tabID == 'MainInfo') {
                    this.orderProcessingSavingProcessService.submit(this.widgetContainers, this.onSuccessCallback.bind(this), this.savingMode);
                }
                break;
        }
    }

    /**
     * onSuccessCallback
     * @param evt
     */
    public onSuccessCallback(outputModel: FormOutputModel) {
        this.outputData.emit(outputModel);

        if (outputModel.customData && outputModel.customData.length) {
            switch (this.savingMode) {
                case RequestSavingMode.OPSaveAndRunAsPrint:
                    this.documentService.openDialogDownloadPdfFile(outputModel.customData);
                    break;
                case RequestSavingMode.OPSaveAndRunAsEmail:
                    this.store.dispatch(this.processDataActions.requestSendOPEmail(outputModel.customData, this.ofModule));
                    break;
            }
        }
    }
}
