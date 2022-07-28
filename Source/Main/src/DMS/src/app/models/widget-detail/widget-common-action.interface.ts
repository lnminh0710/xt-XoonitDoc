import { Observable } from 'rxjs';
import { FieldFilter } from '../filter-mode.model';
import { ContextMenuAction } from '../context-menu/context-menu';

export interface IWidgetCommonAction {
    resetWidget();
    printWidget();
    openNewWindow();
    maximizeWidget(event);
    enterNextRow();
    enterNextColumn();
    filterDisplayFields(displayFields: Array<FieldFilter>);
    getDisplayFields$(): Observable<Array<FieldFilter>>;
    getContextMenu$(): Observable<Array<ContextMenuAction>>;
}
