import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { PersonService, UserService } from '@app/services';
import {
    AppActionNames,
    GetCompanyListAction,
    AppSuccessAction,
    AppFailedAction,
} from '@app/state-management/store/actions/app/app.actions';

@Injectable()
export class AppEffects {
    constructor(private actions$: Actions, private personService: PersonService, private userService: UserService) {}

    // @Effect()
    // getScanningHistory$ = this.actions$
    //     .ofType(AppActionNames.GET_COMPANY_DROPDOWN_LIST)
    //     .switchMap((action: GetCompanyListAction) => {
    //         return this.personService
    //             .getCompanyList()
    //             .map((data) => {
    //                 return new AppSuccessAction(action.type, data);
    //             })
    //             .catch((err) => Observable.of(new AppFailedAction(action.type, err)));
    //     });

    // @Effect({ dispatch: false })
    // setCurrentUser$ = this.actions$
    //     .ofType(AppActionNames.SET_CURRENT_USER)
    //     .map((action: SetCurrentUserAction) => {
    //         this.userService.setCurrentUser(action.payload);
    //     });
}
