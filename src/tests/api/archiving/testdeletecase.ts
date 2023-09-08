'use strict';

import Definitions from '../../../cmmn/definitions/definitions';
import State from '../../../cmmn/state';
import CaseService from '../../../service/case/caseservice';
import StorageService from '../../../service/storage/storageservice';
import CaseHierarchy from '../../../test/casehierarchy';
import TestCase from '../../../test/testcase';
import { PollUntilSuccess, SomeTime } from '../../../test/time';
import WorldWideTestTenant from '../../worldwidetesttenant';

const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const user = worldwideTenant.sender;
const definition = Definitions.ComplexCase;

export default class TestDeleteCase extends TestCase {
  isDefaultTest = false;

  async onPrepareTest() {
    await worldwideTenant.create();
    await definition.deploy(user, tenant);
  }

  async run() {

    const inputs = {
      Greeting: {
        Message: 'Hello there',
        From: user.id
      }
    };
    const startCase = { tenant, definition, debug: true };

    const caseInstance = await CaseService.startCase(user, startCase).then(id => CaseService.getCase(user, id));
    this.addIdentifier(caseInstance);
    const caseHierarchy = CaseHierarchy.from(user, caseInstance);
    await caseHierarchy.load();

    // The process task deep down in complexcase needs time to fail. We should await that.
    caseHierarchy.findProcessTask('GetList')?.assertState(State.Failed);

    console.log(">>>>>>>> DELETING Case " + caseInstance.id);

    await StorageService.deleteCase(user, caseInstance);

    await SomeTime(1000);

    await CaseService.getDiscretionaryItems(user, caseInstance, 404);

    await PollUntilSuccess(async () => {
      // Now verify that our case hierarchy has no events left in the event journal.
      await caseHierarchy.loadEventHierarchy();
      console.log("\n\nTotal event count: " + caseHierarchy.totalEventCount);
      if (caseHierarchy.totalEventCount > 0) {
        throw new Error(`Did not expect to find any events in the case, but found ${caseHierarchy.totalEventCount}:\n${caseHierarchy.printEvents()}`)
      }
    });
  }
}
