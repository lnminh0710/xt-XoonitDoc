
export class ScanAssignmentAssignPoolsToUsers {
    public ScanAssignmentPools: Array<ScanAssignmentPool>;
    public ScanAssignmentUserLogins: Array<ScanAssignmentUserLogin>;

    public constructor(init?: Partial<ScanAssignmentAssignPoolsToUsers>) {
        Object.assign(this, init);
    }
}

export class ScanAssignmentPool {
    public IdScansContainerDispatchers?: number;
	public IdRepAssignedMethods?: number;
	public IdCountrylanguage?: number;
	public IdScansContainerAssignment?: number;
	public Notes?: string;    

    public constructor(init?: Partial<ScanAssignmentPool>) {
        Object.assign(this, init);
    }
}

export class ScanAssignmentUserLogin {
    public IdLogin?: number;
    public Quantity?: number;
    public InvalidQuantity?: boolean;

    public constructor(init?: Partial<ScanAssignmentUserLogin>) {
        Object.assign(this, init);        
    }
}
