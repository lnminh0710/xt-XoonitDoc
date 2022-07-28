import { CdkDragStart, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DragItemTypeEnum } from '../../models/drag-item-type.enum';
import { IDragItem } from '../../models/drag-item.interface';
import { FormLayoutBuilderSelectors } from '@app/pages/form-layout-builder/form-layout-builder.statemanagement/form-layout-builder.selectors';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { SetZoneControlTemplateContainerIdAction } from '../../form-layout-builder.statemanagement/form-layout-builder.actions';

@Component({
    selector: 'control-templates',
    styleUrls: ['control-templates.component.scss'],
    templateUrl: 'control-templates.component.html',
})
export class ControlTemplatesComponent extends BaseComponent implements OnInit {
    @Input() dragControls: IDragItem[];

    @ViewChild(CdkDropList, { static: true }) cdkDropList: CdkDropList<IDragItem>;

    constructor(
        protected router: Router,
        private formLayoutBuilderSelectors: FormLayoutBuilderSelectors,
        private store: Store<AppState>,
    ) {
        super(router);
    }

    ngOnInit() {
        this._registerSubscriptions();
        // because we use static: true to inject CdkDropList at first initial, so we already had this.cdkDropList instance
        // in lifecycle OnInit
        this.store.dispatch(new SetZoneControlTemplateContainerIdAction({ containerId: this.cdkDropList.id }));
    }

    private _registerSubscriptions() {
        this.formLayoutBuilderSelectors.zoneContainerIds$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((zoneContainerIds) => {
                this.cdkDropList.connectedTo = [...zoneContainerIds];
            });
    }

    public dragStarted($event: CdkDragStart<IDragItem>) {
        const dragItemType = $event.source.data.dragItemType;
        switch (dragItemType) {
            case DragItemTypeEnum.GROUP_PANEL:
                break;

            case DragItemTypeEnum.ROW:
                break;

            case DragItemTypeEnum.COLUMN:
                break;

            default:
                break;
        }
    }
}
