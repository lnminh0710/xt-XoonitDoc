import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnSharedModule } from '@app/shared';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { AngularSplitModule } from 'angular-split';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EffectsModule } from '@ngrx/effects';
import { MyContactSelectors } from './my-contact.statemanagement/my-contact.selectors';
import { MyContactComponent } from './my-contact.component';
import { myContactRoutes } from './my-contact.routing';
import { MyContactEffects } from './my-contact.statemanagement/my-contact.effects';
import { myContactReducer } from './my-contact.statemanagement/my-contact.reducer';
import { GlobalSearchModule } from '@app/shared/components/global-search/global-search.module';
import { WidgetSearchPageModule } from '@app/xoonit-share/components/widget-search-page/widget-search-page.module';

@NgModule({
    declarations: [MyContactComponent],
    imports: [
        CommonModule,
        AngularSplitModule,
        PerfectScrollbarModule,
        ModalModule,
        RouterModule.forChild(myContactRoutes),
        EffectsModule.forFeature([MyContactEffects]),
        StoreModule.forFeature('myContactReducer', myContactReducer),
        XnSharedModule,
        GlobalSearchModule,
        WidgetSearchPageModule,
    ],
    exports: [],
    providers: [MyContactSelectors],
})
export class MyContactModule {}
