import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { FileService } from '@app/services';

@Injectable()
export class ExportEffects {
    constructor(
        private actions$: Actions,
        private fileService: FileService,
    ) { }
}
