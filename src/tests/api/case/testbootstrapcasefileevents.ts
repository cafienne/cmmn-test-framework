'use strict';

import Definitions from "../../../cmmn/definitions/definitions";
import CaseService from "../../../service/case/caseservice";
import TestCase from "../../../test/testcase";
import WorldWideTestTenant from "../../setup/worldwidetesttenant";

const definition = Definitions.BootstrapCaseFileEvents;
const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const sender = worldwideTenant.sender;

export default class TestBootstrapCaseFileEvents extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
        await definition.deploy(sender, tenant);
    }

    async run() {
        const inputs = {
            Greeting: {
                Message: 'Checking whether the case decently starts',
            }, 
            OneMoreInput: {
                Message: 'One more message'
            }
        };
        
        const startCase = { tenant, definition, inputs, debug: true };
        // Sender starts the parent case
        const caseInstance = await CaseService.startCase(sender, startCase);
        this.addIdentifier(caseInstance);

        console.log(`Main case id: ${caseInstance.id}`);
    }
}