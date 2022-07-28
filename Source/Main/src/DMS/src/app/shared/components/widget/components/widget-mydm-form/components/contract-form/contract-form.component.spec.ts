import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ErrorHandler } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Configuration } from '@app/app.constants';
import { AppErrorHandler, CommonService, ModalService } from '@app/services';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';
import { AdministrationDocumentActionNames, AdministrationDocumentActions, ModalActions, ModuleActions } from '@app/state-management/store/actions';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { LanguageSelectorModule } from '@app/xoonit-share/components/language-selector/language-selector.module';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Actions } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatTooltipModule } from '@xn-control/light-material-ui/tooltip';
import { XnDynamicMaterialControlModule } from '@xn-control/xn-dynamic-material-control';
import { XnMaterialAutocompleteControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-autocomplete-control/xn-material-autocomplete-control.component';
import { XnMaterialCheckboxControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-checkbox-control/xn-material-checkbox-control.component';
import { XnMaterialDatepickerControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-datepicker-control/xn-material-datepicker-control.component';
import { XnMaterialInputControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-input-control/xn-material-input-control.component';
import { XnMaterialSelectControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-select-control/xn-material-select-control.component';
import { XnMaterialSelectSearchControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-select-search-control/xn-material-select-search-control.component';
import { XnMaterialSlideToggleControlComponent } from '@xn-control/xn-dynamic-material-control/components/xn-material-slide-toggle-control/xn-material-slide-toggle-control.component';
import { ToasterService } from 'angular2-toaster';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { of } from 'rxjs';
import { ContractFormComponent } from './contract-form.component';

describe('ContractFormComponent', () => {
    let component: ContractFormComponent;
    let fixture: ComponentFixture<ContractFormComponent>;
    let store: Store<any>;

    const mockSelector = {
        allAddons$: { pipe: () => of({}), },
        actionSuccessOfSubtype$(action: AdministrationDocumentActionNames) { return of({}); },
        actionOfType$(action: AdministrationDocumentActionNames) { return of({}); },
    };
    beforeEach(async(() => {

        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                FormsModule,
                RouterModule,
                BrowserModule,
                RouterTestingModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                XnDynamicMaterialControlModule.withComponents([
                    XnMaterialInputControlComponent,
                    XnMaterialAutocompleteControlComponent,
                    XnMaterialDatepickerControlComponent,
                    XnMaterialSelectControlComponent,
                    XnMaterialSlideToggleControlComponent,
                    XnMaterialCheckboxControlComponent,
                    XnMaterialSelectSearchControlComponent,
                ]),
                XnTranslationModule,
                LanguageSelectorModule,
                StoreModule.forRoot({}),
                TranslateModule.forRoot({}),
                BrowserAnimationsModule,
                PerfectScrollbarModule,
                MatIconModule,
                MatTooltipModule,
                TooltipModule.forRoot(),
            ],
            declarations: [
                ContractFormComponent,
            ],
            providers: [
                { provide: JwtHelperService, useFactory: () => new JwtHelperService() },
                Store,
                TranslateService,
                ModuleActions,
                AdministrationDocumentActions,
                AdministrationDocumentSelectors,
                { provide: AdministrationDocumentSelectors, useValue: mockSelector },
                Actions,
                ToasterService,
                { provide: ErrorHandler, useClass: AppErrorHandler },
                CommonService,
                Configuration,
                ModalService,
                ModalActions,
                AppErrorHandler
            ]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(ContractFormComponent);
            store = fixture.debugElement.injector.get(Store);

            component = fixture.componentInstance;
            fixture.detectChanges();
        });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getColumnSettings', () => {
        it('getColumnSettings should be called and action type GET_CONTRACT_COLUMN_SETTING and GET_BANK_CONTACT_COLUMN_SETTING is called', () => {
            spyOn(store, 'dispatch');

            component.getColumnSettings();

            expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ type: AdministrationDocumentActionNames.GET_CONTRACT_COLUMN_SETTING }));
            expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ type: AdministrationDocumentActionNames.GET_BANK_CONTACT_COLUMN_SETTING }));
        });
    })

    describe('reset', () => {
        it('reset should be called and form is set to null', () => {
            spyOn(store, 'dispatch');

            component.reset();

            expect(component.formContract).toBeNull();
            expect(component.formContact).toBeNull();
        });
    })

    describe('registerGetDetailFn', () => {
        it('registerGetDetailFn should be called and form is set to null', () => {
            spyOn(store, 'dispatch');

            component.registerGetDetailFn(() => { return [] });
        });
    })
});