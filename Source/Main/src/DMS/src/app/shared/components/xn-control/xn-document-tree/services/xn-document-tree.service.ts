import { Injectable, OnDestroy } from '@angular/core';
import { StructureTreeSettingsStateModel, TreeNodeState } from '@app/state-management/store/models/app-global/state/structure-tree-settings.state.model';
import { AppGlobalSelectors } from '@app/state-management/store/reducer';
import { ReplaySubject, Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { takeUntil, take, switchMap } from 'rxjs/operators';
import { GlobalSettingService, AppErrorHandler, BaseService } from '@app/services';
import { GlobalSettingConstant, MenuModuleId, ServiceUrl } from '@app/app.constants';
import { GlobalSettingModel } from '@app/models';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { SaveStructureTreeSettingsGlobalAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { MatIconRegistry } from '@xn-control/light-material-ui/icon';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { TreeConstants } from './tree-constants.const';
import { cloneDeep } from 'lodash-es';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';

@Injectable()
export class XnDocumentTreeService extends BaseComponent implements OnDestroy {
    private readonly _prefixResourceCache = 'RESOURCE_CACHE_XN_DOCUMENT_TREE_SERIVCE';
    private readonly _cacheKeyMatIconRegistry = 'XnDocumentTreeService_';
    private _onDestroy = new ReplaySubject<boolean>();
    private _toggleCollapseFolderTreeSubject = new Subject<boolean>();
    private _structureSettingsChangedSubject = new BehaviorSubject<StructureTreeSettingsStateModel>(null);

    public structureTreeSettings: StructureTreeSettingsStateModel;
    public isCollapsedFolder = true;
    public getToggleCollapseFolderTree$ = this._toggleCollapseFolderTreeSubject.asObservable();
    public get structureSettingsChanged$() {
        return this._structureSettingsChangedSubject.asObservable();
    }

    constructor(
        private appGlobalSelectors: AppGlobalSelectors,
        private globalSettingService: GlobalSettingService,
        private globalSettingConstant: GlobalSettingConstant,
        private appErrorHandler: AppErrorHandler,
        private store: Store<AppState>,
        private httpClient: HttpClient,
        private matIconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private serviceUrl: ServiceUrl,
        protected router: Router,
    ) {
        super(router);

        this.appGlobalSelectors.structureTreeSettings$
            .pipe(
                takeUntil(this._onDestroy.asObservable())
            ).subscribe((settings) => {
                this.structureTreeSettings = settings;
                this._structureSettingsChangedSubject.next(settings);
            });

    }

    ngOnDestroy(): void {
        this._onDestroy.next(true);
    }

    public saveStructureTreeSettings(settings: StructureTreeSettingsStateModel, dispatched: boolean = true): void {
        this.globalSettingService
            .getAllGlobalSettings('-1')
            .pipe(take(1))
            .subscribe((data: any) => {
                this.appErrorHandler.executeAction(() => {
                    let found = data.find((x) => x.globalName === this.globalSettingConstant.structureTreeSettings);
                    if (!found) {
                        found = new GlobalSettingModel({
                            globalName: this.globalSettingConstant.structureTreeSettings,
                            description: 'Structure Tree Toggle Show Active/Inactive Folders',
                            globalType: this.globalSettingConstant.structureTreeSettings,
                        });
                    }
                    found.idSettingsGUI = -1;
                    found.jsonSettings = JSON.stringify(settings);
                    found.isActive = true;

                    this.globalSettingService
                        .saveGlobalSetting(found)
                        .subscribe((response) => this.globalSettingService.saveUpdateCache(-1, found, response));

                    if (!dispatched) return;

                    this.store.dispatch(
                        new SaveStructureTreeSettingsGlobalAction({
                            activeFoldersOnly: settings.activeFoldersOnly,
                            isCollapsedTree: settings.isCollapsedTree,
                            nodesState: settings.nodesState,
                        }),
                    );
                });
            });
    }

    public getStructureTreeSettings() {
        const idSettingsGUI = this.ofModule.idSettingsGUI === MenuModuleId.processing ? '-1' : null;
        this.globalSettingService.getAllGlobalSettings(idSettingsGUI).subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                if (data && data.length) {
                    const found = data.find((x) => x.globalName === this.globalSettingConstant.structureTreeSettings);
                    if (!found) {
                        return;
                    }

                    const setting = JSON.parse(found.jsonSettings);
                    this.store.dispatch(new SaveStructureTreeSettingsGlobalAction(setting));
                }
            });
        });
    }

    public toggleCollapseFolderTree() {
        this.isCollapsedFolder = !this.isCollapsedFolder;
        this._toggleCollapseFolderTreeSubject.next(this.isCollapsedFolder);
    }

    public getFolderIcon(folder: DocumentTreeModel): Observable<string> {
        folder.icon = folder.icon || TreeConstants.DEFAULT_ROOT_FOLDER_ICON;
        const keyCache = this._prefixResourceCache + '_' + folder.icon;

        const consumer = this._getIconFromCache(keyCache, folder);

        const observable = consumer.pipe(
            switchMap((resource: string) => {
                this.matIconRegistry.addSvgIconLiteral(
                    this._cacheKeyMatIconRegistry + folder.icon,
                    this.sanitizer.bypassSecurityTrustHtml(resource),
                );

                return of(this._cacheKeyMatIconRegistry + folder.icon);
            }),
            take(1),
        );

        observable.pipe(take(1)).subscribe(() => {
            // should leave this code here. Please dont' remove
            // work arround to fix bug to get icon from cache
            // Issue occurs when it subscribe
            // after sourceStream (Subject) emit value from fallback (variable from cacheService)
        });

        return observable;
    }

    public initialRootNodesState(rootNodes: DocumentTreeModel[]): TreeNodeState[] {
        if (!rootNodes || !rootNodes.length) return [];

        return rootNodes.map((rootNode) => {
            return {
                children: [],
                visible: true,
                idDocument: rootNode.idDocument,
                order: rootNode.order,
            };
        })
    }

    public reorderRootFolderPosition(rootNodes: DocumentTreeModel[]) {
        if (!rootNodes || !rootNodes.length) {
            return;
        }
        if (!this.structureTreeSettings || !this.structureTreeSettings.nodesState || !this.structureTreeSettings.nodesState.length) {
            return;
        }

        this.structureTreeSettings.nodesState.forEach((nodeState: TreeNodeState, index: number) => {
            if (rootNodes[index]?.idDocument === nodeState.idDocument) {
                nodeState.order = index + 1;
            }
        });

        this.saveStructureTreeSettings(this.structureTreeSettings, false);
    }

    public deleteNodesState(nodeIds: number[]) {
        const rootNodesState = cloneDeep(this.structureTreeSettings.nodesState) as TreeNodeState[];
        this._removeNodes(nodeIds, rootNodesState);

        this.structureTreeSettings.nodesState = rootNodesState;
        this.saveStructureTreeSettings(this.structureTreeSettings, false);
    }

    private findNodesState(nodeIds: number[], rootNodesState: TreeNodeState[]): TreeNodeState[] {
        const result: TreeNodeState[] = [];
        if (!nodeIds || !nodeIds.length) return result;

        if (!rootNodesState || !rootNodesState.length) return result;

        this._findNodes(nodeIds, rootNodesState, result);
        return result;
    }

    private _findNodes(nodeIds: number[], rootNodesState: TreeNodeState[], result: TreeNodeState[]) {
        if (!rootNodesState) return;

        for (let i = 0; i < rootNodesState.length; i++) {
            const nodeState = rootNodesState[i];
            if (nodeIds.indexOf(nodeState.idDocument)) {
                result.push(nodeState);
            }

            if (nodeState.children && nodeState.children.length) {
                this._findNodes(nodeIds, nodeState.children, result);
            }
        }
    }

    private _removeNodes(nodeIds: number[], rootNodesState: TreeNodeState[]) {
        if (!rootNodesState || !nodeIds) return;

        for (let i = 0; i < rootNodesState.length; i++) {
            if (!nodeIds.length) {
                return;
            }

            const nodeState = rootNodesState[i];
            const foundIndex = nodeIds.indexOf(nodeState.idDocument);
            if (foundIndex !== -1) {
                rootNodesState.splice(i, 1);
                nodeIds.splice(foundIndex, 1);
                continue;
            }

            if (nodeState.children && nodeState.children.length) {
                this._removeNodes(nodeIds, nodeState.children);
            }
        }
    }

    private _getIconFromCache(key: string, folder: DocumentTreeModel): Observable<string> | Subject<string> {
        const baseUrl = `${this.serviceUrl.getFile}?mode=14&subfolder=28x28&name=`;

        return BaseService.cacheService.get(
            key,
            this.httpClient.get(`${baseUrl + folder.icon}.svg`, { responseType: 'text' }),
        );
    }
}
