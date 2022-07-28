import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Uti } from '@app/utilities/uti';
import { Configuration } from '@app/app.constants';

@Component({
    selector: 'app-home',
    template: '',
})
export class HomeComponent implements OnInit {
    constructor(private router: Router, private uti: Uti, private consts: Configuration) {}

    ngOnInit() {
        //IsAuthenticated: go administration
        if (this.uti.checkLogin()) {
            this.router.navigate([Configuration.rootPrivateUrl]);
        } else {
            this.uti.clearStorage();
            this.router.navigate([this.consts.loginUrl]);
        }
    }
}
