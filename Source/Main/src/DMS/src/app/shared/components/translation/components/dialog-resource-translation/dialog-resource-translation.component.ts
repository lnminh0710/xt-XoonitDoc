import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, TemplateRef } from '@angular/core';
import {
    GlobalSettingService, AppErrorHandler, DatatableService, ModalService
} from '@app/services';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { ResourceTranslationFormComponent } from '../resource-translation-form/resource-translation-form.component';
import { PopupRef } from '../../../../../xoonit-share/components/global-popup/popup-ref';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { HeaderNoticeRef } from '../../../../../xoonit-share/components/global-popup/components/header-popup/header-notice-ref';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { ModalActions } from '@app/state-management/store/actions';


@Component({
    selector: 'dialog-resource-translation',
    styleUrls: ['./dialog-resource-translation.component.scss'],
    templateUrl: './dialog-resource-translation.component.html'
})
export class DialogResourceTranslationComponent implements OnInit, OnDestroy, AfterViewInit {
    private popup: PopupRef<any>;
    private translateData: any = [];
    public isDirty = false;

    public showDialog = false;
    public keyword = '';
    public defaultValue = '';

    @ViewChild('hotkeyPopup') hotkeyPopup: TemplateRef<any>;

    @Output() onSave = new EventEmitter();
    @Output() onClose = new EventEmitter();
    @Output() onSuccessSaved = new EventEmitter();

    @ViewChild('resourceTranslationFormComponent') public resourceTranslationFormComponent: ResourceTranslationFormComponent;

    constructor(private globalSettingService: GlobalSettingService,
        private appErrorHandler: AppErrorHandler,
        private _toasterService: ToasterService,
        private modalService: ModalService,
        private popupService: PopupService,
        private modalActions: ModalActions,
        private store: Store<AppState>
        ) {
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {

    }

    ngAfterViewInit() {
        this.popup = this.popupService.open({
            content: this.hotkeyPopup,
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                iconClose: true,
                title: 'Translation',
                icon: { content: '', type: 'resource' },
            }),
            disableCloseOutside: true,
            containerClass: 'tranlslation',
            containerStyle: 'z-index: 1090'
        });
        this.popup.afterClosed$.subscribe(
            (() => {
                this.onClose.emit(true);
            }).bind(this),
        );
    }

    public open() {
    }

    public save() {
        if (this.isDirty) {
            this.saveTranslateData();
        }
    }

    public cancel() {
        if (!this.isDirty) {
            this.popup.close();
            this.showDialog = false;
            this.store.dispatch(this.modalActions.modalSetHasTranslatePopup(false));
            // this.onClose.emit();
            return;
        }
        this.store.dispatch(this.modalActions.modalSetHasTranslatePopup(true));
        this.modalService.unsavedWarningMessageDefault({
            headerText: 'Saving Changes',
            onModalSaveAndExit: () => { this.saveTranslateData(); },
            onModalExit: () => {
                this.popup.close();
                this.showDialog = false;
                this.store.dispatch(this.modalActions.modalSetHasTranslatePopup(false));
                //this.onClose.emit();
            }
        });
    }

    public close() {
        this.popup.close();
        this.showDialog = false;
        this.store.dispatch(this.modalActions.modalSetHasTranslatePopup(false));
        //this.onClose.emit();
    }

    public outputDataHandler(translateData: any) {
        this.isDirty = true;
        this.translateData = translateData;
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    private saveTranslateData() {
        this.resourceTranslationFormComponent.stopEditing();
        setTimeout(() => {
            this.globalSettingService.saveTranslateLabelText(this.prepareDataForSaving()).subscribe(
                (response) => {
                    this.appErrorHandler.executeAction(() => {
                        if (response && response.eventType === 'Successfully') {
                            // this._toasterService.pop('success', 'Success', 'Data is saved successful');
                            this.isDirty = false;
                            this.showDialog = false;                            
                            this.onSuccessSaved.emit();
                            this.popup.close();
                        }
                    });
                }
            );
        }, 500);
    }


    private prepareDataForSaving(): any {
        if (!this.translateData || !this.translateData.length) return [];
        return { 'Translations': this.translateData.map(x => {
            return {
                IdRepTranslateModuleType: 5,
                IdRepLanguage: x.IdRepLanguage,
                OriginalText: this.keyword,
                TranslatedText: x.TranslateText || '',
                IdTranslateLabelText: x.IdTranslateLabelText || null
            }
        }) };
    }
}
