import { Routes, RouterModule } from "@angular/router";
import { SearchComponent } from "./search.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
    {
        path: '',
        component: SearchComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SearchRoutingModule { }
