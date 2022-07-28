import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnSharedModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { AngularSplitModule } from 'angular-split';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EffectsModule } from '@ngrx/effects';
import { DocumentManagementComponent } from './document-management.component';
import { documentManagementRoutes } from './document-management.routing';
import { DocumentManagementEffects } from './document-management.statemanagement/document-management.effects';
import { documentManagementReducer } from './document-management.statemanagement/document-management.reducer';
import { DocumentManagementSelectors } from './document-management.statemanagement/document-management.selectors';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
import { DocumentManagementHandlerService } from './services/document-management-handler.service';
import { WidgetSearchPageModule } from '@app/xoonit-share/components/widget-search-page/widget-search-page.module';
import { XnHotKeyProcessingDirectiveModule } from '@app/shared/directives/xn-hot-key-processing';
import { XnProcessingDocumentDirectiveModule } from '@app/shared/directives/xn-processing-document';

@NgModule({
    declarations: [DocumentManagementComponent],
    imports: [
        CommonModule,
        AngularSplitModule,
        PerfectScrollbarModule,
        ModalModule,
        RouterModule.forChild(documentManagementRoutes),
        EffectsModule.forFeature([DocumentManagementEffects]),
        StoreModule.forFeature('documentManagementReducer', documentManagementReducer),
        XnSharedModule,
        GlobalSearchModule,
        WidgetSearchPageModule,
        XnHotKeyProcessingDirectiveModule,
        XnProcessingDocumentDirectiveModule
    ],
    exports: [],
    providers: [DocumentManagementSelectors, DocumentManagementHandlerService],
})
export class DocumentManagementModule {}
