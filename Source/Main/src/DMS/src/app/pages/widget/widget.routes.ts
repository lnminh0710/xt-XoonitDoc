import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { WidgetComponent } from "@app/pages/widget/widget.component";

const routes: Routes = [
    {
        path: '',
        component: WidgetComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WidgetRoutingModule { }
