import { Injectable } from '@angular/core';
import { Router, CanLoad, Route } from '@angular/router';
import { Configuration } from '@app/app.constants';
import { AuthenticationService } from '@app/services';

@Injectable()
export class CanLoadGuard implements CanLoad {
    constructor(
        private router: Router,
        private consts: Configuration,
        private authService: AuthenticationService,
    ) {}

    public canLoad(route: Route) {
        const user = this.authService.getUserFromAccessToken();
        if (user) {
            // logged in so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.authService.logout();
        this.router.navigate([this.consts.loginUrl]);
        return false;
    }
}
