export class ScanAssignmentUserLanguageCountry {
    public IdPerson: number;
    public IdScansContainerDispatchers: number;
    public IdScansContainer: number;

    public constructor(init?: Partial<ScanAssignmentUserLanguageCountry>) {
        Object.assign(this, init);
    }
}