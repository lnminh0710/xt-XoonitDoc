import { Injectable} from '@angular/core';
import { Configuration } from '@app/app.constants';
import cloneDeep from 'lodash-es/cloneDeep';

@Injectable()
export class TimeCheckerService {
    private clientDateKeepTrack: any;//Date
    private serverDateNow: any;//Date

    public getServerDateNow(): any {
        if (!this.serverDateNow) {
            //get from cache / server
            if (Configuration.PublicSettings.serverDateNow) {
                this.clientDateKeepTrack = new Date();
                this.serverDateNow = new Date(Configuration.PublicSettings.serverDateNow);
            }
        }

        this.caculateServerDateNow();
        return cloneDeep(this.serverDateNow);
    }

    private caculateServerDateNow() {
        const clientDateNow: any = new Date();
        const clientTimeSpan = clientDateNow - this.clientDateKeepTrack;

        if (clientTimeSpan)
            this.serverDateNow.setTime(this.serverDateNow.getTime() + clientTimeSpan);
    }

    private getFullTimespan(date: any): any {
        const dateNow: any = new Date();
        const diffMs: any = dateNow - date;// milliseconds between two dates
        const diffDays = Math.floor(diffMs / 86400000); // days
        const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
        const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        const diffSecs = Math.round((((diffMs % 86400000) % 3600000) % 60000) / 1000); // seconds

        return {
            TotalDays: diffDays,
            TotalHours: diffHrs,
            TotalMinutes: diffMins,
            TotalSeconds: diffSecs,
            TotalMilliseconds: diffMs
        };
    }
}
