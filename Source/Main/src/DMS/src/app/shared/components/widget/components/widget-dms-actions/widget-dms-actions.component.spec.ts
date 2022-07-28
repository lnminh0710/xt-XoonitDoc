import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Configuration, GlobalSettingConstant } from '@app/app.constants';
import { AppErrorHandler, AuthenticationService, CommonService, GlobalSettingService, ModalService, ResourceTranslationService, UserService } from '@app/services';
import { AdministrationDocumentActionNames, AdministrationDocumentActions, ModalActions, ModuleActions } from '@app/state-management/store/actions';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { WidgetDmsActionsComponent } from './widget-dms-actions.component';
import * as uti from '@app/utilities';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { Actions, EffectsModule } from '@ngrx/effects';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import { BehaviorSubject } from 'rxjs';
import { ErrorHandler } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTooltipModule } from '@xn-control/light-material-ui/tooltip';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { LanguageSelectorModule } from '@app/xoonit-share/components/language-selector/language-selector.module';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { AppGlobalActionNames, ExpandDocumentFormGlobalAction } from '@app/state-management/store/actions/app-global/app-global.actions';

describe('WidgetDmsActionsComponent', () => {
    let component: WidgetDmsActionsComponent;
    let fixture: ComponentFixture<WidgetDmsActionsComponent>;
    let store: Store<any>;
    let activatedRoute: ActivatedRoute;

    const mockSelector = {
        folder$: { pipe: () => of({}), },
        actionSuccessOfSubtype$(action: AdministrationDocumentActionNames) { return of({}); },
        actionOfType$(action: AdministrationDocumentActionNames) { return of({}); },
    };
    const initState = { processDataState: { features: { Processing: {} } } };
    const mockAppSelector = {
        select: jasmine.createSpy().and.returnValue(of(initState)),
        dispatch:  jasmine.createSpy(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                WidgetDmsActionsComponent
            ],
            imports: [
                CommonModule,
                RouterModule,
                BrowserModule,
                RouterTestingModule,
                MatButtonModule,
                MatIconModule,
                StoreModule.forRoot({}),
                BrowserAnimationsModule,
                EffectsModule.forRoot([]),
                ToasterModule.forRoot(),
                HttpClientModule,
                HttpClientTestingModule,
                XnTranslationModule,
                TranslateModule.forRoot({}),
                LanguageSelectorModule,
                MatTooltipModule,
                TooltipModule.forRoot(),
            ],
            providers: [
                uti.Uti,
                uti.XnErrorMessageHelper,
                GlobalSettingService,
                GlobalSettingConstant,
                Configuration,
                { provide: JwtHelperService, useFactory: () => new JwtHelperService() },
                AuthenticationService,
                ModuleActions,
                Store,
                TranslateService,
                ResourceTranslationService,
                UserService,
                AppErrorHandler,
                AdministrationDocumentActions,
                AdministrationDocumentSelectors,
                { provide: AdministrationDocumentSelectors, useValue: mockSelector },
                { provide: Store, useValue: mockAppSelector },
                Actions,
                ToasterService,
                { provide: ErrorHandler, useClass: AppErrorHandler },
                CommonService,
                ModalService,
                ModalActions,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of({}),
                        params: of({}),
                        snapshot: {},
                    },
                }
            ],
        });
        fixture = TestBed.createComponent(WidgetDmsActionsComponent);
        store = fixture.debugElement.injector.get(Store);
        component = fixture.componentInstance;
        activatedRoute = TestBed.inject(ActivatedRoute);

        const restService = TestBed.inject(UserService);
        const data = {
            id: '1',
            loginName: 'test',
            password: '',
            fullName: '',
            firstname: '',
            lastname: '',
            email: '',
            creationDate: '',
            preferredLang: '',
            lastLoginDate: new Date(),
            loginPicture: '',
            nickName: '',
            loginMessage: '',
            color: '',
            idCloudConnection: '',
            idApplicationOwner: '',
            initials: '',
            company: '',
            idPerson: '',
            phoneNr: '',
            dateOfBirth: '',
            roleName: '',
            encrypted: '',
            getName() {
                return '';
            }
        }

        spyOn(restService, 'getCurrentUser').and.returnValues(data);

        fixture.detectChanges();
    });


    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('checkQueryParam', () => {
        it('check param', () => {
            component.checkParamUrl();
            expect(component.isApprovalModule).toBeFalsy();
            expect(component.isDocumentModule ).toBeFalsy();
            expect(component.isDisplayToggle ).toBeTruthy();
        });

    });

    describe('saveGlobal func', () => {
        it('saveGlobal with isSaving null', () => {
            const event = '123';
            expect(component.saveGlobal(event)).toBeUndefined();
        });

        it('saveGlobal with isSaving true', () => {
            component.isSaving = true;
            component.idDocumentTree = 1;
            component.idDocumentContainerScans = 2;
            component.idDocumentType = 4;
            const event = '123';

            fixture.detectChanges();

            component.saveGlobal(event);
        });
    });

    describe('deleteGlobal func', () => {
        it('deleteGlobal is success', () => {
            const event = '123';
            component.deleteGlobal(event);
            fixture.detectChanges();

            expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ type: AppGlobalActionNames.APP_DELETE_GLOBAL }));

        });

    });

    describe('expandDocumentFormGlobal func', () => {
        it('expandDocumentFormGlobal is failed', () => {
            const event = '123';
            component.btnExpandDocumentForm.disabled = false;
            expect(component.expandDocumentFormGlobal(event)).toBeUndefined();
        });

        it('expandDocumentFormGlobal is success', () => {
            const event = '123';
            component.btnExpandDocumentForm.disabled = true;
            const payload = {
                isExpanded: true,
                acknowledge: (ack: boolean) => { },
            };
            const action = new ExpandDocumentFormGlobalAction(payload);

            component.expandDocumentFormGlobal(event);
            store.dispatch(new ExpandDocumentFormGlobalAction(payload));
            expect(store.dispatch).toHaveBeenCalledWith(
                action
            );
        });
    });

    describe('_disableBtnExpandDocumentForm func', () => {
        it('_disableBtnExpandDocumentForm is success', () => {
            expect(component.btnExpandDocumentForm.disabled).toBeFalsy();
        });
    });

    describe('getsaveDmsActionToggleSettings func', () => {
        it('getsaveDmsActionToggleSettings is success', () => {
            component.isDisplayWidget = true;
            const restService = TestBed.inject(GlobalSettingService);
            const payload = {
                isExpanded: component.isDisplayWidget,
                acknowledge: (ack: boolean) => { },
            };
            const action = new ExpandDocumentFormGlobalAction(payload);

            const data = {
                idSettingsGlobal: 1,
                objectNr: '',
                globalName: '',
                globalType: '',
                description: '',
                jsonSettings: '',
                isActive: false,
                idSettingsGUI: '',
            };
            spyOn(restService, 'getAllGlobalSettings').and.returnValues(of([data]));
            component.getsaveDmsActionToggleSettings();
            store.dispatch(new ExpandDocumentFormGlobalAction(payload));
            expect(store.dispatch).toHaveBeenCalledWith(
                action
            );
        });

        it('getsaveDmsActionToggleSettings is failed', () => {
            component.isDisplayWidget = false;
            const payload = {
                isExpanded: component.isDisplayWidget,
                acknowledge: (ack: boolean) => { },
            };
            const action = new ExpandDocumentFormGlobalAction(payload);

            component.getsaveDmsActionToggleSettings();
            store.dispatch(new ExpandDocumentFormGlobalAction(payload));
            expect(store.dispatch).toHaveBeenCalledWith(
                action
            );
        });
    });


    describe('saveDmsActionToggleSetting func', () => {
        it('saveDmsActionToggleSetting is success', () => {
            component.isDisplayWidget = true;
            const restService = TestBed.inject(GlobalSettingService);
            const payload = {
                isExpanded: component.isDisplayWidget,
                acknowledge: (ack: boolean) => { },
            };
            const action = new ExpandDocumentFormGlobalAction(payload);

            const data = {
                idSettingsGlobal: 1,
                objectNr: '',
                globalName: 'DmsActionToggle',
                globalType: '',
                description: '',
                jsonSettings: '',
                isActive: false,
                idSettingsGUI: '',
            };
            spyOn(restService, 'getAllGlobalSettings').and.returnValues(of([data]));
            component.saveDmsActionToggleSetting(true);
        });
    });
});
