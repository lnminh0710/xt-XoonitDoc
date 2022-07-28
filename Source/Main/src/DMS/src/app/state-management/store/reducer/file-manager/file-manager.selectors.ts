import { Injectable } from '@angular/core';
import { BaseSelector } from '../base-selector.selector';
import { Actions } from '@ngrx/effects';
import { FileManagerActionNames } from '@app/state-management/store/actions';

@Injectable()
export class FileManagerSelectors extends BaseSelector {

    constructor(
        protected actions$: Actions,
    ) {
        super(actions$, FileManagerActionNames.FILE_MANAGER_SUCCESS, FileManagerActionNames.FILE_MANAGER_FAILED);
    }
}