import { NgModule } from "@angular/core";
import { XnImageLoaderModule } from "@app/shared/directives/xn-image-loader";
import { XnInputDebounceModule } from "@xn-control/xn-input-debounce/xn-input-debounce.module";
import { WjCoreModule } from "src/public/assets/lib/wijmo/wijmo-commonjs-min/wijmo.angular2.core";
import { WjGridModule } from "src/public/assets/lib/wijmo/wijmo-commonjs-min/wijmo.angular2.grid";
import { XnTranslationModule } from "../translation/xn-translation.module";
import * as primengModule from 'primeng/primeng';
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { AngularSplitModule } from "angular-split";
import { CommonModule } from "@angular/common";
import { NotificationComponent } from "./notification.component";
import { NotificationListViewChildComponent } from "./notification-list-view-child";
import { NotificationDetailPopupComponent } from "./notification-detail-popup";
import { NotificationDetailComponent } from "./notification-detail";
import { MatSlideToggleModule } from "@xn-control/light-material-ui/slide-toggle";
import { MatRadioModule } from "@xn-control/light-material-ui/radio";
import { MatCheckboxModule } from "@xn-control/light-material-ui/checkbox";
import { MatButtonModule } from "@xn-control/light-material-ui/button";
import { NotificationArchivePopupComponent } from "./notification-archive-popup";
import { NotificationArchiveViewComponent } from "./notification-archive-view";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { PipesModule } from "@app/pipes/pipes.module";
import { XnClickOutsideModule } from "@app/shared/directives/xn-click-outside";

@NgModule({
    imports: [
        CommonModule,
        AngularSplitModule,
        PerfectScrollbarModule,
        primengModule.DialogModule,
        XnInputDebounceModule,
        WjCoreModule,
        WjGridModule,
        XnTranslationModule,
        XnImageLoaderModule,
        MatButtonModule,
        MatCheckboxModule,
        MatRadioModule,
        MatSlideToggleModule,
        TooltipModule,
        PipesModule,
        XnClickOutsideModule
    ],
    declarations: [
        NotificationComponent,
        NotificationListViewChildComponent,
        NotificationDetailPopupComponent,
        NotificationDetailComponent,
        NotificationArchiveViewComponent,
        NotificationArchivePopupComponent
    ],
    exports: [
        NotificationComponent
    ]
})
export class NotificationModule { }
