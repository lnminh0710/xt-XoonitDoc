import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppErrorHandler } from '@app/services';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import {
	TabSummaryActions,
	TabButtonActions
} from '@app/state-management/store/actions';
import { BaseComponent } from '@app/pages/private/base';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import * as tabButtonReducer from '@app/state-management/store/reducer/tab-button';
import { Uti } from '@app/utilities';

@Component({
	selector: 'xn-tab-header-sub-form',
	styleUrls: ['./xn-tab-header-sub-form.component.scss'],
	templateUrl: './xn-tab-header-sub-form.component.html',
})

export class XnTabHeaderSubFormComponent extends BaseComponent implements OnInit, OnDestroy {
	public isMainActive = false;
	public textData = {
		main: {
			title: '',
			toolbar: null
		},
		detail: {
			title: '',
			toolbar: null
		}
	};
	public currentAction: string = null;

	private formEditTextDataSubTabState: Observable<any>;
	private formEditDataActiveSubTabState: Observable<any>;
	private currentActionState: Observable<string>;

	private formEditTextDataSubTabStateSubscription: Subscription;
	private formEditDataActiveSubTabStateSubscription: Subscription;
	private currentActionStateSubscription: Subscription;

	@Input() isTabCollapsed = false;
	@Input() setting: any;

	constructor(
		private store: Store<AppState>,
		private appErrorHandler: AppErrorHandler,
		private tabSummaryActions: TabSummaryActions,
		private tabButtonActions: TabButtonActions,
		protected router: Router
	) {
		super(router);

		this.formEditTextDataSubTabState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).formEditTextDataSubTab);
		this.formEditDataActiveSubTabState = store.select(state => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).formEditActiveSubTab);
		this.currentActionState = store.select(state => tabButtonReducer.getTabButtonState(state, this.ofModule.moduleNameTrim).currentAction);
	}

	ngOnInit() {
		this.subScribeFormEditTextDataSubTab();
		this.subScribeEditFormTabActive();
		this.subScribeCurrentAction();
	}

	ngOnDestroy() {
		Uti.unsubscribe(this);
	}

	private subScribeFormEditTextDataSubTab() {
		this.formEditTextDataSubTabStateSubscription = this.formEditTextDataSubTabState.subscribe((formEditTextDataSubTab: any) => {
			this.appErrorHandler.executeAction(() => {
				if (!formEditTextDataSubTab) return;
				this.textData.main.title = formEditTextDataSubTab.main;
				this.textData.detail.title = formEditTextDataSubTab.detail;
				this.textData.main.toolbar = this.setting ? this.setting.Content.CustomTabs[0].Toolbar : null;
				this.textData.detail.toolbar = this.setting ? this.setting.Content.CustomTabs[1].Toolbar : null;
			});
		});
	}

	private subScribeEditFormTabActive() {
		this.formEditDataActiveSubTabStateSubscription = this.formEditDataActiveSubTabState.subscribe((formEditActiveSubTab: any) => {
			this.appErrorHandler.executeAction(() => {
				if (!formEditActiveSubTab)
					return;

				this.isMainActive = formEditActiveSubTab.isMainActive;

				if (this.isMainActive) {
					this.store.dispatch(this.tabSummaryActions.selectSubTab(this.textData.main, this.ofModule));
				} else {
					this.store.dispatch(this.tabSummaryActions.selectSubTab(this.textData.detail, this.ofModule));
				}
			});
		});
	}

	private subScribeCurrentAction() {
		this.currentActionStateSubscription = this.currentActionState.subscribe((currentActionState: string) => {
			this.appErrorHandler.executeAction(() => {
				this.currentAction = currentActionState;
			});
		});
	}

	public onClickMainStep(tab: any) {
		this.store.dispatch(this.tabSummaryActions.setFormEditSubTab1Click(this.ofModule));
		this.store.dispatch(this.tabSummaryActions.selectSubTab(tab, this.ofModule));

		if (event && event.type == 'dblclick') {
			this.store.dispatch(this.tabButtonActions.dblClickTabHeader(this.ofModule));
		}
	}

	public onClickDetailStep(tab: any) {
		this.store.dispatch(this.tabSummaryActions.setFormEditSubTab2Click(this.ofModule));
		this.store.dispatch(this.tabSummaryActions.selectSubTab(tab, this.ofModule));

		if (event && event.type == 'dblclick') {
			this.store.dispatch(this.tabButtonActions.dblClickTabHeader(this.ofModule));
		}
	}
}
