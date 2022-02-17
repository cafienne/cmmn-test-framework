'use strict';

import TestCase from '@cafienne/typescript-client/test/testcase';
import WorldWideTestTenant from '../../worldwidetesttenant';
import RepositoryService from '@cafienne/typescript-client/service/case/repositoryservice';
import CaseService from '@cafienne/typescript-client/service/case/caseservice';
import CaseTeamService from '@cafienne/typescript-client/service/case/caseteamservice';
import TaskService from '@cafienne/typescript-client/service/task/taskservice';
import { assertCaseTeamTenantRole, assertCaseTeamUser } from '@cafienne/typescript-client/test/caseassertions/team';
import { assertTaskCount, assertTask, findTask } from '@cafienne/typescript-client/test/caseassertions/task';
import { CaseOwner } from '@cafienne/typescript-client/cmmn/team/caseteamuser';
import CaseTeam from '@cafienne/typescript-client/cmmn/team/caseteam';
import CaseTeamTenantRole from '@cafienne/typescript-client/cmmn/team/caseteamtenantrole';


const tenantName = Math.random().toString(36).substring(7);
const worldwideTenant = new WorldWideTestTenant(tenantName);
const tenant = worldwideTenant.name;
const sender = worldwideTenant.sender;
const receiver = worldwideTenant.receiver;
const employee = worldwideTenant.employee;
const definition = 'caseteam.xml';
const requestorRole = 'Requestor';
const approverRole = 'Approver';

export default class TestCaseTeam extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
        await RepositoryService.validateAndDeploy(sender, definition, tenant);
    }

    async run() {
        const caseTeam = new CaseTeam([]);
        const startCase = { tenant, definition, debug: true, caseTeam };

        const caseInstance = await CaseService.startCase(sender, startCase);

        // Getting the case must be allowed for sender
        await CaseService.getCase(sender, caseInstance);

        // Getting the case is not allowed for the receiver and employee, as they are not part of the case team
        await CaseService.getCase(receiver, caseInstance, 404);
        await CaseService.getCase(employee, caseInstance, 404);

        // Get case tasks should be possible for sender and there should be 5 Unassigned tasks
        let tasks = await TaskService.getCaseTasks(sender, caseInstance);
        assertTaskCount(tasks, 'Unassigned', 5);

        const approveTask = findTask(tasks, 'Approve');
        const taskWithoutRole = findTask(tasks, 'Task Without Role');
        const requestTask = findTask(tasks, 'Request');
        
        // Sender can claim task 'Task Without Role'
        await TaskService.claimTask(sender, taskWithoutRole);
        await assertTask(sender, taskWithoutRole, 'Claim', 'Assigned', sender, sender);
        
        // There should be 4 Unassigned tasks
        tasks = await TaskService.getCaseTasks(sender, caseInstance);
        assertTaskCount(tasks, 'Unassigned', 4);

        // Add Approver role to sender
        await CaseTeamService.setUser(sender, caseInstance, new CaseOwner(sender, [approverRole]));
        await assertCaseTeamUser(sender, caseInstance, new CaseOwner(sender, [approverRole]));

        // Now, sender can claim 'Approve' task
        await TaskService.claimTask(sender, approveTask)
        await assertTask(sender, approveTask, 'Claim', 'Assigned', sender, sender);

        // There should be 3 Unassigned tasks
        tasks = await TaskService.getCaseTasks(sender, caseInstance);
        assertTaskCount(tasks, 'Unassigned', 3);

        // As receiver is not part of the team, getting tasks for receiver should fail
        await TaskService.getTask(receiver, approveTask, 404);
        await TaskService.getCaseTasks(receiver, caseInstance, 404);

        // Sender can add a role mapping to the case team
        await CaseTeamService.setTenantRole(sender, caseInstance, new CaseTeamTenantRole('Receiver', [requestorRole]));
        await assertCaseTeamTenantRole(sender, caseInstance, new CaseTeamTenantRole('Receiver', [requestorRole]));

        // Now, getting the case and case tasks should be possible for receiver
        await TaskService.getCaseTasks(receiver, caseInstance);
        await TaskService.getTask(receiver, approveTask);

        // Receiver can claim 'Request' task
        await TaskService.claimTask(receiver, requestTask);
        await assertTask(receiver, requestTask, 'Claim', 'Assigned', receiver, receiver);

        // There should be 2 Unassigned tasks
        tasks = await TaskService.getCaseTasks(sender, caseInstance);
        assertTaskCount(tasks, 'Unassigned', 2);

        // As receiver is not a caseteam owner, he should not be able to remove sender (who is owner)
        await CaseTeamService.removeUser(receiver, caseInstance, sender, 401, 'As receiver is not a caseteam owner, he should not be able to remove sender (who is owner)');

        // Sender makes receiver a case team owner; but via user mapping
        await CaseTeamService.setUser(sender, caseInstance, new CaseOwner(receiver, [requestorRole]));
        await assertCaseTeamUser(sender, caseInstance, new CaseOwner(receiver, [requestorRole]));

        await CaseService.getCase(receiver, caseInstance);
        
        // Now, receiver can remove sender
        await CaseTeamService.removeUser(receiver, caseInstance, sender);
        await assertCaseTeamUser(receiver, caseInstance, new CaseOwner(sender, [approverRole]), false);

        // Finally, sender cannot perform find case, case tasks, and task
        await CaseService.getCase(sender, caseInstance, 404);
        await TaskService.getCaseTasks(sender, caseInstance, 404);
        await TaskService.getTask(sender, approveTask, 404);
    }
}