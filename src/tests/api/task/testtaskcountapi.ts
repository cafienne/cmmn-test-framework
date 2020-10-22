'use strict';

import CaseService from '../../../framework/service/case/caseservice';
import TaskService, { TaskCount } from '../../../framework/service/task/taskservice';
import TestCase from '../../../framework/test/testcase';
import WorldWideTestTenant from '../../worldwidetesttenant';
import RepositoryService from '../../../framework/service/case/repositoryservice';
import CaseTeam from '../../../framework/cmmn/caseteam';
import CaseTeamMember from '../../../framework/cmmn/caseteammember';
import CaseTeamService from '../../../framework/service/case/caseteamservice';
import { ServerSideProcessing } from '../../../framework/test/time';
import Case from '../../../framework/cmmn/case';
import User from '../../../framework/user';
import Task from '../../../framework/cmmn/task';

const repositoryService = new RepositoryService();
const definition = 'helloworld.xml';


const caseService = new CaseService();
const taskService = new TaskService();
const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const sender = worldwideTenant.sender;

export default class TestTaskCountAPI extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
        await repositoryService.validateAndDeploy(definition, sender, tenant);
    }

    async run() {
        const inputs = {
            Greeting: {
                Message: 'Hello there',
                From: sender.id
            }
        };
        const caseTeam = new CaseTeam([new CaseTeamMember(sender, undefined, true)]);
        
        const startCase = { tenant, definition, inputs, caseTeam, debug: true };
        // const startCase = { tenant, definition, inputs, caseInstanceId: 'Ueè' };
        // const startCase = { tenant, definition, inputs, caseInstanceId: tenant };
        const taskOutput = {
            Response: {
                Message: 'Toedeledoki',
            }
        };


        const taskCountBefore = await taskService.countTasks(sender);
        console.log("Task Count for sender: " + JSON.stringify(taskCountBefore))

        // Start 3 cases and claim 1 task. Should lead to 2 unclaimed and 1 claimed task
        await caseService.startCase(startCase, sender);
        await caseService.startCase(startCase, sender);
        const caseStarted = await caseService.startCase(startCase, sender) as Case;
        const caseInstance = await caseService.getCase(caseStarted, sender);

        const tasks = await taskService.getCaseTasks(caseInstance, sender);
        const receiveGreetingTask = tasks.find(task => task.taskName === 'Receive Greeting and Send response') as Task;

        await taskService.claimTask(receiveGreetingTask, sender);

        await taskService.countTasks(sender).then((taskCountAfter: TaskCount) => {
            console.log("Task Count after creating 3 cases and claiming 1 task: " + JSON.stringify(taskCountAfter));
            if (taskCountAfter.claimed !== taskCountBefore.claimed + 1) {
                throw new Error("Wrong number of claimed tasks")
            }

        });
    }

    async getUnassignedTasks(user: User) {
        // Simple test
        const taskList = await taskService.getTasks(user, { tenant, taskState: 'Unassigned' });
        console.log(`User ${user.id} has ${taskList.length} unassigned tasks in tenant ${tenant}`);
        return taskList.length;
    }

}