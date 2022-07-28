export enum OctopusCompanyEnum {
    companyName = 'textValue',
    companyId = 'idValue',
}

export enum OctopusBranchEnum {
    branchId = 'IdBranches',
    branchNrOrigin = 'BranchNrOrigin',
    branchNr = 'BranchNr',
}

export class HeadquarterInfoModel {
    companyName?: string;
    companyId?: string;
    branchId?: string;
    branchNr?: string;
    branchNumber?: number;

    public constructor(init?: Partial<HeadquarterInfoModel>) {
        Object.assign(this, init);
    }
}
