/**
 * ApiResultResponse
 */
export class ApiResultResponse {    
    statusCode: number; 
    resultDescription: string;
    item: any;

    public constructor(init?: Partial<ApiResultResponse>) {
        Object.assign(this, init);
    }
}
