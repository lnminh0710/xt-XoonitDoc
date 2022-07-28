import { Injectable, forwardRef, Inject } from '@angular/core';
import { Observable, Subscription, of } from 'rxjs';
import { AppErrorHandler } from '@app/services';
import { Module, FormOutputModel } from '@app/models';
import { WidgetContainerComponent } from '@app/shared/components/widget';
import { ToasterService } from 'angular2-toaster';
import { RequestSavingMode } from '@app/app.constants';

@Injectable()
export abstract class BaseWidgetSavingProcessService {
    protected abstract savingFunc: Function;
    public outputModel: FormOutputModel;

    constructor(@Inject(forwardRef(() => ToasterService)) protected toasterService: ToasterService) {}

    /**
     * findParentKey
     * @param widgetContainers
     * @param parentId
     */
    protected findParentKey(widgetContainers: Array<WidgetContainerComponent>, parentId) {
        let key = '';
        for (let i = 0; i < widgetContainers.length; i++) {
            widgetContainers[i].widgetModuleComponents.forEach((widgetModuleComponent) => {
                if (widgetModuleComponent.data.id == parentId) {
                    if (
                        widgetModuleComponent.data.widgetDataType &&
                        widgetModuleComponent.data.widgetDataType.editFormSetting
                    ) {
                        key = widgetModuleComponent.data.widgetDataType.editFormSetting.key;
                    }
                }
            });
            if (key) {
                break;
            }
        }
        return key;
    }

    protected buildFormValue(savingData) {
        return {};
    }

    protected setValueForOutputModel(submitResult: any, returnID?: any, savingData?: any) {
        this.outputModel = new FormOutputModel({
            submitResult: submitResult,
            formValue: this.buildFormValue(savingData),
            isValid: true,
            isDirty: true,
            returnID: returnID,
        });
    }

    protected isValidCustom(data, widgetContainers: Array<WidgetContainerComponent>) {
        return true;
    }

    public submit(widgetContainers: Array<WidgetContainerComponent>, callBack: Function, savingMode: any) {
        if (widgetContainers && widgetContainers.length) {
            let savingData = {};
            let isValid: boolean = true;
            widgetContainers.forEach((widgetContainer) => {
                if (widgetContainer && widgetContainer.widgetModuleComponents) {
                    widgetContainer.widgetModuleComponents.forEach((widgetModule) => {
                        let key;
                        if (
                            widgetModule.data &&
                            widgetModule.data.widgetDataType &&
                            widgetModule.data.widgetDataType.editFormSetting
                        ) {
                            key = widgetModule.data.widgetDataType.editFormSetting.key;
                            if (
                                widgetModule.data.widgetDataType.parentWidgetIds &&
                                widgetModule.data.widgetDataType.parentWidgetIds.length
                            ) {
                                let parentId = widgetModule.data.widgetDataType.parentWidgetIds[0];
                                if (parentId) {
                                    // Find parent key
                                    let parentKey = this.findParentKey(widgetContainers, parentId);
                                    if (parentKey) {
                                        key += '_' + parentKey;
                                    }
                                }
                            }
                        }
                        let status = widgetModule.isValidForSaving();
                        if (status) {
                            let data = widgetModule.getSavingData();
                            if (data) {
                                if (key) {
                                    savingData[key] = data;
                                } else {
                                    savingData = Object.assign(savingData, data);
                                }
                            }
                        } else {
                            isValid = false;
                        }
                    });
                }
            });

            isValid = isValid && Object.keys(savingData).length > 0 && this.isValidCustom(savingData, widgetContainers);

            if (isValid) {
                savingData['SavingMode'] = savingMode;
                this.savingFunc(savingData)
                    .catch((error) => {
                        return of(null);
                    })
                    .subscribe((response) => {
                        if (response && response.returnID) {
                            this.setValueForOutputModel(true, response.returnID, savingData);
                            this.outputModel.customData = response.payload;
                        } else {
                            this.setValueForOutputModel(false, null);
                        }
                        if (callBack) {
                            callBack(this.outputModel);
                        }
                    });
            } else {
                this.toasterService.pop(
                    'warning',
                    'Validation Failed',
                    'There are some fields do not pass validation!',
                );
                this.setValueForOutputModel(false, null);
                if (callBack) {
                    callBack(this.outputModel);
                }
            }
        }
    }
}
