import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

@Injectable()
export class FormLayoutBuilderEffects {
    constructor(
        private actions$: Actions,
    ) { }
}
