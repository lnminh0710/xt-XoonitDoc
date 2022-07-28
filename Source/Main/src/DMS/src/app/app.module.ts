import { BrowserModule, EventManager } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule, APP_INITIALIZER, ErrorHandler } from '@angular/core';

import { AppComponent } from './app.component';
import { Configuration } from './app.constants';
import { BaseService } from '@app/services/base.service';
import { CustomEventManager } from '@app/services/common/custom-event-manager.service';
import { Uti } from '@app/utilities/uti';

// import { JwtConfigService, JwtHttp } from 'angular2-jwt-refresh';
// import { AuthConfig } from 'angular2-jwt';

// main bootstrap
import { AppRoutingModule } from './app.routing';
import * as $ from 'jquery';

//import { RouteReuseStrategy } from '@angular/router';
//import { CustomReuseStrategy } from './route-reuse-strategy';

import { HomeComponent } from './pages/home/home.component';

import { AppLoadService } from './app-load.service';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { reducers } from './state-management/store';
import {
    MainModuleEffects,
    ParkedItemEffects,
    TabSummaryEffects,
    WidgetTemplateSettingEffects,
    ModuleSettingEffects,
    XnCommonEffects,
    HotkeySettingEffects,
    GlobalSearchEffects,
    AdministrationDocumentEffects,
    FileManagerEffects,
    DynamicFormStoreEffects
} from './state-management/effects';
import { XnSharedModule } from './shared';
import { AppErrorHandler, GlobalSettingService } from './services';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { DndModule } from 'ng2-dnd';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { NgxMyDatePickerModule } from './shared/components/xn-control';
import { HotkeyModule } from 'angular2-hotkeys';
import { MyDmHttpInterceptor } from './services/system/mydm-http-interceptor.service';
import { TranslateModule, TranslateLoader, MissingTranslationHandler } from '@ngx-translate/core';
import { MyDmTranslateLoader } from './services/translate/mydm-translate-loader.service';
import { MyDmMissingTranslationHandler } from './services/translate/mydm-missing-translation-handler.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AppIconRegistryService } from './app-icon-registry.service';
import { MatTooltipModule } from '@xn-control/light-material-ui/tooltip';
import { AppEffects } from './state-management/effects/app/app.effect';
import { StateManagementModule } from './state-management';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AppleAppSiteAssociationComponent } from './pages/apple-app-site-association/apple-app-site-association.component';
import { UserManagementEffects } from './pages/user-management/user-management.statemanagement/user-management.effects';
import * as primengModule from 'primeng/primeng';
import { GlobalPopupModule } from '@app/xoonit-share/components/global-popup/global-popup.module';
import { UserV2Effects } from './pages/user-v2/user-v2.statemanagement/user-v2.effects';

export function init_app(appLoadService: AppLoadService) {
    return () => appLoadService.initializeApp();
}
export function init_icons(appIconRegistry: AppIconRegistryService) {
    return () => appIconRegistry.registerIcons();
}

@NgModule({
    declarations: [AppComponent, HomeComponent, AppleAppSiteAssociationComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        CommonModule,
        AppRoutingModule,
        StoreModule.forRoot(reducers),

        EffectsModule.forRoot([
            MainModuleEffects,
            ParkedItemEffects,
            TabSummaryEffects,
            WidgetTemplateSettingEffects,
            ModuleSettingEffects,
            XnCommonEffects,
            HotkeySettingEffects,
            GlobalSearchEffects,
            AdministrationDocumentEffects,
            FileManagerEffects,
            UserManagementEffects,
            UserV2Effects,
            AppEffects,
            DynamicFormStoreEffects
        ]),
        XnSharedModule.forRoot(),
        TabsModule.forRoot(),
        BsDropdownModule.forRoot(),
        BsDatepickerModule.forRoot(),
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        CollapseModule.forRoot(),
        PopoverModule.forRoot(),
        DndModule.forRoot(),
        SlimLoadingBarModule.forRoot(),
        NgxMyDatePickerModule.forRoot(),
        ProgressbarModule.forRoot(),
        HotkeyModule.forRoot(),
        TranslateModule.forRoot({
            missingTranslationHandler: {
                provide: MissingTranslationHandler,
                useClass: MyDmMissingTranslationHandler,
            },
            loader: {
                provide: TranslateLoader,
                useClass: MyDmTranslateLoader,
                deps: [HttpClient, GlobalSettingService],
            },
        }),
        StateManagementModule.forRoot(),
        MatTooltipModule,
        primengModule.DialogModule,
        GlobalPopupModule.forRoot(),
    ],
    providers: [
        Configuration,
        BaseService,
        Uti,
        //{
        //    provide: RouteReuseStrategy,
        //    useClass: CustomReuseStrategy,
        //},
        {
            provide: EventManager,
            useClass: CustomEventManager,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MyDmHttpInterceptor,
            multi: true,
        },
        { provide: ErrorHandler, useClass: AppErrorHandler },
        { provide: JwtHelperService, useFactory: () => new JwtHelperService() },
        AppLoadService,
        { provide: APP_INITIALIZER, useFactory: init_app, deps: [AppLoadService], multi: true },
        { provide: APP_INITIALIZER, useFactory: init_icons, deps: [AppIconRegistryService], multi: true },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}

// export function getJwtHttp(http: Http, options: RequestOptions) {
//     let consts = new Configuration();
//     let jwtOptions = {
//         endPoint: consts.refreshTokenUrl,
//         beforeSeconds: consts.expiredTokenOffsetSeconds,
//         tokenName: 'refresh_token',
//         refreshTokenGetter: () => localStorage.getItem(consts.localStorageRefreshToken),
//         tokenSetter: (res: Response): boolean | Promise<void> => {
//             res = res.json();
//             const item = res['item'];
//             if (!item['access_token'] || !item['refresh_token']) {
//                 localStorage.removeItem(consts.localStorageAccessToken);
//                 localStorage.removeItem(consts.localStorageRefreshToken);

//                 return false;
//             }

//             localStorage.setItem(consts.localStorageAccessToken, item['access_token']);
//             localStorage.setItem(consts.localStorageRefreshToken, item['refresh_token']);

//             return true;
//         },
//     };
//     let authConfig = new AuthConfig({
//         noJwtError: true,
//         globalHeaders: [{ Accept: 'application/json' }],
//         tokenGetter: () => localStorage.getItem(consts.localStorageAccessToken),
//     });

//     return new JwtHttp(new JwtConfigService(jwtOptions, authConfig), http, options);
// }
export function tokenGetter(request) {
    return localStorage.getItem(Configuration.LOCAL_STORAGE_ACCESS_TOKEN);
}
