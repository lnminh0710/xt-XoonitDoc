import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { HostListener } from '@angular/core';

export abstract class UnsavedModuleCanDeactivate {
    abstract canDeactivate(): boolean;
    abstract deactivateCancelCallback();

    private timeout;

    @HostListener('window:beforeunload', ['$event'])
    beforeUnload($event: any) {
        if (!this.canDeactivate()) {
            $event.returnValue = true;
            this.timeout = setTimeout(() => {
                this.deactivateCancelCallback();
            }, 1);
        }
    }

    @HostListener('window:unload', ['$event'])
    unload($event: any) {
        clearTimeout(this.timeout);

        //Clear gs, widget by BrowserTabId
        const browserTabIdKey = 'BrowserTabId';
        let browserTabId = sessionStorage.getItem(browserTabIdKey);
        if (browserTabId) {
            Object.keys(localStorage).forEach(key => {
                if (key.indexOf('__gs.') !== -1 || key.indexOf('__widget.') !== -1) {
                    if (key.indexOf(browserTabId) !== -1) {
                        localStorage.removeItem(key);
                    }//if
                }//if
            });
            sessionStorage.removeItem(browserTabIdKey);
        }

        //Clear ModuleSetting
        Object.keys(localStorage).forEach(key => {
            if (key.indexOf('ModuleSetting:') !== -1) {
                localStorage.removeItem(key);
            }//if
        });

    }
}

@Injectable()
export class UnsavedModulesGuard implements CanDeactivate<UnsavedModuleCanDeactivate> {
    canDeactivate(component: UnsavedModuleCanDeactivate): boolean {

        if (typeof component.canDeactivate === "function" && !component.canDeactivate()) {
            if (confirm('You have unsaved modules information! If you leave, your changes will be lost.')) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }
}
