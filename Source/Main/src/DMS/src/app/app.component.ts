import { Component, OnInit } from '@angular/core';
import { ComboBoxTypeConstant, LocalSettingKey, Configuration } from './app.constants';
import * as Dynamsoft from 'dwt';
import { Store } from '@ngrx/store';
import { AppState } from './state-management/store';
import { AdministrationDocumentActions } from './state-management/store/actions';
import { LocalStorageHelper, LocalStorageProvider, SessionStorageProvider } from './utilities';
import { LanguageSettingModel, User } from './models';
import { UserService } from './services';
import { BlockUIState } from './models/cloud-connection.model';
import { detect } from 'detect-browser';
import { setTheme } from 'ngx-bootstrap/utils';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    private _loadedCombobox = false;
    public currentUser: any;
    public isBlockClient = true;
    public blockUIStatus: BlockUIState | null;
    public blockUIState = BlockUIState;

    constructor(
        private store: Store<AppState>,
        private administrationActions: AdministrationDocumentActions,
        private userService: UserService,
    ) {
        this._checkBrowser();
        if (this.isBlockClient) return;

        setTheme('bs4');

        this.userService.currentUser.subscribe((currentUser) => {
            this.currentUser = currentUser;
            if (currentUser?.id) {
                this.setUserLanguage(currentUser);

                if (!this._loadedCombobox) {
                    this.loadRepCombobox();
                }
            }
        });
    }

    public ngOnInit() {
        Dynamsoft.WebTwainEnv.ProductKey =
            'f0068WQAAANZfukc8AKdvQh2SmtNn5GS7rrzKDGqsTrpWz3ryH0imKfAxKrj8x2jX3GRqwnwiJBvE1WnHGwV+ArsQV6t5VTg=';
        Dynamsoft.WebTwainEnv.Trial = false;
        Dynamsoft.WebTwainEnv.AutoLoad = false;
        // Dynamsoft.WebTwainEnv.ResourcesPath = '/public/assets/lib/dwt/dist';
        Dynamsoft.WebTwainEnv.ResourcesPath = Configuration.PublicSettings.fileUrl + '/Dynamsoft';
    }

    private loadRepCombobox() {
        const comboboxList: string[] = [];
        Object.keys(ComboBoxTypeConstant).forEach((key) => {
            switch (ComboBoxTypeConstant[key]) {
                case ComboBoxTypeConstant.meansOfPayment:
                case ComboBoxTypeConstant.currency:
                case ComboBoxTypeConstant.communicationTypeType:
                    comboboxList.push(key);
                    return;
                default:
                    return;
            }
        });
        this.store.dispatch(this.administrationActions.getAllCapturedRepCombobox(comboboxList.join(',')));
        this._loadedCombobox = true;
    }

    private setUserLanguage(userInfo: User) {
        const sessionLang = LocalStorageHelper.toInstance(SessionStorageProvider).getItem(LocalSettingKey.LANGUAGE);
        if (!sessionLang) {
            LocalStorageHelper.toInstance(LocalStorageProvider).setItem(
                LocalSettingKey.LANGUAGE,
                new LanguageSettingModel({
                    idRepLanguage: userInfo.preferredLang,
                    translateModuleType: '5',
                }),
            );
            return;
        }

        LocalStorageHelper.toInstance(LocalStorageProvider).setItem(
            LocalSettingKey.LANGUAGE,
            new LanguageSettingModel({
                idRepLanguage: sessionLang.idRepLanguage,
                translateModuleType: sessionLang.translateModuleType,
            }),
        );
    }

    private checkCookie() {
        var cookieEnabled = navigator.cookieEnabled;
        if (!cookieEnabled) {
            document.cookie = 'testcookie';
            cookieEnabled = document.cookie.indexOf('testcookie') != -1;
        }
        return cookieEnabled;
    }

    private _checkBrowser() {
        const browser = detect();
        if (browser.name !== 'edge-chromium' && browser.name !== 'chrome' && browser.name !== 'firefox') {
            this.isBlockClient = true;
            this.blockUIStatus = BlockUIState.chromeOnly;
        } else if (!this.checkCookie()) {
            this.isBlockClient = true;
            this.blockUIStatus = BlockUIState.blockAllCookie;
        } else {
            this.isBlockClient = false;
        }
    }
}
