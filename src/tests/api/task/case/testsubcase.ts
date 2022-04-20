'use strict';

import PlanItem from "@cafienne/typescript-client/cmmn/planitem";
import State from "@cafienne/typescript-client/cmmn/state";
import CaseTeamUser, { CaseOwner } from "@cafienne/typescript-client/cmmn/team/caseteamuser";
import CaseFileService from "@cafienne/typescript-client/service/case/casefileservice";
import CaseService from "@cafienne/typescript-client/service/case/caseservice";
import RepositoryService from "@cafienne/typescript-client/service/case/repositoryservice";
import TaskService from "@cafienne/typescript-client/service/task/taskservice";
import { assertCasePlan, assertPlanItem } from "@cafienne/typescript-client/test/caseassertions/plan";
import { findTask } from "@cafienne/typescript-client/test/caseassertions/task";
import { assertCaseTeamUser } from "@cafienne/typescript-client/test/caseassertions/team";
import TestCase from "@cafienne/typescript-client/test/testcase";
import WorldWideTestTenant from "../../../worldwidetesttenant";

const worldwideTenant = new WorldWideTestTenant();
const definition = 'subcasetest.xml';
const tenant = worldwideTenant.name;
const sender = worldwideTenant.sender;
const receiver = worldwideTenant.receiver;

export default class TestSubCase extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
        await RepositoryService.validateAndDeploy(sender, definition, tenant);
    }

    async run() {
        const inputs = {
            Greet: {
                Message: 'Hello there',
                From: sender.id
            }
        };
        const startCase = { tenant, definition };
        const taskOutput = {
            Response: {
                Message: 'Toedeledoki',
            }
        };

        // Sender starts the parent case
        const caseInstance = await CaseService.startCase(sender, startCase);

        // Sender creates Greet case file item
        await CaseFileService.createCaseFileItem(sender, caseInstance, 'Greet', inputs.Greet);

        // Retrieve subcase 
        const parentCaseInstance = await CaseService.getCase(sender, caseInstance);
        const subCase = parentCaseInstance.planitems.find(item => item.name === 'call helloworld') as PlanItem;
        
        // Sender is the owner of the parent case and receiver doesn't exist in the parent case
        await assertCaseTeamUser(sender, caseInstance, new CaseOwner(sender, []));
        await assertCaseTeamUser(sender, caseInstance, new CaseTeamUser(receiver, []), false);

        await assertPlanItem(sender, caseInstance, subCase.name, subCase.index, State.Active);

        // Get subcase is possible by sender
        const childCaseInstance = await assertCasePlan(sender, subCase.id, State.Active);

        // Sender is the owner of the subcase and receiver doesn't exist in the subcase yet
        await assertCaseTeamUser(sender, childCaseInstance, new CaseOwner(sender, []));
        await assertCaseTeamUser(sender, childCaseInstance, new CaseTeamUser(receiver, []), false);

        // Get Receive Greeting task
        const receiveTaskName = 'Receive Greeting and Send response';
        const tasks = await TaskService.getCaseTasks(sender, childCaseInstance);
        const receiveGreetingTask = findTask(tasks, receiveTaskName);

        // Complete Receive Greeting task by sender
        await TaskService.completeTask(sender, receiveGreetingTask, taskOutput);

        // Get Read Response task
        const responseTaskName = 'Read response';
        const nextTasks = await TaskService.getCaseTasks(sender, childCaseInstance);
        const readResponseTask = findTask(nextTasks, responseTaskName);

        // Sender assigns the Read Response task to receiver
        await TaskService.assignTask(sender, readResponseTask, receiver);

        // Now, receiver is part of the subcase team and completes the Read Response task
        await assertCaseTeamUser(sender, childCaseInstance, new CaseTeamUser(receiver, []));

        // Receiver completes the Read Response task
        await TaskService.completeTask(receiver, readResponseTask);

        // Both subcase and parent case plans should be completed
        await assertCasePlan(sender, childCaseInstance, State.Completed);

        // Give the server some time to respond back from subcase to parent case
        await assertPlanItem(sender, caseInstance, subCase.name, subCase.index, State.Completed);

        // And now check parent case.
        await assertCasePlan(sender, parentCaseInstance, State.Completed);

        // Still, receiver should not be part of the parent case team
        await assertCaseTeamUser(sender, parentCaseInstance, new CaseTeamUser(receiver, []), false);
    }
}