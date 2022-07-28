import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store, createSelector } from '@ngrx/store';
import { AppState } from '../..';
import { IAppState } from './app.reducer';
import { BaseSelector } from '../base-selector.selector';
import { Observable } from 'rxjs';
import { DropdownListModel, HotKey } from '@app/models';
import { AppActionNames } from '../../actions/app/app.actions';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { NextDocument } from '@app/models/next-document.model';
import { KostnestelleData } from '@app/models/kostneststelle-change.model';

const appState = (state: AppState) => state.app;

const getCompanyList = createSelector(appState, (state: IAppState) => state.companyList);
const getInvoiceDate = createSelector(appState, (state: IAppState) => state.invoiceDate);
const getfolder = createSelector(appState, (state: IAppState) => state.folder);
const getGuarantee = createSelector(appState, (state: IAppState) => state.isGuarantee);
const getHotKey = createSelector(appState, (state: IAppState) => state.hotKey);
const getNextDocument = createSelector(appState, (state: IAppState) => state.nextDocument);
const getUrgentState = createSelector(appState, (state: IAppState) => state.urgentState);

const getKostnestelleChange = createSelector(appState, (state: IAppState) => state.kostnestelleChange);
const getInvoiceIncludeExchanged = createSelector(appState, (state: IAppState) => state.invoiceIncludeExchanged);

@Injectable()
export class AppSelectors extends BaseSelector {
    public companyList$: Observable<DropdownListModel[]>;
    public invoiceDate$: Observable<Date>;
    public folder$: Observable<DocumentTreeModel>;
    public isGuarantee$: Observable<boolean>;
    public hotKey$: Observable<HotKey>;
    public nextDocument$: Observable<NextDocument>;
    public urgentState$: Observable<boolean>;
    public kostnestelleChange$: Observable<KostnestelleData>;
    public invoiceIncludeExchanged$: Observable<string>;

    constructor(private store: Store<AppState>, protected actions: Actions) {
        super(actions, AppActionNames.APP_SUCCESS_ACTION, AppActionNames.APP_FAILED_ACTION);
        this.companyList$ = this.store.select(getCompanyList);
        this.invoiceDate$ = this.store.select(getInvoiceDate);
        this.folder$ = this.store.select(getfolder);
        this.isGuarantee$ = this.store.select(getGuarantee);
        this.hotKey$ = this.store.select(getHotKey);
        this.nextDocument$ = this.store.select(getNextDocument);
        this.urgentState$ = this.store.select(getUrgentState);
        this.kostnestelleChange$ = this.store.select(getKostnestelleChange);
        this.invoiceIncludeExchanged$ = this.store.select(getInvoiceIncludeExchanged);
    }
}
