import { Injectable } from '@angular/core';

@Injectable()
export class LoadingService {
    public xnLoading: any = {
        loading: false
    };

    public showLoading() {
        this.xnLoading.loading = true;
    }

    public hideLoading() {
        this.xnLoading.loading = false;
    }
}
