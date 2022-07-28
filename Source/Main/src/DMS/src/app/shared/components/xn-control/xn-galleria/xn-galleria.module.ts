import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { XnGalleria } from "./xn-galleria.component";
import { XnGalleriaVertical } from "./xn-galleria-vertical.component";
import { XnImageLoaderModule } from "@app/shared/directives/xn-image-loader";

@NgModule({
    imports: [
        CommonModule,
        XnImageLoaderModule
    ],
    declarations: [
        XnGalleria,
        XnGalleriaVertical
    ],
    exports: [
        XnGalleria,
        XnGalleriaVertical
    ]
})
export class XnGalleriaModule { }
