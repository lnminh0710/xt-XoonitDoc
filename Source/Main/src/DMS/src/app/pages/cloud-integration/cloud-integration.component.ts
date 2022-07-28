import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Configuration } from '../../app.constants';

@Component({
    selector: 'cloud-integration',
    templateUrl: './cloud-integration.component.html',
    styleUrls: ['./cloud-integration.component.scss'],
})
export class CloudIntegrationComponent implements OnInit, OnDestroy {
    constructor(
        protected router: Router

    ) {

    }

    ngOnInit(): void {
        this.checkEnableCloud();
    }

    ngOnDestroy() {
    }

    private checkEnableCloud() {
        if (!Configuration.PublicSettings.enableCloud) {
            this.router.navigate([Configuration.rootPrivateUrl]);
            return;
        }
    }
}
