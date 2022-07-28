import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QRCodeModule } from 'angular2-qrcode';
import { QRCodeComponent } from './qr-code.component';

@NgModule({
    declarations: [QRCodeComponent],
    imports: [
        CommonModule,
        QRCodeModule,
    ],
    exports: [QRCodeComponent],
    providers: [],
    entryComponents: [QRCodeComponent],
})
export class QRCodeCustomModule { }