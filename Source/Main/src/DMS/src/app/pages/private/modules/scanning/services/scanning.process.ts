import { Injectable, Injector } from '@angular/core';

@Injectable()
export class ScanningProcess {
    public TabIDScanningImagePreview: string;
    public TabIDScanningImageList: string;
    public TabIDScanningConfiguration: string;
    public TabIDScanningStructTree: string;

    public TabIDScanningImagePreview_IsFullScreen: boolean;
    public TabIDScanningConfiguration_IsFullScreen: boolean;

    constructor(injector: Injector) {
    }
}
