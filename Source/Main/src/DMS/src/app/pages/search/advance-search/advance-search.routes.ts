import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdvanceSearchComponent } from './advance-search.component';

const routes: Routes = [
  {
    path: '',
    component: AdvanceSearchComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdvanceSearchRoutingModule {}
