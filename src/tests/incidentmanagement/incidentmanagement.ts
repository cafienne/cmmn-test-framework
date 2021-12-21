'use strict';

import CaseService from '../../framework/service/case/caseservice';
import TaskService from '../../framework/service/task/taskservice';
import TestCase from '../../framework/test/testcase';
import WorldWideTestTenant from '../worldwidetesttenant';
import RepositoryService from '../../framework/service/case/repositoryservice';
import { ServerSideProcessing } from '../../framework/test/time';
import { assertPlanItem} from '../../framework/test/caseassertions/plan'
import { assertTask, verifyTaskInput, findTask } from '../../framework/test/caseassertions/task'
import IncidentContent from './incidentmanagementcontent';
import CaseTeam from '../../framework/cmmn/team/caseteam';
import { CaseOwner } from '../../framework/cmmn/team/caseteamuser';
import CaseTeamUser from "../../framework/cmmn/team/caseteamuser";
import MockServer from '../../framework/mock/mockserver';
import GetMock from '../../framework/mock/getmock';

const definition = 'IncidentManagementForTraining.xml';

const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const raiser = worldwideTenant.sender;
const solver = worldwideTenant.receiver;
const employee = worldwideTenant.employee;

const mockPort = 17384;
const mockServer = new MockServer(mockPort);

const userMappings = new GetMock(mockServer, '/usermappings/:type', call => {
    const solver: string = "receiving-user";
    const raiser: string = "sending-user";
    const specialism = call.req.params['type'];
    let specialist = '';
    switch(specialism) {
        case "Quarterly_Statement": specialist = solver; break;
        case "Facility_Request": specialist = raiser; break;
    }
    if (!specialist) {
        call.writeHead(404, { 'Content-Type': 'text/plain' });
        call.write("There is no specialist for this type of ["+specialism+"]");
    } else {
        call.writeHead(200, { 'Content-Type': 'text/plain' });
        call.write(specialist);
    }
    call.end();
    call.setSyncMessage(`Someone asked for specialism ${specialism} and we found specialist ${specialist}`);
});

const notifyCustomer = new GetMock(mockServer, '/notifycustomer/:status', call => {
    const incidentStatus = call.req.params['status'];
    call.writeHead(200, { 'Content-Type': 'text/plain' });
    call.write("Notified Customer");
    call.end();
    call.setSyncMessage(`Notified customer on incident status ${incidentStatus}`);
})

export default class TestIncidentManagement extends TestCase {
    async onPrepareTest() {
        await mockServer.start();
        await worldwideTenant.create();
        await RepositoryService.validateAndDeploy(raiser, definition, tenant);
    }

    async run() {
        const inputs = IncidentContent.inputs;
        const firstTaskInput = IncidentContent.firstTaskInput;
        const caseTeam = new CaseTeam([new CaseOwner(raiser), new CaseTeamUser(solver)]);
        const startCase = { tenant, definition, inputs, caseTeam };
        const firstTaskName = 'Verify Details';

        await this.testValidStatus(startCase, firstTaskName, firstTaskInput);

        console.log(`\n
#############################################################################
Starting another case instance of incident management to test Invalid status.
#############################################################################
                    `);

        await this.testInvalidStatus(startCase, firstTaskName, firstTaskInput);
        // In the end, stop the mock service, such that the test completes.
        await mockServer.stop();

    }

    async testValidStatus(startCase: any, firstTaskName: string, firstTaskInput: any) {

        // Starts the case with raiser
        const caseInstance = await CaseService.startCase(raiser, startCase);

        // Get case tasks
        const tasks = await TaskService.getCaseTasks(raiser, caseInstance);

        // Get Verify Details task
        const verifyDetailsTask = findTask(tasks, firstTaskName);
        await verifyTaskInput(verifyDetailsTask, firstTaskInput);

        // Claim Verify Details task by raiser
        await TaskService.claimTask(raiser, verifyDetailsTask);
        await assertTask(raiser, verifyDetailsTask, 'Claim', 'Assigned', raiser, raiser);

        const verifyDetailsInputs = IncidentContent.verifyDetailsInputs;

        // Complete Verify Details task by raiser
        await TaskService.completeTask(raiser, verifyDetailsTask, verifyDetailsInputs);
        await assertTask(raiser, verifyDetailsTask, 'Complete', 'Completed', raiser);

        // Since process completion happens asynchronously in the Cafienne engine, we will still wait 
        //  a second before continuing the test script
        await ServerSideProcessing();

        // Verify completion of Assign Specialist plan item
        await assertPlanItem(raiser, caseInstance, 'Assign Specialist', 0, 'Completed');

        // Verify completion of Assigned plan item
        await assertPlanItem(raiser, caseInstance, 'Assigned', 0, 'Completed');


        // Next step fails too often
        await ServerSideProcessing();

        // Verify completion of first Notify Customer plan item
        await assertPlanItem(raiser, caseInstance, 'Notify Customer', 0, 'Completed');

        const secondTaskInput = IncidentContent.secondTaskInput;

        // Get case tasks
        const nextTasks = await TaskService.getCaseTasks(raiser, caseInstance);

        // Get Work on Incident task
        const workOnIncidentTask = findTask(nextTasks, 'Work on Incident');
        await verifyTaskInput(workOnIncidentTask, secondTaskInput);

        // Can't claim Work on Incident task by solver as he is assigned to it
        await TaskService.claimTask(solver, workOnIncidentTask, 400);
        await assertTask(raiser, workOnIncidentTask, 'Claim', 'Assigned', solver, solver);

        const finalTaskOutput = IncidentContent.finalTaskOutput;

        // employee cannot complete a task assigned to solver
        await TaskService.completeTask(employee, workOnIncidentTask, finalTaskOutput, 404);
        await assertTask(raiser, workOnIncidentTask, 'Claim', 'Assigned', solver);

        // Complete Work on Incident task by solver
        await TaskService.completeTask(solver, workOnIncidentTask, finalTaskOutput);
        await assertTask(raiser, workOnIncidentTask, 'Complete', 'Completed', solver);

        // Verify completion of Complete plan item
        await assertPlanItem(raiser, caseInstance, 'Complete', 0, 'Completed');

        await ServerSideProcessing();

        // Verify completion of second Notify Customer plan item
        await assertPlanItem(raiser, caseInstance, 'Notify Customer', 1, 'Completed');
    }

    async testInvalidStatus(startCase: any, firstTaskName: string, firstTaskInput: any) {

        // Starts the invalid case with raiser
        const caseInstance = await CaseService.startCase(raiser, startCase);

        // Get case tasks
        const tasks = await TaskService.getCaseTasks(raiser, caseInstance);

        // Get Verify Details task
        const verifyDetailsTask = findTask(tasks, firstTaskName);
        await verifyTaskInput(verifyDetailsTask, firstTaskInput);

        // Claim Verify Details task by raiser
        await TaskService.claimTask(raiser, verifyDetailsTask);
        await assertTask(raiser, verifyDetailsTask, 'Claim', 'Assigned', raiser, raiser);

        const verifyDetailsInputs = IncidentContent.verifyDetailsInputsInvalidCase;

        // Complete Verify Details task by raiser
        await TaskService.completeTask(raiser, verifyDetailsTask, verifyDetailsInputs);
        await assertTask(raiser, verifyDetailsTask, 'Complete', 'Completed', raiser);

        // Since process completion happens asynchronously in the Cafienne engine, we will still wait 
        //  a second before continuing the test script
        await ServerSideProcessing();

        // Verify completion of Invalid Status plan item
        await assertPlanItem(raiser, caseInstance, 'Invalid Status', 0, 'Completed');

        await ServerSideProcessing();

        // Verify completion of first Notify Customer plan item
        await assertPlanItem(raiser, caseInstance, 'Notify Customer', 0, 'Completed');

        // Verify completion of Complete plan item
        await assertPlanItem(raiser, caseInstance, 'Complete', 0, 'Available');
    }
}

