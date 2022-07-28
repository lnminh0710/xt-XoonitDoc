import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { UserProfileService } from '@app/services';
import { HeaderNoticeRef } from '../global-popup/components/header-popup/header-notice-ref';
import { PopupService } from '../global-popup/services/popup.service';

import { cloneDeep, remove, get, differenceBy } from 'lodash-es';

import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@xn-control/light-material-ui/autocomplete';
import { takeUntil, filter as filterOperator, map, startWith } from 'rxjs/operators';
import { CustomAction, UserSelectionPopupActions } from '@app/state-management/store/actions';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable } from 'rxjs';

@Component({
    selector: 'popup-user-selection',
    templateUrl: './widget-user-selection.component.html',
    styleUrls: ['./widget-user-selection.component.scss'],
})
export class UserSelectionComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
    public originalUserList = [];
    public userList = [];
    public userSelected = [];
    public userInput = new FormControl();
    public filteredUsers = [];

    private _callbackFunc: any;
    private _widgetId: any;

    public textValue = 'DisplayName';
    public keyValue = 'UniqueKey';

    @ViewChild('userFilterInput') userFilterInput: ElementRef<HTMLInputElement>;
    @ViewChild('popupUserSelection') popupUserSelection: TemplateRef<any>;
    private _popup: any;

    constructor(
        protected router: Router,
        private popupService: PopupService,
        private userProfileService: UserProfileService,
        private dispatcher: ReducerManagerDispatcher,
        private userSelectionAction: UserSelectionPopupActions,
        private store: Store<AppState>,
    ) {
        super(router);
        this._subscribe();
        this.userInput.valueChanges.takeUntil(super.getUnsubscriberNotifier()).subscribe((res) => {
            const filterText = typeof res === 'string' ? res : res[this.textValue];
            this.filteredUsers = filterText ? this._filter(filterText) : this.userList.slice();
        });
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }

    private _subscribe() {
        this.dispatcher
            .pipe(
                filterOperator((action: CustomAction) => {
                    return action.type === UserSelectionPopupActions.REFRESH_USER_LIST;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe(() => {
                this._getAllUser();
            });

        this.dispatcher
            .pipe(
                filterOperator((action: CustomAction) => {
                    return action.type === UserSelectionPopupActions.OPEN_USER_SELECTION_POPUP;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                if (!!this._popup) {
                    this._popup.close();
                    this._popup = null;
                }
                this._callbackFunc = action.payload.callback;
                this._widgetId = action.payload.widgetId;
                const tempUserList = [];
                action.payload.userSelected.forEach((element) => {
                    element[this.keyValue] = `${element.MemberType}_${element.IdMember}`;
                    tempUserList.push(element);
                });
                this.userSelected = action.payload.excludeSelected ? [] : tempUserList;
                let userList = differenceBy(cloneDeep(this.originalUserList), tempUserList || [], this.keyValue);
                if (action.payload.idExcludeList?.length) {
                    action.payload.idExcludeList.forEach((element) => {
                        const key = `${element.MemberType}_${element.IdMember}`;
                        userList = userList.filter((x) => x[this.keyValue] !== key);
                    });
                }
                this.userList = userList;
                this.filteredUsers = userList;
                if (action.payload.userOnly) {
                    this.userList = this.userList.filter((_u) => _u.MemberType === 'user');
                }
                this.openPopup();
            });
    }

    ngOnInit() {
        this._getAllUser();
    }

    ngAfterViewInit() {}

    public openPopup() {
        const popup = this.popupService.open({
            content: this.popupUserSelection,
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                iconClose: true,
                title: 'Add single user',
                icon: { content: '', type: 'resource' },
            }),
            disableCloseOutside: true,
            optionDrapDrop: true,
            optionResize: true,
            minWidth: 660,
            minHeight: 275,
            defaultHeight: '275px',
            defaultWidth: '660px',
        });

        popup.afterPopupOpened$.subscribe(
            (() => {
                setTimeout(() => {
                    this.userFilterInput?.nativeElement?.focus();
                }, 300);
            }).bind(this),
        );
        popup.afterClosed$.subscribe(
            (() => {
                this._resetState();
            }).bind(this),
        );
        this._popup = popup;
    }

    public addSelectionUser(close = () => undefined) {
        const params = {
            userSelected: this.userSelected,
            widgetId: this._widgetId,
        };
        if (this._callbackFunc && typeof this._callbackFunc === 'function') {
            this._callbackFunc(params);
        } else {
            this.store.dispatch(this.userSelectionAction.closeUserSelectionPopup(params));
        }
        close();
    }

    public removeUser(user: any): void {
        remove(this.userSelected, user);
        this.userList.push(user);
        this.filteredUsers.push(user);
    }

    public selected(event: MatAutocompleteSelectedEvent): void {
        const user = event.option.value;
        this.userSelected.push(user);
        this.userInput.setValue('');
        this.userList = this.userList.filter((x) => x !== user);
        this.filteredUsers = this.filteredUsers.filter((x) => x !== user);
    }

    private _getAllUser() {
        this.userProfileService.getAllUserAndGroups().subscribe((response: any) => {
            const users = get(response, ['item', 0]) || [];
            users.forEach((element) => {
                element['UniqueKey'] = `${element.MemberType}_${element.IdMember}`;
            });
            this.userList = cloneDeep(users);
            this.originalUserList = cloneDeep(users);
        });
    }

    private _resetState() {
        this.userList = [];
        this.userSelected = [];
        this._callbackFunc = null;
        this._widgetId = null;
        this._popup = null;
        this.userInput.setValue('');
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.userList.filter((user) => user[this.textValue].toLowerCase().includes(filterValue));
    }
}
