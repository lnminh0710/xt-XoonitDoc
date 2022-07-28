import { UUID } from 'angular2-uuid';

export class GuidHelper {
    public static generateGUID = (): string => {
        return UUID.UUID();
    }

    public static EMPTY_GUID = '00000000-0000-0000-0000-000000000000';
}
