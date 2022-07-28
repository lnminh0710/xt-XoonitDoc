import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnSharedModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { AngularSplitModule } from 'angular-split';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EffectsModule } from '@ngrx/effects';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
import { WidgetSearchPageModule } from '@app/xoonit-share/components/widget-search-page/widget-search-page.module';
import { XnHotKeyProcessingDirectiveModule } from '@app/shared/directives/xn-hot-key-processing';
import { XnProcessingDocumentDirectiveModule } from '@app/shared/directives/xn-processing-document';
import { DocumentProcessingComponent } from './document-processing.component';
import { documentProcessingRoutes } from './document-processing.routing';

@NgModule({
    declarations: [DocumentProcessingComponent],
    imports: [
        CommonModule,
        AngularSplitModule,
        PerfectScrollbarModule,
        ModalModule,        
        XnSharedModule,
        GlobalSearchModule,
        WidgetSearchPageModule,
        XnHotKeyProcessingDirectiveModule,
        XnProcessingDocumentDirectiveModule,
        RouterModule.forChild(documentProcessingRoutes),
        //EffectsModule.forFeature([DocumentManagementEffects]),
        //StoreModule.forFeature('documentManagementReducer', documentManagementReducer),
    ],
    exports: [],
    //providers: [DocumentManagementSelectors, DocumentManagementHandlerService],
})
export class DocumentProcessingModule {}
