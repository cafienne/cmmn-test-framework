import ConsentGroup from "@cafienne/typescript-client/service/consentgroup/consentgroup";
import ConsentGroupService from "@cafienne/typescript-client/service/consentgroup/consentgroupservice";
import ConsentGroupMember, { ConsentGroupOwner } from "@cafienne/typescript-client/service/consentgroup/consentgroupmember";
import TestCase from "@cafienne/typescript-client/test/testcase";
import WorldWideTestTenant from "../../worldwidetesttenant";
import assertSameGroup, { assertMemberHasNoRoles, assertMemberRole } from "@cafienne/typescript-client/test/userassertions/consentgroup";
import { SomeTime } from "@cafienne/typescript-client/test/time";

const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const tenantAndGroupOwner = worldwideTenant.sender;
const tenantOwner = worldwideTenant.receiver;
const tenantUser = worldwideTenant.employee;

const guid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const groupId = `consent-group-${guid}`;
const groupName = 'my-very-own-consent-group';
const groupDescription = 'welll ... my very own consent group description';

export default class TestConsentGroupAPI extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
    }


    async run() {
        const owner = new ConsentGroupOwner(tenantAndGroupOwner.id, ['OwnerRole', 'GroupRole']); // Sender
        const member = new ConsentGroupMember(tenantUser.id, []); // Employee
        const newMember = new ConsentGroupMember(tenantOwner.id, ["MemberRole"]); // Receiver
        const members: Array<ConsentGroupMember> = [];
        const group = new ConsentGroup(members, groupId);
        await owner.login();
        await member.login();
        await newMember.login();

        // Check that it is not possible to add a member if the group does not yet exist
        await ConsentGroupService.setGroupMember(tenantOwner, `not-existing-group-${guid}`, member, 404);
        // Check that only tenant owners can create a consent group
        await ConsentGroupService.createGroup(tenantUser, tenant, group, 401);
        // Check that a consent group must have at least one member
        await ConsentGroupService.createGroup(tenantOwner, tenant, group, 400);
        // Add a member
        members.push(member);
        // Check that a consent group must have at least one owner
        await ConsentGroupService.createGroup(tenantOwner, tenant, group, 400);
        // Add an owner
        members.push(owner);
        // Now it should be possible to create a group
        await ConsentGroupService.createGroup(tenantAndGroupOwner, tenant, group);
        // But it should not be possible to create the same group again.
        await ConsentGroupService.createGroup(tenantAndGroupOwner, tenant, group, 400);

        // If we remove the initial groupId, then we should be able to again create a group.
        delete group.id;
        await ConsentGroupService.createGroup(tenantAndGroupOwner, tenant, group);
        // Validate that the new group indeed has a different id
        if (group.id === groupId) {
            throw new Error(`Expected the server to generate a new group id, but found client-side generated group id???`);
        }

        // Get the group
        await ConsentGroupService.getGroup(tenantAndGroupOwner, group);

        // Get it and check it to be the same as expected
        await assertSameGroup(tenantAndGroupOwner, group);

        // Check that non-group members are not allowed to get the group
        await ConsentGroupService.getGroup(tenantOwner, group, 404);

        await ConsentGroupService.setGroupMember(tenantAndGroupOwner, group, newMember)

        // Check that new member can now also get the group
        await ConsentGroupService.getGroup(tenantOwner, group);

        // Move the member also in the local group and check that server and client are the same
        group.members.push(newMember);
        await assertSameGroup(tenantAndGroupOwner, group);

        // Check that remove member is not allowed if you're not an owner
        await ConsentGroupService.removeGroupMember(tenantUser, group, newMember, 401);

        // Temporarily make the member an owner
        await ConsentGroupService.setGroupMember(tenantAndGroupOwner, group, member.withOwnership(true));


        // Now it should be possible to remove the new member again
        await ConsentGroupService.removeGroupMember(tenantUser, group, newMember);

        // Remove the group owner again
        await ConsentGroupService.setGroupMember(tenantAndGroupOwner, group, member.withOwnership(false));

        // It should not be possible to remove the last owner from the group
        await ConsentGroupService.setGroupMember(tenantAndGroupOwner, group, owner.withOwnership(false), 400);

        // But it should be possible to change the last owner's set of roles
        console.log("Changing owner: " + owner.withRoles('OwnerRole', 'Role1', 'Role2'));
        const newOwner = owner.withRoles('OwnerRole', 'Role1', 'Role2')
        await ConsentGroupService.setGroupMember(tenantAndGroupOwner, group, newOwner);
        await tenantAndGroupOwner.refreshUserInformation().then(info => {
            const newOwnerGroup = info.groups.find(g => g.groupId === group.id)
            console.log("New owner groups: " + JSON.stringify(newOwnerGroup, undefined, 2));
        });

        await SomeTime(2000); // Note: required because engine does not take Consent-Group-LastModified into account

        await tenantAndGroupOwner.refreshUserInformation().then(info => {
            const newOwnerGroup = info.groups.find(g => g.groupId === group.id)
            console.log("New owner groups: " + JSON.stringify(newOwnerGroup, undefined, 2));
        });

        const role = 'just a simple group role';

        // Check that we can add a role to a member
        await ConsentGroupService.setGroupMember(tenantAndGroupOwner, group, member.withExtraRoles(role));

        // Check that we can add a role to a member
        await assertMemberRole(tenantAndGroupOwner, group, member, role);

        // Check that non-owners cannot add a role to a member
        await ConsentGroupService.setGroupMember(tenantUser, group, member.withExtraRoles('abc', 'def'), 401);

        // Check that non-owners can also not remove a role from a member ...
        await ConsentGroupService.setGroupMember(tenantUser, group, member.withRoles(), 401);

        // And, finally, check that group owners can!
        await ConsentGroupService.setGroupMember(tenantAndGroupOwner, group, member.withRoles().withOwnership(true));

        // And check it is done properly.
        await assertMemberHasNoRoles(tenantAndGroupOwner, group, member);

        // await SomeTime(1000, "Refreshing user info for user " + tenantAndGroupOwner.id)

    }
}