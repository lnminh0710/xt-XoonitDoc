import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TestCloudConnectionPopupComponent } from './test-cloud-connection-popup.component';

@NgModule({
    imports: [CommonModule],
    exports: [TestCloudConnectionPopupComponent],
    declarations: [TestCloudConnectionPopupComponent],
    providers: [],
    entryComponents: [TestCloudConnectionPopupComponent],
})
export class TestCloudConnectionPopupModule {}
