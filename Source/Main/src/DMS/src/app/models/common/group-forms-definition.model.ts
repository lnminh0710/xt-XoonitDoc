import { AbstractFormDefinition } from './abstract-form-definition.model';
import { DataGrid } from './data-grid.model';

export interface GroupFormsDefinition extends AbstractFormDefinition {
    formDefinitions: AbstractFormDefinition[];
    isHorizontal: boolean;
    /**
     * !Right now we just support group of form table definition
     */
    dataGrids?: DataGrid[];
}
