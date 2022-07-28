import { Actions, ofType } from '@ngrx/effects';
import { map, filter } from 'rxjs/operators';

export class BaseSelector {
    constructor(protected actions$: Actions, protected actionSuccessType: string, protected actionFailedType: string) {}

    public actionSuccessOfSubtype$ = (...typeNames: string[]) =>
        this.actions$.pipe(
            ofType(this.actionSuccessType),
            filter((a) => typeNames.includes((a as any).subType)),
        );

    public actionFailedOfSubtype$ = (...typeNames: string[]) =>
        this.actions$.pipe(
            ofType(this.actionFailedType),
            filter((a) => typeNames.includes((a as any).subType)),
        );

    public actionOfType$ = (...typeNames: string[]) => this.actions$.pipe(filter((a) => typeNames.includes(a.type)));
}
