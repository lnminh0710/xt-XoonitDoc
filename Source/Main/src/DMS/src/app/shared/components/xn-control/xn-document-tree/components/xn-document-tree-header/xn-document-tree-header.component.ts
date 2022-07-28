import { Component, OnInit, ChangeDetectorRef, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { XnDocumentTreeService } from '@xn-control/xn-document-tree/services/xn-document-tree.service';
import { IconNames } from '@app/app-icon-registry.service';
import { NotificationPopupActions, LayoutInfoActions, CustomAction } from '@app/state-management/store/actions';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { filter, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';

@Component({
    selector: 'xn-document-tree-header',
    templateUrl: 'xn-document-tree-header.component.html',
    styleUrls: ['xn-document-tree-header.component.scss'],
})
export class XnDocumentTreeHeaderComponent extends BaseComponent implements OnInit, OnDestroy {
    public IconNamesEnum = IconNames;
    @Input() hasCollaspeExpand = true;
    @Input() hasBtnReload = true;
    @Output() reloadTree: EventEmitter<any> = new EventEmitter();
    @Input() hasBtnShowActive = true;
    @Input() hasBtnExpand = true;

    constructor(
        protected router: Router,
        public xnDocumentTreeService: XnDocumentTreeService,
        private cdRef: ChangeDetectorRef,
        private notificationPopupAction: NotificationPopupActions,
        private store: Store<AppState>,
        private dispatcher: ReducerManagerDispatcher,
    ) {
        super(router);
    }

    ngOnInit() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return (
                        action.type === LayoutInfoActions.RESIZE_SPLITTER &&
                        action.module.idSettingsGUI == this.ofModule.idSettingsGUI
                    );
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.store.dispatch(
                    this.notificationPopupAction.updateNotificationPosition({
                        idElement: 'notification-popup-anchor',
                        timeOutRemove: -1,
                    }),
                );
            });
    }

    ngOnDestroy() {
        super.onDestroy();
        this.xnDocumentTreeService.isCollapsedFolder = true;
    }

    public toggleCollapseTree($event: MouseEvent) {
        this.xnDocumentTreeService.structureTreeSettings.isCollapsedTree =
            !this.xnDocumentTreeService.structureTreeSettings.isCollapsedTree;
        this.xnDocumentTreeService.saveStructureTreeSettings(this.xnDocumentTreeService.structureTreeSettings);
        this.store.dispatch(
            this.notificationPopupAction.updateNotificationPosition({
                idElement: 'notification-popup-anchor',
                timeOutRemove: -1,
            }),
        );
        // if collapse tree and folders are expanded (isCollapsedFolder = false)
        // then collapse all folders
        if (
            this.xnDocumentTreeService.structureTreeSettings.isCollapsedTree &&
            !this.xnDocumentTreeService.isCollapsedFolder
        ) {
            this.xnDocumentTreeService.toggleCollapseFolderTree();
            this.cdRef.detectChanges();
        }
    }

    public toggleActiveTreeNodes($event: MouseEvent) {
        this.xnDocumentTreeService.structureTreeSettings.activeFoldersOnly =
            !this.xnDocumentTreeService.structureTreeSettings.activeFoldersOnly;

        this.xnDocumentTreeService.structureTreeSettings.nodesState = Object.assign(
            [],
            this.xnDocumentTreeService.structureTreeSettings.nodesState,
        );

        this.xnDocumentTreeService.saveStructureTreeSettings(this.xnDocumentTreeService.structureTreeSettings);
    }

    public toggleCollapseFolderTree($event) {
        // is Collapsing the tree, we don't let user expand/collapse all folders
        if (this.xnDocumentTreeService.structureTreeSettings.isCollapsedTree) return;

        this.xnDocumentTreeService.toggleCollapseFolderTree();
    }

    public reload() {
        this.reloadTree.emit();
    }
}
