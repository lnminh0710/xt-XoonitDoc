import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { AdministrationDocumentActions } from '@app/state-management/store/actions/administration-document';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { Subscription } from 'rxjs';
import { ModuleOverview, WidgetDetail } from '@app/models';
import { Uti } from '@app/utilities';
import { groupBy, chain } from 'lodash-es';

@Component({
    selector: 'widget-modules-overview',
    templateUrl: './widget-modules-overview.component.html',
    styleUrls: ['./widget-modules-overview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetModulesOverviewComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {

    private modulesOverviewSubscription: Subscription;
    public modules: ModuleOverview[];

    @Input() dataSource: WidgetDetail;

    constructor(
        protected router: Router,
        private store: Store<AppState>,
        private administrationDocumentActions: AdministrationDocumentActions,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private cdRef: ChangeDetectorRef,
    ) {
        super(router);
    }

    ngOnInit(): void {
        this.cdRef.detach();
        this.registerSubscriptions();
    }

    ngOnChanges(changes: SimpleChanges): void {
        let hasChanged: boolean;
        hasChanged = hasChanged || this.onDataSourceChanged(changes);

        if (!hasChanged) return;

        this.cdRef.detectChanges();
    }

    ngOnDestroy(): void {
        Uti.unsubscribe(this);
    }

    private registerSubscriptions() {

    }

    private onDataSourceChanged(changes: SimpleChanges): boolean {
        if (!changes.dataSource) return false;

        const mapModuleOverviewModel = (values, key): ModuleOverview => {
            const moduleOverview = new ModuleOverview();
            moduleOverview.title = key;

            // TO DO => FIX LATER => check how many fields are completed if value is not null
            moduleOverview.totalFields = values.length;
            moduleOverview.completedFields = 0;
            moduleOverview.values = values;

            for (let i = 0; i < values.length; i++) {
                const obj = values[i];
                moduleOverview.completedFields += obj.Value ? 1 : 0;
            }
            return moduleOverview;
        }

        const _dataSource = changes.dataSource.currentValue;
        if (!_dataSource.contentDetail || !_dataSource.contentDetail.data || !_dataSource.contentDetail.data.length) return;

        const columns = _dataSource.contentDetail.data[1];
        const modulesOverview = chain(columns)
                                .groupBy(data => data.GroupField)
                                .map((value, key) => mapModuleOverviewModel(value, key))
                                .value();

        this.modules = modulesOverview;
        this.store.dispatch(this.administrationDocumentActions.setModulesOverview(modulesOverview));
        return true;
    }
}
