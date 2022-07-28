import { Observable } from 'rxjs/Observable';
import { ColumnDefinition } from '../column-definition.model';

export interface TypeaheadDefinition<T> extends ColumnDefinition {
    dataSource$: Observable<T[]>;
    typeaheadValue: string;
    typeaheadOptionField: string;
    typeaheadWaitMs: number;
}
