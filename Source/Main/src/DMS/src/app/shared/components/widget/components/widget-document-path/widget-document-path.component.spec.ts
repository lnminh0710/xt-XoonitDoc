import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Configuration } from '@app/app.constants';
import { ModuleList } from '@app/pages/private/base';
import { DocumentImageOcrService } from '@app/pages/private/modules/image-control/services';
import { CommonService, LoadingService, ModalService } from '@app/services';
import { GlobalSearchService } from '@app/services/common/global-search.service';
import { DocumentService } from '@app/services/form/document.service';
import { UserService } from '@app/services/form/user.service';
import { AccessRightsService } from '@app/services/system/access-rights.service';
import { AuthenticationService } from '@app/services/system/authentication.service';
import { AdministrationDocumentEffects } from '@app/state-management/effects/administration-document/administration-document.effect';
import { GlobalSearchActions, ModalActions } from '@app/state-management/store/actions';
import { AdministrationDocumentActions } from '@app/state-management/store/actions/administration-document/administration-document.action';
import { ModuleActions } from '@app/state-management/store/actions/main-module/module.action';
import { administrationDocumentReducer } from '@app/state-management/store/reducer/administration-document/administration-document.reducer';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer/administration-document/administration-document.selectors';
import * as uti from '@app/utilities';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster/src/toaster.service';
import { of } from 'rxjs';
import { WidgetDocumentPathComponent } from './widget-document-path.component';

describe('WidgetDocumentPathComponent', () => {
    let component: WidgetDocumentPathComponent;
    let fixture: ComponentFixture<WidgetDocumentPathComponent>;
    let store: Store<any>;

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
                StoreModule.forRoot({
                    administrationDocumentState: administrationDocumentReducer,
                }),
                EffectsModule.forRoot([
                    AdministrationDocumentEffects,
                ]),
                BrowserAnimationsModule,
                RouterModule.forRoot([]),
            ],
            declarations: [
                WidgetDocumentPathComponent,
            ],
            providers: [
                uti.Uti,
                GlobalSearchService,
                AccessRightsService,
                UserService,
                ModalService,
                AuthenticationService,
                DocumentService,
                LoadingService,
                DocumentImageOcrService,
                CommonService,
                TranslateService,
                ToasterService,
                { provide: JwtHelperService, useFactory: () => new JwtHelperService() },
                AdministrationDocumentSelectors,
                AdministrationDocumentActions,
                ModuleActions,
                ModalActions,
                GlobalSearchActions,
                Configuration,
                Store,
            ]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(WidgetDocumentPathComponent);
            store = fixture.debugElement.injector.get(Store);
            component = fixture.componentInstance;
        });
    }));

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('selectGSRowDbClick first return false', () => {
        component.ofModule.idSettingsGUI = 2;
        fixture.detectChanges();
        const globalSearchAction = TestBed.inject(GlobalSearchActions);
        expect(store.dispatch(globalSearchAction.rowDoubleClick(null))).toBeUndefined();
    });

    it('selectGSRowDbClick switchMap return null', () => {
        component.ofModule.idSettingsGUI = 2;
        fixture.detectChanges();
        const globalSearchAction = TestBed.inject(GlobalSearchActions);
        const payload = {
            selectedModule: {
                idSettingsGUI: ModuleList.AttachmentGlobalSearch.idSettingsGUI,
                subModuleName: ModuleList.AttachmentGlobalSearch.moduleName
            },
            data: {
                idDocumentContainerScans: 1
            }
        };
        expect(store.dispatch(globalSearchAction.rowDoubleClick(payload))).toBeUndefined();
    });

    describe('loadAttachmentFile', () => {
        it('type != ROW_DOUBLE_CLICK', () => {
            fixture.detectChanges();
            const globalSearchAction = TestBed.inject(GlobalSearchActions);
            expect(store.dispatch(globalSearchAction.closeAllTabs())).toBeUndefined();
        });

        it('payload is not exist', () => {
            fixture.detectChanges();
            const globalSearchAction = TestBed.inject(GlobalSearchActions);
            expect(store.dispatch(globalSearchAction.rowDoubleClick(null))).toBeUndefined();
        });

        it('selectedModule is not exist', () => {
            fixture.detectChanges();
            const globalSearchAction = TestBed.inject(GlobalSearchActions);
            expect(store.dispatch(globalSearchAction.rowDoubleClick({}))).toBeUndefined();
        });

        it('idSettingsGUI is not match', () => {
            fixture.detectChanges();
            const globalSearchAction = TestBed.inject(GlobalSearchActions);
            const payload = {
                selectedModule: {
                    idSettingsGUI: ModuleList.Processing.idSettingsGUI,
                },
            };
            expect(store.dispatch(globalSearchAction.rowDoubleClick(payload))).toBeUndefined();
        });

        it('subModuleName is not match', () => {
            fixture.detectChanges();
            const globalSearchAction = TestBed.inject(GlobalSearchActions);
            const payload = {
                selectedModule: {
                    idSettingsGUI: ModuleList.AttachmentGlobalSearch.idSettingsGUI,
                    subModuleName: ModuleList.User.moduleName
                },
            };
            expect(store.dispatch(globalSearchAction.rowDoubleClick(payload))).toBeUndefined();
        });

        it('idDocumentContainerScans is not exist', () => {
            fixture.detectChanges();
            const globalSearchAction = TestBed.inject(GlobalSearchActions);
            const payload = {
                selectedModule: {
                    idSettingsGUI: ModuleList.AttachmentGlobalSearch.idSettingsGUI,
                    subModuleName: ModuleList.AttachmentGlobalSearch.moduleName
                },
                data: {}
            };
            store.dispatch(globalSearchAction.rowDoubleClick(payload));
            expect(component.pathDirectArray).toEqual([]);
        });

        it('documentService return data', () => {
            fixture.detectChanges();
            const globalSearchAction = TestBed.inject(GlobalSearchActions);
            const payload = {
                selectedModule: {
                    idSettingsGUI: ModuleList.AttachmentGlobalSearch.idSettingsGUI,
                    subModuleName: ModuleList.AttachmentGlobalSearch.moduleName
                },
                data: {
                    idDocumentContainerScans: 1
                }
            };
            const documentService = TestBed.inject(DocumentService);
            spyOn(documentService, 'getPathTreeDocument').and.returnValues(of({
                docPath: 'file.xena.local\\test'
            }))
            store.dispatch(globalSearchAction.rowDoubleClick(payload));
            expect(component.pathDirectArray.length).toEqual(2);
        });
    });
});
