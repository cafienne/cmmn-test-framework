import Definitions from "../../../cmmn/definitions/definitions";
import CaseTeam from "../../../cmmn/team/caseteam";
import CaseTeamUser, { CaseOwner } from "../../../cmmn/team/caseteamuser";
import CaseMigrationService, { DefinitionMigration } from "../../../service/case/casemigrationservice";
import CaseService from "../../../service/case/caseservice";
import DebugService from "../../../service/case/debugservice";
import TaskService from "../../../service/task/taskservice";
import TenantService from "../../../service/tenant/tenantservice";
import { findTask } from "../../../test/caseassertions/task";
import TestCase from "../../../test/testcase";
import Util from "../../../test/util";
import WorldWideTestTenant from "../../setup/worldwidetesttenant";

const definition = Definitions.HelloWorld;
const worldwideTenant = new WorldWideTestTenant(Util.generateId('recoverable-tenant'));
const tenant = worldwideTenant.name;
const user = worldwideTenant.sender;

export default class TestRecovery extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
        await definition.deploy(user, tenant);
    }

    /**
     * @override
     */
    async run() {
        await this.runTenantRecovery();

        await this.runCaseRecovery();

        await this.runMigratedCaseRecovery();
    }

    async runTenantRecovery() {
        await DebugService.forceRecovery(user, tenant);

        // Assert the right owners
        await TenantService.getTenantOwners(user, tenant).then(owners => {
            console.log(`Found tenant owners ${owners}`);
        });

        await TenantService.getTenantUsers(user, tenant).then(users => {
            console.log(`Found ${users.length} tenant users`);
        });

    }

    async runCaseRecovery() {
        // Here you can fill your own case id. If not given, then a random id will be retrieved.
        const caseId = await this.getRandomCaseId();
        // const caseId = '';
        if (!caseId) {
            console.log(`User ${user.id} has no cases to recover`);
            return;
        }
        this.addIdentifier(caseId);
        await DebugService.forceRecovery(user, caseId);

        await CaseService.getDiscretionaryItems(user, caseId).then(items => {
            console.log(`Found ${items.discretionaryItems.length} items`);
        });
    }

    async getRandomCaseId() {
        const cases = await CaseService.getCases(user, { tenant });
        if (cases.length > 0) {
            return cases[0].id;
        } else {
            // Create a simple helloworld case and complete the first task in it
            const newCase = await CaseService.startCase(user, { tenant, definition, inputs: { Greeting: { Message: 'Hello there', From: user.id } } });
            const task = await TaskService.getCaseTask(user, newCase, 'Receive Greeting and Send response');
            await TaskService.completeTask(user, task, { Response: { Message: 'Toedeledoki' } });
            return newCase.id;
        }
    }

    async runMigratedCaseRecovery() {
        const startCase = {
            tenant,
            definition: 'helloworld_base.xml',
            inputs: { Greeting: { Message: 'Hello there', From: user.id } },
            caseTeam: new CaseTeam([new CaseOwner(user, ["ADMIN", "TempRole"]), new CaseTeamUser(worldwideTenant.receiver, ["OneMore"])])
        };

        const case1_before = await CaseService.startCase(user, startCase).then(instance => CaseService.getCase(user, instance));

        const firstTaskName = 'Receive Greeting and Send response';
        const taskOutput = { Response: { Message: 'Toedeledoki', } };
        const migratedDefinition = new DefinitionMigration("helloworld_migrated.xml");
        const case1Tasks_before = await TaskService.getCaseTasks(user, case1_before);
        const case1FirstTask = findTask(case1Tasks_before, firstTaskName);

        // Migrate caseInstance1, and then complete the task in case1
        const case1_after = await CaseMigrationService.migrateDefinition(user, case1_before, migratedDefinition).then(() => CaseService.getCase(user, case1_before));
        await TaskService.completeTask(user, case1FirstTask, taskOutput);

        // Remove case from memory
        await DebugService.forceRecovery(user, case1_before);

        // Reload it by getting the discretionary items
        await CaseService.getDiscretionaryItems(user, case1_before);
    }
}