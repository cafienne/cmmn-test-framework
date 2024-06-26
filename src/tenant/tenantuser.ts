import ConsentGroupMember, { ConsentGroupOwner } from "../service/consentgroup/consentgroupmember";
import User from "../user";

export default class TenantUser extends User {
    public tenant?: string;

    /**
     * Simple wrapper for a TenantUser object.
     * It needs a userId, which must match the 'sub' inside the JWT token sent to the case engine.
     * The class User has an id, and this id is put inside the 'sub' of the token when the user logs in.
     * 
     * @param userId Typically filled from User.id.
     * @param roles Set of strings containing the names of the roles the user has within the tenant.
     * @param name Optional name for the user inside the tenant.
     * @param email Optional email for the user inside the tenant.
     * @param isOwner Optional flag to indicate that this user is a tenant owner
     * @param enabled Optional flag to indicate that the user account must be enabled/disabled
     * @param tenant Optional tenant name; is returned in server responses and can be used in expressions
     */
    constructor(public userId: string, public roles: Array<string> = [], public name?: string, public email?: string, public isOwner: boolean = false, public enabled: boolean = true) {
        super(userId);
     }

     toJson() {
        const userId = this.userId;
        const roles = this.roles;
        const name = this.name;
        const email = this.email;
        const isOwner = this.isOwner;
        const enabled = this.enabled;
        return { userId, roles, name, email, isOwner, enabled };
    }
    
    /**
     * Creates a new ConsentGroupMember object with the given roles.
     * The ConsentGroupMember will get the user id of this user.
     * @param roles 
     */
     asCGM(...roles: Array<string>) {
        return new ConsentGroupMember(this.id, roles);
    }

    /**
     * Creates a new ConsentGroupOwner object with the given roles.
     * The ConsentGroupMember will get the user id of this user.
     * @param roles 
     */
     asCGO(...roles: Array<string>) {
        return new ConsentGroupOwner(this.id, roles);
    }

}

export class TenantOwner extends TenantUser {
    constructor(public userId: string, public roles: Array<string> = [], public name?: string, public email?: string, public enabled: boolean = true) {
        super(userId, roles, name, email, true, enabled);
    }
}
