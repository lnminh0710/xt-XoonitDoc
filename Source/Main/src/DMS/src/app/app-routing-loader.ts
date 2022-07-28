import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

export class AppCustomPreloader implements PreloadingStrategy {
    preload(route: Route, load: Function): Observable<any> {
        //console.log('AppCustomPreloader', route.data);
        //return route.data && route.data.preload ? load() : Observable.of(null);
        if (route.data && route.data.preload) {
            //console.log('Preload Path: ' + route.path);
            return load();
        } else {
            return of(null);
        }
    }
}
