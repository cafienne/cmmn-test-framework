import CaseTeamMember from "./caseteammember";
import User from "../user";
import RoleBinding from "./rolebinding";

/**
 * Simple CaseTeam wrapper class.
 * Each case instance has it's own team.
 */
export default class CaseTeam {
    constructor(public members: CaseTeamMember[], public caseRoles: String[], public unassignedRoles: String[]) {}

    find(user: User) {
        return this.members.find(member => member.memberId === user.id);
    }
}