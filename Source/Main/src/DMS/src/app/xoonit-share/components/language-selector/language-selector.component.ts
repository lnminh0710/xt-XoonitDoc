import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LocalSettingKey } from '@app/app.constants';
import { LanguageSettingModel } from '@app/models';
import { BaseComponent } from '@app/pages/private/base';
import { CommonService, UserService } from '@app/services';
import { LocalStorageHelper, SessionStorageProvider } from '@app/utilities';

import * as localForage from 'localforage';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'language-selector',
    styleUrls: ['./language-selector.component.scss'],
    templateUrl: './language-selector.component.html',
})
export class LanguageSelectorComponent implements OnInit {
    @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
    public languages: LanguageSettingModel[] = [];

    public currentLanguage: LanguageSettingModel;

    constructor(private commonService: CommonService) {}

    ngOnInit() {
        this._getLanguages();
    }

    public changeLanguage(language: any) {
        if (language.idRepLanguage == this.currentLanguage?.idRepLanguage) return;

        LocalStorageHelper.toInstance(SessionStorageProvider).setItem(LocalSettingKey.LANGUAGE, language);
        location.reload();
    }

    private _getLanguages() {
        this.languages = [];
        this.commonService.getMainLanguages().subscribe(
            (response) => {
                if (response.statusCode !== 1) return;

                if (
                    !response.item &&
                    !response.item.data &&
                    !response.item.data.length &&
                    !response.item.data[1] &&
                    !response.item.data[1].length
                )
                    return;

                const languages = response.item.data[1];

                languages.forEach((language) => {
                    const userLanguage = new LanguageSettingModel({
                        flag: (language.LanguageCode as string).toLowerCase(),
                        languageCode: language.LanguageCode,
                        name: language.DefaultValue,
                        idRepLanguage: language.IdRepLanguage,
                        translateModuleType: '5',
                    });
                    this.languages.push(userLanguage);
                });
                this._getCurrentLanguage();
            },
            (error) => {
                console.log(error);
            },
        );
    }

    private _getCurrentLanguage() {
        const language = LocalStorageHelper.toInstance(SessionStorageProvider).getItem(LocalSettingKey.LANGUAGE);
        const initLanguage = this.languages.find((lang) => lang.idRepLanguage == '1');
        this.currentLanguage = language || initLanguage;
    }
}
