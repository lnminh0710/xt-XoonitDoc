import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import {
    ModuleActions,
    ParkedItemActions,
    ModuleSettingActions,
    PropertyPanelActions,
} from '@app/state-management/store/actions';
import { Observable, Subscription } from 'rxjs/Rx';
import { LocalStorageKey, ModuleType, GlobalSettingConstant } from '@app/app.constants';
import { AdvanceSearchBuilderComponent } from '@app/shared/components/advance-search-builder';
import { AdvanceSearchProfileComponent } from '@app/shared/components/advance-search-profile';
import { ActivatedRoute } from '@angular/router';
import { GlobalSettingModel, WidgetPropertyModel, User } from '@app/models';
import {
    UserService,
    AppErrorHandler,
    ModalService,
    ModuleSettingService,
    GlobalSettingService,
    PropertyPanelService,
} from '@app/services';
import { Uti } from '@app/utilities';
import { ToasterConfig } from 'angular2-toaster';
import cloneDeep from 'lodash-es/cloneDeep';
import { ModuleList } from '@app/pages/private/base';

@Component({
    selector: 'app-root',
    templateUrl: './advance-search.component.html',
    styleUrls: ['./advance-search.component.scss'],
    host: {
        '(window:resize)': 'resizeEventHandler($event)',
    },
})
export class AdvanceSearchComponent implements OnInit, OnDestroy {
    public moduleId;
    public formData: any;
    public isDisableNewSearch = true;
    public isDisableSearch = true;
    public toastrConfig: ToasterConfig;
    public properties: WidgetPropertyModel[] = [];

    private orgGlobalProperties: any;
    private propertiesSettings: any;
    private EMPTY_CONDITION = [{ condition: 'And', field: '', operator: '', value: '' }];
    private paramSubscription: Subscription;
    private currentUser: User;
    private keyBuffer: any = [];
    private controlKeyNumber: any = 18; // alt key
    private fKeyNumber: any = 83; // s key
    private keyCombinate: any = [this.controlKeyNumber, this.fKeyNumber]; // alt + s
    private isDirty = false;

    @HostListener('document:keydown.out-zone', ['$event'])
    onKeyDown($event) {
        this.pushIntoBuffer($event.keyCode);
        if (Uti.arraysEqual(this.keyCombinate, this.keyBuffer)) {
            $event.preventDefault();
            this.keyBuffer = [];
            setTimeout(() => {
                this.search();
            }, 300);
        }
    }

    @ViewChild(AdvanceSearchBuilderComponent) advanceSearchBuilderComponent: AdvanceSearchBuilderComponent;
    @ViewChild(AdvanceSearchProfileComponent) advanceSearchProfileComponent: AdvanceSearchProfileComponent;

    constructor(
        private store: Store<AppState>,
        private _appErrorHandler: AppErrorHandler,
        private _userService: UserService,
        private _modalService: ModalService,
        private moduleSettingService: ModuleSettingService,
        private globalSettingSer: GlobalSettingService,
        private propertyPanelService: PropertyPanelService,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelActions: PropertyPanelActions,
        private globalSettingConstant: GlobalSettingConstant,
        private activatedRoute: ActivatedRoute,
    ) {
        this.toastrConfig = new ToasterConfig({
            newestOnTop: true,
            showCloseButton: true,
            tapToDismiss: true,
            limit: 1,
            positionClass: 'toast-top-center',
        });
    }

    public ngOnInit() {
        $('#page-loading').remove();
        this.paramSubscription = this.activatedRoute.queryParams.subscribe((params) => {
            this.moduleId = params['moduleId'];
        });
        this._userService.currentUser.subscribe((user: User) => {
            this._appErrorHandler.executeAction(() => {
                this.currentUser = user;
            });
        });
        $('body').addClass('skin-light');
        $('.main-header').remove();
        $('.faked-heading').remove();

        setTimeout(() => {
            this.getGlobalPropertiesFromSetting();
        }, 500);
    }

    public ngOnDestroy() {
        if (this.paramSubscription) {
            this.paramSubscription.unsubscribe();
        }
    }

    private browserTabId: string = Uti.defineBrowserTabId();
    public search() {
        let formData = this.advanceSearchBuilderComponent?.getData();
        if (formData && formData.length) {
            formData.forEach((formItem) => {
                if (formItem.dataType === 'date') {
                    formItem.value = Uti.parseDateToDBString(formItem.value);
                }
            });
        }

        localStorage.setItem(
            LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSFieldCondition, this.browserTabId),
            JSON.stringify({
                moduleId: this.moduleId,
                formData: formData,
                timestamp: new Date().toTimeString(),
                browserTabId: this.browserTabId,
            }),
        );
    }

    public getProfileData(): any {
        return this.advanceSearchBuilderComponent?.getData();
    }

    public resizeEventHandler(event: any) {}

    public onClickNewSearch() {
        if (this.isDirty) {
            this._modalService.unsavedWarningMessageDefault({
                headerText: 'Save Data',
                onModalSaveAndExit: this.saveAndExit.bind(this),
                onModalExit: this.newSearch.bind(this),
            });
            return;
        }
        this.newSearch();
    }

    public onExposeDataHandler(selectedProfile: any) {
        if (!selectedProfile) return;
        this.formData = JSON.parse(selectedProfile.jsonSettings || '[]');
        this.isDisableNewSearch = this.isDisableSearch = false;
        this.isDirty = false;
    }

    public onDirtyHandler() {
        if (this.advanceSearchProfileComponent.isEditingOnOtherUserProfile()) {
            return;
        }
        this.isDisableNewSearch = this.isDisableSearch = false;
        this.advanceSearchProfileComponent.onDirtyHandler();
        this.isDirty = true;
    }

    public onMeetLastInputHandler() {
        this.search();
    }

    public newSearch() {
        this.formData = cloneDeep(this.EMPTY_CONDITION);
        this.isDisableNewSearch = this.isDisableSearch = true;
        this.advanceSearchProfileComponent.onClickNewSearch();
    }

    public onConfirmNoHandler() {
        this.isDirty = false;
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    private saveAndExit() {
        this.advanceSearchProfileComponent.callSaveWhenClickNew();
    }

    private timeoutKey: any;
    private pushIntoBuffer(keyCode) {
        if (
            !this.keyBuffer ||
            this.keyBuffer.indexOf(keyCode) > -1 ||
            this.keyCombinate.indexOf(keyCode) === -1 ||
            (keyCode === this.fKeyNumber && this.keyBuffer.indexOf(this.controlKeyNumber) < 0)
        )
            return;
        this.keyBuffer.push(keyCode);
        if (this.timeoutKey) {
            clearTimeout(this.timeoutKey);
            this.timeoutKey = null;
        }
        this.timeoutKey = setTimeout(() => {
            this.keyBuffer = [];
        }, 1000);
    }

    private getGlobalPropertiesFromSetting() {
        this.moduleSettingService
            .getModuleSetting(null, null, '-1', ModuleType.GLOBAL_PROPERTIES, '-1')
            .subscribe((response) => {
                let globalPropsDefault: any;
                if (Uti.isResquestSuccess(response) && response.item.length) {
                    let jsonSettings = Uti.tryParseJson(response.item[0].jsonSettings);
                    globalPropsDefault = !Uti.isEmptyObject(jsonSettings) ? jsonSettings : null;
                }
                this.globalSettingSer.getAllGlobalSettings().subscribe((data: any) => {
                    this.appErrorHandler.executeAction(() => {
                        this.properties = this.buildPropertiesFromGlobalSetting(data, globalPropsDefault);
                        this.updateGlobalProperties();
                    });
                });
            });
    }

    private updateGlobalProperties() {
        this.orgGlobalProperties = cloneDeep(this.properties);
        this.propertyPanelService.globalProperties = this.orgGlobalProperties;
        this.store.dispatch(this.propertyPanelActions.requestUpdateGlobalProperty(this.properties, ModuleList.Base));
    }

    private buildPropertiesFromGlobalSetting(data: GlobalSettingModel[], defaultProperties?): any[] {
        if (!data)
            return defaultProperties
                ? defaultProperties.properties
                : this.propertyPanelService.createDefaultGlobalSettings();

        this.propertiesSettings = data.find((x) => x.globalName === this.globalSettingConstant.globalWidgetProperties);
        if (!this.propertiesSettings || !this.propertiesSettings.idSettingsGlobal)
            return defaultProperties
                ? defaultProperties.properties
                : this.propertyPanelService.createDefaultGlobalSettings();

        const properties = JSON.parse(this.propertiesSettings.jsonSettings) as GlobalSettingModel[];
        if (!properties || !properties.length)
            return defaultProperties
                ? defaultProperties.properties
                : this.propertyPanelService.createDefaultGlobalSettings();

        return this.propertyPanelService.mergeProperties(properties, defaultProperties).properties;
    }
}
