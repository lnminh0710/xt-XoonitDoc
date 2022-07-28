import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Uti } from '@app/utilities';


@Injectable({providedIn: 'root'})
export class AppleAppSiteAssociationGuard implements CanActivate {
    constructor(
        private router: Router,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const iOs = Uti.detectIOSDevice();
        if (!iOs) {
            this.router.navigate(['/']);
            return false;
        }

        return true;
    }
}
