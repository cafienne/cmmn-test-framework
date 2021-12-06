'use strict';

import CaseService from '../../framework/service/case/caseservice';
import TaskService from '../../framework/service/task/taskservice';
import TestCase from '../../framework/test/testcase';
import WorldWideTestTenant from '../worldwidetesttenant';
import RepositoryService from '../../framework/service/case/repositoryservice';
import { assertCasePlan } from '../../framework/test/caseassertions/plan';
import { assertTask, verifyTaskInput, findTask } from '../../framework/test/caseassertions/task';
import CaseTeam from '../../framework/cmmn/team/caseteam';
import { CaseOwner } from '../../framework/cmmn/team/caseteamuser';
import CaseTeamUser from "../../framework/cmmn/team/caseteamuser";

const definition = 'helloworld.xml';

const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const employee = worldwideTenant.employee;
const sender = worldwideTenant.sender;
const receiver = worldwideTenant.receiver;

export default class TestHelloworld extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
        await RepositoryService.validateAndDeploy(sender, definition, tenant);
    }

    async run() {
        const inputs = {
            Greeting: {
                Message: 'Hello there',
                From: sender.id
            }
        };
        const caseTeam = new CaseTeam([new CaseOwner(employee), new CaseTeamUser(sender), new CaseTeamUser(receiver)]);
        
        const startCase = { tenant, definition, inputs, caseTeam, debug: true };

        const taskOutput = {
            Response: {
                Message: 'Toedeledoki',
            }
        };

        const caseInstance = await CaseService.startCase(sender, startCase);

        const cases = await CaseService.getCases(sender, { tenant: tenant, numberOfResults: 10000 });
        console.log("We have " + cases.length + " cases ...");

        const taskName = 'Receive Greeting and Send response';
        const freshCaseInstance = await CaseService.getCase(sender, caseInstance);
        const planItem = freshCaseInstance.planitems.find(p => p.name === taskName);
        if (!planItem) {
            throw new Error('Cannot find plan item ' + taskName);
        }

        const tasks = await TaskService.getCaseTasks(sender, caseInstance);
        const receiveGreetingTask = findTask(tasks, taskName);
        await verifyTaskInput(receiveGreetingTask, inputs)

        await TaskService.claimTask(receiver, receiveGreetingTask);
        await assertTask(sender, receiveGreetingTask, 'Claim', 'Assigned', receiver);

        await TaskService.completeTask(receiver, receiveGreetingTask, taskOutput);
        await assertTask(sender, receiveGreetingTask, 'Complete', 'Completed', receiver);

        const responseTaskName = 'Read response';
        const nextTasks = await TaskService.getCaseTasks(sender, caseInstance);
        const readResponseTask = findTask(nextTasks, responseTaskName);
        if (readResponseTask.assignee !== sender.id) {
            throw new Error('Expecting task to be assigned to sending user, but found ' + readResponseTask.assignee + ' instead');
        }
        await TaskService.completeTask(sender, readResponseTask);
        await assertTask(sender, readResponseTask, 'Complete', 'Completed', sender, sender, sender);

        await assertCasePlan(sender, caseInstance, 'Completed');

        console.log(`\n\nCase ID: ${freshCaseInstance.id}\n\nCase Team:${JSON.stringify(freshCaseInstance.team, undefined, 2)}`);
    }
}