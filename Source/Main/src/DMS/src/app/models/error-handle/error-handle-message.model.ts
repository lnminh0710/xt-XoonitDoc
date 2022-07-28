export class ErrorHandleMessageModel {
    public isError: boolean;
    public message: string;
    public item: any;

    constructor() {
        this.isError = false;
        this.message = '';
    }
}
