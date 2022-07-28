import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store, createSelector } from '@ngrx/store';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { IFormLayoutBuilderState } from './form-layout-builder.state';
import { FormLayoutBuilderActionNames } from './form-layout-builder.actions';
import { Observable } from 'rxjs';
import { IDragItem } from '../models/drag-item.interface';

export const formLayoutBuilderState = createFeatureSelector<IFormLayoutBuilderState>(
    // is a property name of reducers.formBuilderReducer
    'formLayoutBuilderReducer',
);

const getZoneContainerIds = createSelector(
    formLayoutBuilderState,
    (state) => state.zoneContainerIds,
);

const getZoneContainerControlTemplateId = createSelector(
    formLayoutBuilderState,
    (state) => state.zoneControlTemplateId,
);

const getLayoutControlTemplate = createSelector(
    formLayoutBuilderState,
    (state) => state.controls
);

const getCurrentSettingControl = createSelector(
    formLayoutBuilderState,
    (state) => state.currentSettingControl
);

@Injectable()
export class FormLayoutBuilderSelectors extends BaseSelector {
    public zoneContainerIds$: Observable<string[]>;
    public zoneControlTemplateContainerId$: Observable<string>;
    public layoutControls$: Observable<Array<IDragItem>>;
    public currentSettingControl$: Observable<IDragItem>;

    constructor(private store: Store<IFormLayoutBuilderState>, protected actions: Actions) {
        super(
            actions,
            FormLayoutBuilderActionNames.FORM_LAYOUT_BUILDER_SUCCESS_ACTION,
            FormLayoutBuilderActionNames.FORM_LAYOUT_BUILDER_FAILED_ACTION,
        );

        this.zoneContainerIds$ = this.store.select(getZoneContainerIds);
        this.zoneControlTemplateContainerId$ = this.store.select(getZoneContainerControlTemplateId);
        this.layoutControls$ = this.store.select(getLayoutControlTemplate);
        this.currentSettingControl$ = this.store.select(getCurrentSettingControl);
    }
}
