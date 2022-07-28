import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { DocumentManagementActionNames, GetDocumentsByKeywordAction, DocumentManagementSuccessAction, GetDocumentFilesByFolderAction, DocumentManagementFailedAction, GetFileByUrlForWidgetViewerIdAction } from './document-management.actions';
import { DocumentService, SearchService } from '@app/services';
import { Observable, of } from 'rxjs';
import { FileManagerService } from '@app/pages/private/modules/file-manager/services';
import { ApiResultResponse } from '@app/models';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable()
export class DocumentManagementEffects {
    constructor(
        private actions$: Actions,
        private documentService: DocumentService,
        private fileManagerService: FileManagerService,
        private searchService: SearchService,
    ) { }

    @Effect()
    getDocumentFilesByFolder$ =
        this.actions$
            .pipe(
                ofType(DocumentManagementActionNames.GET_DOCUMENTS_BY_KEYWORD),
                switchMap((action: GetDocumentsByKeywordAction) => {
                    const payload = action.payload;

                    return this.searchService.searchField(payload.fieldName, payload.index, payload.folder.idDocument.toString(), payload.moduleId, payload.pageIndex, payload.pageSize, payload.fieldNames, payload.fieldValues)
                        .pipe(
                            map((response: ApiResultResponse) => {
                                const result = response.item as any[];
                                return new DocumentManagementSuccessAction(action.type, result);
                            }),
                            catchError(err => of(new DocumentManagementFailedAction(action.type, err))),
                        );
                }),
            );

    @Effect()
    getFileByUrlForWidgetViewerId$ =
        this.actions$
            .pipe(
                ofType(DocumentManagementActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID),
                switchMap((action: GetFileByUrlForWidgetViewerIdAction) => {
                    return this.fileManagerService.getFileByUrl(action.payload.filePath)
                        .pipe(
                            map(file => {
                                return new DocumentManagementSuccessAction(action.type, { file: file, idWidget: action.payload.idWidget });
                            }),
                            catchError(err => of(new DocumentManagementFailedAction(action.type, err))),
                        )
                })
            );
}
