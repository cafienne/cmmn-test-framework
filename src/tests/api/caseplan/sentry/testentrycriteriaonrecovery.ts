'use strict';

import { assertPlanItem } from '../../../..';
import State from '../../../../cmmn/state';
import CaseService from '../../../../service/case/caseservice';
import DebugService from '../../../../service/case/debugservice';
import RepositoryService from '../../../../service/case/repositoryservice';
import TaskService from '../../../../service/task/taskservice';
import TestCase from '../../../../test/testcase';
import WorldWideTestTenant from '../../../worldwidetesttenant';

const definition = 'entrycriteriaonrecovery.xml';

const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const user = worldwideTenant.sender;

export default class TestEntryCriteriaOnRecovery extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
        await RepositoryService.validateAndDeploy(user, definition, tenant);
    }

    async run() {
        const startCase = { tenant, definition };

        const caseInstance = await CaseService.startCase(user, startCase).then(id => CaseService.getCase(user, id));
        this.addIdentifier(caseInstance);
        const task1 = await assertPlanItem(user, caseInstance, 'Task1', 0, State.Active);
        const task2 = await assertPlanItem(user, caseInstance, 'Task2', 0, State.Active);
        const task3 = await assertPlanItem(user, caseInstance, 'Task3', 0, State.Available);

        // Complete first task
        await TaskService.completeTask(user, task1);

        // Take the case out of memory
        await DebugService.forceRecovery(user, caseInstance.id);

        // Bring the case back into memory
        await CaseService.getCase(user, caseInstance);

        // Complete second task
        await TaskService.completeTask(user, task2);

        await assertPlanItem(user, caseInstance, 'Task3', 0, State.Active);
    }

}
