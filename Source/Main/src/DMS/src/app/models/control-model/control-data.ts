import { Observable } from 'rxjs';

export class ControlData {
    controlName: string;
    controlName_Temp: string;
    displayName: string;
    isRequired?: boolean;
    order?: number;
    pattern?: string;
    defaultValue: any = '';
    isDisabled: boolean = false;
    isReadOnly: boolean = false;
    placeholder$?: Observable<string>;
}

export const ValidatorPattern = {
    EMAIL: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$',
    PASSWORD: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%&*-]).{9,}$',
    FOLDER_NAME: '^[^\\/?%*:|"<>]+$',
};
