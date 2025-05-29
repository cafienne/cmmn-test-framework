'use strict';

import Definitions from "../../../../../cmmn/definitions/definitions";
import PlanItem from "../../../../../cmmn/planitem";
import State from "../../../../../cmmn/state";
import Transition from "../../../../../cmmn/transition";
import CaseFileService from "../../../../../service/case/casefileservice";
import CasePlanService from "../../../../../service/case/caseplanservice";
import CaseService from "../../../../../service/case/caseservice";
import TaskService from "../../../../../service/task/taskservice";
import { assertCasePlan, assertPlanItem } from "../../../../../test/caseassertions/plan";
import Comparison from "../../../../../test/comparison";
import TestCase from "../../../../../test/testcase";
import WorldWideTestTenant from "../../../../setup/worldwidetesttenant";
import SimpleDataMock from "../../stage/simpledatamock";

const definition = Definitions.SubCaseWithArrayOutput;
const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const user = worldwideTenant.sender;

const port = 1343;
const mock = new SimpleDataMock(port);


export default class TestSubCaseFailureBubble extends TestCase {
    async onPrepareTest() {
        await mock.start();
        await worldwideTenant.create();
        await definition.deploy(user, tenant);
    }

    async run() {
        const inputs = { in: 'Just a simple message' }
        const startCase = { tenant, definition, inputs };

        // Start the parent case
        const caseInstance = await CaseService.startCase(user, startCase).then(async id => CaseService.getCase(user, id));
        this.addIdentifier(caseInstance);
        // Retrieve subcase 
        const subCasePlanItem = caseInstance.planitems.find(item => item.name === 'simpleinoutcase') as PlanItem;

        await assertPlanItem(user, caseInstance, subCasePlanItem.name, subCasePlanItem.index, State.Active);

        // Get subcase is possible by sender
        const subCaseInstance = await assertCasePlan(user, subCasePlanItem.id, State.Active);

        await CaseFileService.replaceCaseFileItem(user, subCaseInstance, 'in', mock.error_data);

        const numTasksToComplete = 3;
        const expectedCaseFileOutput: any[] = [];
        for (let i = 0; i < numTasksToComplete; i++) {
            const taskInstance = await assertPlanItem(user, subCaseInstance, 'Task', i, State.Active);
            const taskOutput = { Out: i };
            expectedCaseFileOutput.push(i);
            await TaskService.completeTask(user, taskInstance, taskOutput);
        }
        

        await CasePlanService.raiseEvent(user, subCaseInstance, 'Fail ProcessTask');
        await assertCasePlan(user, subCaseInstance, State.Failed);
        await assertPlanItem(user, caseInstance, subCasePlanItem.name, subCasePlanItem.index, State.Failed);
        await assertCasePlan(user, caseInstance, State.Failed);

        await CaseFileService.getCaseFile(user, subCaseInstance).then(file => {
            console.log("Completed Case Task with output: " + JSON.stringify(file, undefined, 2));
            if (! Comparison.containsArray(file.out, expectedCaseFileOutput)) {
                throw new Error(`Expecting at least case file output ${expectedCaseFileOutput} but found ${file.out}`);
            };    
        })

        await CaseFileService.getCaseFile(user, caseInstance).then(file => {
            if (file.out !== undefined && file.out.length > 0) {
                throw new Error(`Main Case should not yet have case file 'output' but found ${file.out}`);
            }
        });

        await CaseFileService.replaceCaseFileItem(user, caseInstance, 'in', mock.success_data);
        await CasePlanService.makePlanItemTransition(user, caseInstance, subCaseInstance.id, Transition.Reactivate);

        await assertCasePlan(user, subCaseInstance, State.Active);

        await CasePlanService.raiseEvent(user, subCaseInstance, 'Complete Case');
        await assertCasePlan(user, subCasePlanItem.id, State.Completed);
        await assertPlanItem(user, caseInstance, subCasePlanItem.name, subCasePlanItem.index, State.Completed);
    }
}
