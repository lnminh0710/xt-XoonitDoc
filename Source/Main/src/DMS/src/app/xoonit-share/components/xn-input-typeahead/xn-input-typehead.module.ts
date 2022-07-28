import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XnInputTypeaheadComponent } from './xn-input-typeahead.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

@NgModule({
    declarations: [XnInputTypeaheadComponent],
    imports: [CommonModule, FormsModule, TypeaheadModule],
    exports: [XnInputTypeaheadComponent],
    providers: [],
})
export class XnInputTypeaheadModule {}
