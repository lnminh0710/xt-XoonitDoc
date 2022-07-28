import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiMethodResultId, Configuration } from '@app/app.constants';
import { ApiResultResponse, Module } from '@app/models';
import { AccessRightsService, AuthenticationService, ModuleService, UserService } from '@app/services';
import { CustomAction, ModuleActions } from '@app/state-management/store/actions';
import { Uti } from '@app/utilities';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Actions, EffectsMetadata, getEffectsMetadata } from '@ngrx/effects';
import { ScannedActionsSubject, StateObservable, Store, StoreModule } from '@ngrx/store';
import { of, ReplaySubject } from 'rxjs';
import { MainModuleEffects } from './main-module.effect';
import { provideMockActions } from '@ngrx/effects/testing';

describe('MainModuleEffects', () => {
    let effect: MainModuleEffects;
    let actions: ReplaySubject<any>;
    let moduleActions: ModuleActions;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                StoreModule.forRoot({}),
                RouterModule,
                RouterTestingModule,
            ],
            declarations: [
            ],
            providers: [
                { provide: JwtHelperService, useFactory: () => new JwtHelperService() },
                Actions,
                ScannedActionsSubject,
                Store,
                ModuleActions,
                MainModuleEffects,
                provideMockActions(() => actions),
                ModuleService,
                AccessRightsService,
                UserService,
                AuthenticationService,
                Configuration,
                Uti
            ]
        });

        effect = TestBed.inject(MainModuleEffects);
        moduleActions = TestBed.inject(ModuleActions);
    });

    it('should be created', () => {
        expect(effect).toBeTruthy();
    });

    describe('loadMainModules', () => {
        it('reponse data invalid, return null', () => {
            // mock service
            const restService = TestBed.inject(ModuleService);
            const data = null;
            spyOn(restService, 'getModules').and.returnValue(of(data));

            actions = new ReplaySubject(1);
            actions.next(moduleActions.loadMainModules());

            effect.loadMainModules$.subscribe(result => {
                expect(result).toBeNull();
            });

        });

        it('reponse data valid, loadMainModulesSuccess is call', () => {
            // mock service
            const restModuleService = TestBed.inject(ModuleService);
            const data = <ApiResultResponse>{ statusCode: ApiMethodResultId.Success, item: { data: true } };
            spyOn(restModuleService, 'getModules').and.returnValue(of(data));

            // mock ModuleService
            const restModuleActions = TestBed.inject(ModuleActions);
            const result = <CustomAction>{
                type: ModuleActions.LOAD_MAIN_MODULES_SUCCESS,
                payload: <Module>{ idSettingsGUI: 1 }
            }
            spyOn(restModuleActions, 'loadMainModulesSuccess').and.returnValue(result);

            actions = new ReplaySubject(1);
            actions.next(moduleActions.loadMainModules());

            effect.loadMainModules$.subscribe(res => {
                expect(res).toEqual(result);
            });

        });
    });

    describe('loadSubModules', () => {
        it('reponse data invalid, return null', () => {
            // mock service
            const restService = TestBed.inject(ModuleService);
            const data = null;
            spyOn(restService, 'getDetailSubModule').and.returnValue(of(data));

            actions = new ReplaySubject(1);
            const module = <Module>{ idSettingsGUI: 1 }
            actions.next(moduleActions.activeModule(module));

            effect.loadSubModules$.subscribe(result => {
                expect(result).toBeUndefined();
            });

        });

        it('reponse data valid, getSubModuleSuccess is call', () => {
            // mock service
            const restModuleService = TestBed.inject(ModuleService);
            const data = <ApiResultResponse>{ statusCode: ApiMethodResultId.Success, item: { data: true } };
            spyOn(restModuleService, 'getDetailSubModule').and.returnValue(of(data));

            // mock ModuleService
            const restModuleActions = TestBed.inject(ModuleActions);
            const result = <CustomAction>{
                type: ModuleActions.GET_SUB_MODULE_SUCCESS,
                payload: <Module[]>[{ idSettingsGUI: 1 }]
            }
            spyOn(restModuleActions, 'getSubModuleSuccess').and.returnValue(result);

            actions = new ReplaySubject(1);
            const module = <Module>{ idSettingsGUI: 1 }
            actions.next(moduleActions.activeModule(module));

            effect.loadSubModules$.subscribe(res => {
                expect(res).toEqual(result);
            });
        });
    });
});