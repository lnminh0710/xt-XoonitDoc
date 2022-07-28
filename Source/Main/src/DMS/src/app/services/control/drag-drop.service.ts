import { Injectable } from '@angular/core';

@Injectable()
export class DragService {
    private zone: string;
    public data: any;
    public callBack: any;

    startDrag(zone: string, data?: any, callBack?: any) {
        this.zone = zone;
        this.data = data;
        this.callBack = callBack;
    }

    accepts(zone: string): boolean {
        return zone == this.zone;
    }

    reset() {
        this.zone = null;
        this.data = null;
        this.callBack = null;
    }
}