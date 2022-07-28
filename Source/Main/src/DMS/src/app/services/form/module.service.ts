import { Injectable, Injector, Inject, forwardRef } from '@angular/core';
import { BaseService } from '../base.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Module, ApiResultResponse } from '@app/models';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { ModuleActions } from '@app/state-management/store/actions';
import { MenuModuleId } from '@app/app.constants';
import { Uti } from '@app/utilities';
import { AccessRightsService } from '@app/services';
import { map } from 'rxjs/operators';

@Injectable()
export class ModuleService extends BaseService {
    constructor(
        injector: Injector,
        private store: Store<AppState>,
        private moduleActions: ModuleActions,
        @Inject(forwardRef(() => AccessRightsService)) private accessRightsService: AccessRightsService,
    ) {
        super(injector);
    }

    private onModuleSelectedSource: BehaviorSubject<Module> = new BehaviorSubject<Module>(null);

    onModuleSelected$ = this.onModuleSelectedSource.asObservable();

    selectModule(module: Module) {
        this.onModuleSelectedSource.next(module);
    }

    getModules(): Observable<ApiResultResponse> {
        return BaseService.cacheService.get(
            this.serUrl.getModules,
            this.get<ApiResultResponse>(this.serUrl.getModules).pipe(
                map((response: ApiResultResponse) => {
                    if (!Uti.isResquestSuccess(response)) {
                        return null;
                    }

                    response.item = response.item ? this.mappingModules(response.item) : [];

                    //Set accessRight for Module
                    this.accessRightsService.SetAccessRightsForModule(response.item);

                    return response;
                }),
            ),
        );
    }

    getDetailSubModule(moduleId: number): Observable<ApiResultResponse> {
        return BaseService.cacheService.get(
            this.serUrl.getDetailSubModule + ':' + moduleId,
            this.get<ApiResultResponse>(this.serUrl.getDetailSubModule, { xenapr_moduleId: moduleId }).pipe(
                map((response: ApiResultResponse) => {
                    if (!Uti.isResquestSuccess(response)) {
                        return null;
                    }

                    response.item = response.item ? this.mappingModules(response.item) : [];

                    //Set accessRight for SubModule
                    this.accessRightsService.SetAccessRightsForSubModule(response.item);

                    return response;
                }),
            ),
        );
    }

    /**
     * loadContentDetailBySelectedModule
     * True:  Changing to other module/submodule
     * False: Keep current module/submodule
     * @param selectedModule
     */
    loadContentDetailBySelectedModule(
        selectedModule: Module,
        activeModule: Module,
        activeSubModule: Module,
        mainModules: Array<Module>,
        isOtherDataWithSameModule: boolean = false,
    ): boolean {
        if (!selectedModule) {
            return false;
        }

        // if same record in 1 module return false
        if (activeModule && activeModule.idSettingsGUI == selectedModule.idSettingsGUI && !isOtherDataWithSameModule) {
            return false;
        }
        if (activeSubModule && activeSubModule.idSettingsGUI == selectedModule.idSettingsGUI) {
            return false;
        }

        //this.store.dispatch(this.tabSummaryActions.removeAllTabs(selectedModule));

        if (
            selectedModule.idSettingsGUIParent &&
            selectedModule.idSettingsGUIParent !== MenuModuleId.invoiceApprovalMain
        ) {
            let mainModule: Module = activeModule;
            if (selectedModule.idSettingsGUIParent !== mainModule.idSettingsGUI) {
                mainModule = mainModules.find((md) => md.idSettingsGUI === selectedModule.idSettingsGUIParent);
                if (mainModule) {
                    this.store.dispatch(this.moduleActions.requestChangeModule(mainModule));
                } else {
                    switch (selectedModule.idSettingsGUIParent) {
                        case MenuModuleId.logistic:
                            mainModule = mainModules.find((md) => md.idSettingsGUI === MenuModuleId.briefe);
                            this.store.dispatch(this.moduleActions.requestChangeModule(mainModule));
                            break;
                        default:
                            break;
                    }
                }
            }

            setTimeout(() => {
                this.store.dispatch(
                    this.moduleActions.requestChangeSubModule(mainModule?.idSettingsGUI || selectedModule.idSettingsGUIParent, selectedModule.idSettingsGUI),
                );
            }, 200);
        } else {
            this.store.dispatch(this.moduleActions.requestChangeModule(selectedModule));
        }
        return true;
    }

    private mappingModules(modules: Module[]) {
        for (let i = 0; i < modules.length; i++) {
            modules[i] = new Module(modules[i]);

            if (modules[i].children && modules[i].children.length) {
                modules[i].children = this.mappingModules(modules[i].children);
            }
        }

        return modules;
    }

    public getModuleRecursive(modules: Module[], idSettingsGUI) {
        if (modules) {
            for (let i = 0; i < modules.length; i++) {
                if (modules[i].idSettingsGUI === idSettingsGUI) {
                    return modules[i];
                }
                const found = this.getModuleRecursive(modules[i].children, idSettingsGUI);
                if (found) return found;
            }
        }

        return null;
    }
}
