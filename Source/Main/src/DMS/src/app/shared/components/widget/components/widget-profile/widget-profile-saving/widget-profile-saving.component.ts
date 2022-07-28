import {
    Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { ModalActions } from '@app/state-management/store/actions';
import * as models from '@app/models';
import { MessageModal } from '@app/app.constants';
import { Uti } from '@app/utilities/uti';
import { Subscription } from 'rxjs';
import {
    RuleService,
    AppErrorHandler,
    DatatableService
} from '@app/services';
import { WjComboBox } from 'wijmo/wijmo.angular2.input';
import cloneDeep from 'lodash-es/cloneDeep';

@Component({
    selector: 'widget-profile-saving',
    styleUrls: ['./widget-profile-saving.component.scss'],
    templateUrl: './widget-profile-saving.component.html'
})
export class WidgetProfileSavingComponent implements OnInit, OnDestroy {
    public showDialog = false;
    public templateName: any;
    public requiredMessage = 'required';
    public showRequired = false;
    public profileDatasource = [];
    public showUpdateDialog = false;

    private cachedProfiles: any;
    private savingJsonData: any;
    private isNew = true;
    private saveProfileSubscription: Subscription;
    private loadProfileSubscription: Subscription;

    @Input() profileSelectedData: any;
    @Output() onSavingData: EventEmitter<any> = new EventEmitter();
    @Output() onSavedData: EventEmitter<any> = new EventEmitter();
    @ViewChild('selectProfile') selectProfile: WjComboBox;

    constructor(
        private datatableService: DatatableService,
        private store: Store<AppState>,
        private modalActions: ModalActions,
        private appErrorHandler: AppErrorHandler,
        private ruleService: RuleService
    ) {
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public openConfirmSaving() {
         var messageOption = new models.MessageModalModel({
             messageType: MessageModal.MessageType.warning,
             modalSize: MessageModal.ModalSize.small,
             header: new models.MessageModalHeaderModel({
                 text: 'Save template'
             }),
             body: new models.MessageModalBodyModel({
                 isHtmlContent: true,
                 content: 'Do you want to save a new template or update in current template?'
             }),
             footer: new models.MessageModalFooterModel({
                 buttonList: [
                     new models.ButtonList({
                         buttonType: MessageModal.ButtonType.success,
                         text: 'Add New',
                         customClass: '',
                         callBackFunc: () => {
                            this.hideModal();
                            this.templateName = '';
                            this.showDialog = true;
                         }
                     }),
                     new models.ButtonList({
                         buttonType: MessageModal.ButtonType.warning,
                         text: 'Update',
                         customClass: '',
                         callBackFunc: () => {
                            this.onUpdateClicked();
                         }
                     }),
                     new models.ButtonList({
                         buttonType: MessageModal.ButtonType.default,
                         text: 'Cancel',
                         customClass: '',
                         callBackFunc: () => {
                            this.hideModal();
                         }
                     })]
             })
         });
         this.store.dispatch(this.modalActions.setDataForModal(messageOption));
        this.store.dispatch(this.modalActions.modalShowMessage(true));
    }

    public openUpdateWithoutSelectProfile(idSelectionWidget: any, jsonData: any) {
        this.showDialog = false;
        this.hideModal();
        this.savingJsonData = jsonData;
        this.loadProfileSubscription = this.ruleService.getTemplate(idSelectionWidget)
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response)) {
                        return;
                    }
                    response = this.datatableService.formatDataTableFromRawData(response.item);
                    response = this.datatableService.buildDataSource(response);
                    this.cachedProfiles = cloneDeep(response.data);
                    this.profileDatasource = response.data.map(x => {
                        return {
                            idValue: x.IdSelectionWidgetTemplate,
                            textValue: x.Description
                        };
                    });
                    this.showUpdateDialog = true;
                });
            });
    }

    public changeProfile() {
        if (!this.cachedProfiles || !this.cachedProfiles.length) return;
        const currentItem = this.cachedProfiles.find(x => x.IdSelectionWidgetTemplate == this.selectProfile.selectedValue);
        if (!currentItem || !currentItem.IdSelectionWidgetTemplate) return;
        this.onSavedData.emit(currentItem);
    }

    public templateNameChanged() {
        this.showRequired = !this.templateName;
    }

    public hideModal() {
        this.store.dispatch(this.modalActions.modalCloseMessage(true));
    }

    public onCancel() {
        this.showDialog = false;
        this.showUpdateDialog = false;
    }

    public onCreateClicked() {
        if (!this.templateName) {
            this.showRequired = true;
            return;
        }
        this.isNew = true;
        this.onSavingClicked();
    }

    public onUpdateClicked() {
        this.isNew = false;
        this.onSavingClicked();
    }

    public onUpdateProfileClicked() {
        if (!this.selectProfile || !this.selectProfile.selectedValue) {
            this.showRequired = true;
            return;
        }
        this.callSavingData(this.savingJsonData);
    }

    public callSavingData(jsonData) {
        let savingData: any = {
            IsActive: '1',
            Description: this.profileSelectedData.Description,
            IdSelectionWidget: this.profileSelectedData.IdSelectionWidget,
            TemplateData: JSON.stringify(jsonData)
        };
        if (!this.isNew) {
            savingData['IdSelectionWidgetTemplate'] = this.profileSelectedData.IdSelectionWidgetTemplate;
        } else {
            savingData['Description'] = this.templateName;
        }
        savingData = [savingData];
        this.saveData(savingData);
    }

    private saveData(savingData: any) {
        this.saveProfileSubscription = this.ruleService.saveBlackListProfile(savingData)
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response)) {
                        return;
                    }
                    if (this.isNew)
                        this.showDialog = false;
                    else {
                        this.hideModal();
                        this.showUpdateDialog = false;
                    }
                    this.profileSelectedData = savingData[0];
                    this.profileSelectedData['IdSelectionWidgetTemplate'] = response.item.returnID;
                    this.onSavedData.emit(this.profileSelectedData);
                });
            });
    }

    private onSavingClicked() {
        this.onSavingData.emit(this.isNew);
    }

    public onUpdate() {

    }
}
