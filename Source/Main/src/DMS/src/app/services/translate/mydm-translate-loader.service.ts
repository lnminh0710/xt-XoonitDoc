import { GlobalSettingService } from '../common';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class MyDmTranslateLoader implements TranslateLoader {
    constructor(
        private http: HttpClient,
        private globalSettingService: GlobalSettingService
    ) { }

    getTranslation(lang: string): Observable<any> {
        return this.globalSettingService.getCommonTranslateLabelText();
    }
}
