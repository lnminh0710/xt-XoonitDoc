export interface RoleGroupResponse {
    IdLoginGroupRole: string;
    GroupRoleName: string;
    [key: string]: any;
}

export interface RoleResponse {
    IdLoginRoles: string;
    RoleName: string;
    IsSelected: boolean;
    [key: string]: any;
}

export interface UserResponse {
    idLogin: string;
    fullName: string;
    [key: string]: any;
}
