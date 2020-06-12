'use strict';

import CaseService from '../../../framework/service/case/caseservice';
import WorldWideTestTenant from '../../worldwidetesttenant';
import CaseTeamService from '../../../framework/service/case/caseteamservice';
import { TenantRoleMember } from '../../../framework/cmmn/caseteammember';
import CaseTeam from '../../../framework/cmmn/caseteam';
import TaskService from '../../../framework/service/task/taskservice';
import { assertTask, findTask, assertTaskCount } from '../../../framework/test/assertions';
import Case from '../../../framework/cmmn/case';

const caseService = new CaseService();
const caseTeamService = new CaseTeamService();
const taskService = new TaskService();

const definition = 'caseteam.xml';
const requestorRole = 'Requestor';

export default class TestCaseTeam1 {
    async run(worldwideTenant: WorldWideTestTenant) {
        const tenant = worldwideTenant.name;
        const sender = worldwideTenant.sender;
        const receiver = worldwideTenant.receiver;
        const employee = worldwideTenant.employee;
        
        const caseTeam = new CaseTeam([]);
        const startCase = { tenant, definition, debug: true, caseTeam };

        const caseInstance = await caseService.startCase(startCase, sender) as Case;

        // Getting the case must be allowed for sender
        await caseService.getCase(caseInstance, sender);

        // Getting the case is not allowed for the receiver and employee, as they are not part of the case team
        await caseService.getCase(caseInstance, receiver, false);
        await caseService.getCase(caseInstance, employee, false);

        // Get case tasks should be possible for sender and there should be 5 Unassigned tasks
        let tasks = await taskService.getCaseTasks(caseInstance, sender);
        assertTaskCount(tasks, 'Unassigned', 5)

        const approveTask = findTask(tasks, 'Approve')
        const assistTask = findTask(tasks, 'Assist')
        const arbitraryTask = findTask(tasks, 'Arbitrary Task')
        const taskWithoutRole = findTask(tasks, 'Task Without Role')
        const requestTask = findTask(tasks, 'Request')
        
        // Except 'Task Without Role' sender cannot claim any of the tasks in the case
        await taskService.claimTask(approveTask, sender, false)
        await taskService.claimTask(assistTask, sender, false)
        await taskService.claimTask(arbitraryTask, sender, false)
        await taskService.claimTask(requestTask, sender, false)
        await taskService.claimTask(taskWithoutRole, sender)
        await assertTask(taskWithoutRole, sender, 'Claim', 'Assigned', sender, sender)
        
        // There should be 4 Unassigned tasks
        tasks = await taskService.getCaseTasks(caseInstance, sender);
        assertTaskCount(tasks, 'Unassigned', 4)

        // Getting tasks for receiver should fail
        await taskService.getTask(approveTask, receiver, false);
        // await taskService.getCaseTasks(caseInstance, receiver, false);

        console.log('Adding receiver role to case team; reciever itself has roles: ' + receiver.roles)

        // Sender can add a role mapping to the case team
        await caseTeamService.setMember(caseInstance, sender, new TenantRoleMember('Receiver', [requestorRole]))

        // Now, getting the case and case tasks should be possible for receiver
        await caseTeamService.getCaseTeam(caseInstance, receiver).then(team => console.log('New team: ' + JSON.stringify(team, undefined, 2)))
        await taskService.getCaseTasks(caseInstance, receiver);
        await taskService.getTask(approveTask, receiver);
    }
}