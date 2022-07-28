import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router'
import { Configuration } from '@app/app.constants';

export class CustomReuseStrategy implements RouteReuseStrategy {

    handlers: { [key: string]: DetachedRouteHandle } = {};
    willNotStore = false;
    forceDestroy = false;

    /** Determines if this route (and its subtree) should be detached to be reused later */
    public shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return route.routeConfig.path === 'Processing'
            || route.routeConfig.path === 'Document'
            || route.routeConfig.path === 'Email'
            || route.routeConfig.path === 'Contact'
            || route.routeConfig.path === 'ApprovalProcessing'
            || route.routeConfig.path === 'Approval'
            || route.routeConfig.path === 'Scan'
            || route.routeConfig.path === 'Import'
            || route.routeConfig.path === 'Export'
            || route.routeConfig.path === 'Cloud'
            || route.routeConfig.path === 'History'
            || route.routeConfig.path === 'User'

            || route.routeConfig.path === 'SystemManagement'
            || route.routeConfig.path === 'DocumentManagement'
            || route.routeConfig.path === 'Tools'
            || route.routeConfig.path === 'Tools/TracksSetup'
            || route.routeConfig.path === 'Tools/ScanManagement'
            || route.routeConfig.path === 'Tools/DoubletCheckTool'
            || route.routeConfig.path === 'Tools/ToolsAddOn'
            || route.routeConfig.path === 'Tools/CampaignAddOn';
    }

    /** Stores the detached route */
    public store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        //console.log('store: ' + route.routeConfig.path);

        if (handle) {
            if (this.forceDestroy && handle['componentRef']) {
                //console.log('-> destroy');                
                handle['componentRef'].destroy();
                try {
                    delete handle['componentRef']['instance'];
                    delete handle['componentRef'];
                    handle = null;
                } catch (ex) { console.log('unsubscribe', ex); }
            }
            else if (!this.willNotStore) {
                //console.log('-> save handle');
                this.handlers[route.routeConfig.path] = handle;
            }
        }

        this.forceDestroy = false;
        this.willNotStore = false;
    }

    /** Determines if this route (and its subtree) should be reattached */
    public shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return !!route.routeConfig && !!this.handlers[route.routeConfig.path]
    }

    /** Retrieves the previously stored route */
    public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        if (!route.routeConfig) {
            return null;
        }

        return this.handlers[route.routeConfig.path];
    }

    /** Determines if a route should be reused */
    public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {

        if (!this.willNotStore &&
            curr && future &&
            curr['_routerState'] && future['_routerState'] &&
            curr['_lastPathIndex'] == -1 &&
            curr['_routerState'].url != Configuration.rootPrivateUrl &&
            future['_routerState'].url == Configuration.rootPrivateUrl) {

            let routeUrl = curr['_routerState'].url;
            //  /module  --> /module/
            const rootPrivateUrl = Configuration.rootPrivateUrl + '/';
            if (routeUrl.indexOf(rootPrivateUrl) !== -1) {
                //  /module/Customer                 --> Customer
                //  /module/Backoffice/BlockedOrder  --> Backoffice/BlockedOrder
                routeUrl = routeUrl.replace(rootPrivateUrl, '');
                if (this.handlers && this.handlers[routeUrl] && this.handlers[routeUrl]['componentRef']) {
                    try {
                        this.handlers[routeUrl]['componentRef'].destroy();
                        delete this.handlers[routeUrl]['componentRef']['instance'];
                        delete this.handlers[routeUrl]['componentRef'];
                        delete this.handlers[routeUrl];
                    } catch (ex) { console.log('shouldReuseRoute', ex); }
                }
                else {
                    this.forceDestroy = true;
                }

                this.willNotStore = true;
            }
        }

        return future.routeConfig === curr.routeConfig;
    }
}
