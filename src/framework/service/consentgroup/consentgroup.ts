import Tenant from "../../tenant/tenant";
import User from "../../user";
import ConsentGroupMember from "./consentgroupmember";

export default class ConsentGroup {
    /**
     * Tenant responsible for creating the group
     */
    public tenant: string;

    /**
     * Simple wrapper class for ConsentGroup.
     * @param tenantIdentifier Identifier of tenant responsible for creating the group (can be applied to both Tenant and string of tenant name)
     * @param members List group members
     * @param id Optional identifier of the group. Will be generated by the server if it is omitted.
     */
    constructor(tenantIdentifier: string | Tenant, public members: Array<ConsentGroupMember> = [], public id?: string) {
        this.tenant = tenantIdentifier?.toString();
    }

    /**
     * Returns the tenant users that are owner.
     */
    getOwners() {
        return this.members.filter(user => user.isOwner);
    }

    /**
     * Returns true if the member with the specified id can be found in this group.
     * @param identifier
     * @returns 
     */
    hasMember(identifier: string | User): boolean {
        return this.members.find(m => m.id === identifier.toString() || m.userId === identifier.toString()) !== undefined;
    }

    /**
     * Returns the member with the specified name.
     * @param identifier
     * @returns 
     */
    getMember(identifier: string | User): ConsentGroupMember {
        const member = this.members.find(m => m.id === identifier.toString() || m.userId === identifier.toString());
        if (member) {
            return member;
        } else {
            throw new Error(`Member '${identifier}' is not present in the list of members'`);
        }
    }

    toString() {
        return this.id;
    }
}
