import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { XnClickOutsideModule } from "@app/shared/directives/xn-click-outside";
import { RemoveHtmlPipe, SafeHtmlPipe, ScrollDirective, setPosition, styleDirective } from "./clickOutside";
import { AngularMultiSelect } from "./multiselect.component";
import { ListFilterPipe } from "./list-filter";
import { Badge, CIcon, Item, Search, TemplateRenderer } from "./menu-item";
import { VirtualScrollComponent } from ".";
import { DataService } from "./multiselect.service";
import { XnInputNumericModule } from "@app/shared/directives/xn-input-numeric/xn-input-numeric.module";

@NgModule({
    imports: [CommonModule, FormsModule, XnClickOutsideModule, XnInputNumericModule, ReactiveFormsModule],
    declarations: [AngularMultiSelect, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, VirtualScrollComponent, CIcon, SafeHtmlPipe, RemoveHtmlPipe],
    exports: [AngularMultiSelect, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, VirtualScrollComponent, CIcon, SafeHtmlPipe, RemoveHtmlPipe, XnInputNumericModule],
    providers: [DataService, RemoveHtmlPipe]

})
export class AngularMultiSelectModule { }
