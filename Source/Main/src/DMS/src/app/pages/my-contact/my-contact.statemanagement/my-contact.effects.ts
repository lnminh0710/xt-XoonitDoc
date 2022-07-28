import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { GetContactByKeywordAction, MyContactActionNames, MyContactSuccessAction } from './my-contact.actions';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class MyContactEffects {
    constructor(
        private actions$: Actions,
    ) { }

    @Effect()
    getDocumentsByFolder$ =
        this.actions$
            .pipe(
                ofType(MyContactActionNames.GET_CONTACT_BY_KEYWORD),
                switchMap((action: GetContactByKeywordAction) => {
                    const keyword = action.payload;

                    return of(new MyContactSuccessAction(action.type, keyword));
                })
            );
}
