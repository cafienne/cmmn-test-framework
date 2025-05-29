'use strict';

import Case from '../../../../../cmmn/case';
import Definitions from '../../../../../cmmn/definitions/definitions';
import CaseTeam from '../../../../../cmmn/team/caseteam';
import CaseTeamUser, { CaseOwner } from '../../../../../cmmn/team/caseteamuser';
import Trace from '../../../../../infra/trace';
import CaseService from '../../../../../service/case/caseservice';
import CaseTeamService from '../../../../../service/case/caseteamservice';
import StartCase from '../../../../../service/case/startcase';
import CaseEvents from '../../../../../service/storage/caseevents';
import TaskService from '../../../../../service/task/taskservice';
import TestCase from '../../../../../test/testcase';
import User from '../../../../../user';
import WorldWideTestTenant from '../../../../setup/worldwidetesttenant';

const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const user = worldwideTenant.sender;
const receiver = worldwideTenant.receiver;

const definition = Definitions.Chain;

export default class TestSubCaseTasks extends TestCase {
  isDefaultTest = false;
  isParallelTest: boolean = false;
  // lineReaderEnabled = true;

  async onPrepareTest() {
    await worldwideTenant.create();
    await definition.deploy(user, tenant);
  }

  async run() {
    const caseTeam = new CaseTeam([new CaseOwner(user, [])]);
    const startCase = { tenant, team: caseTeam, definition } as StartCase;


    const caseInstance = await CaseService.startCase(user, startCase).then(id => CaseService.getCase(user, id));

    this.addIdentifier(caseInstance);
    const caseHierarchy = CaseEvents.from(user, caseInstance);
    await caseHierarchy.load();

    this.readLine(`Press enter to start test loop on ${definition} with case hierarchy\n ${caseHierarchy}`);

    while (true) {
      const line = this.readLine("Type p and press Enter to print event hierarchy. Press enter to archive the case ");
      if (line.indexOf('p') >= 0) {
        await caseHierarchy.loadEventHierarchy();
        console.log("Events: " + caseHierarchy.printEvents());
      } else {
        break;
      }
    }

    // await SomeTime(1000)

    await TaskService.getCaseTasks(worldwideTenant.receiver, caseInstance, true, 404);

    await assertTaskCount(user, caseInstance, true, 7);
    await assertTaskCount(user, caseInstance, false, 1);

    const subCase = caseHierarchy.findCaseTask('SubCase')?.id || '';

    await assertTaskCount(user, subCase, true, 3);
    await assertTaskCount(user, subCase, false, 2);

    caseTeam.users.push(new CaseTeamUser(receiver));
    await CaseTeamService.setCaseTeam(user, subCase, caseTeam);

    // Receiver should not have access to the root case, but only to the subcase.
    //  Also, the count for both full subcase task chain and top level should be the same, as the receiver is not in any of the subcases.
    await TaskService.getCaseTasks(receiver, caseInstance, true, 404);
    await assertTaskCount(receiver, subCase, true, 2);
    await assertTaskCount(receiver, subCase, false, 2);

    const subCase2 = caseHierarchy.findCaseTask('SubCase2')?.id || '';

    // Now show that receiver does not have access to the subcase2 case or any of its tasks.
    await CaseService.getCase(receiver, subCase2, 404);
    await TaskService.getCaseTasks(receiver, subCase2, true, 404);
    // And show that user has access to the subcase2 case and its tasks.
    await assertTaskCount(user, subCase2, true, 3);


    // Now check a case without human tasks.
    const technicalSubCase = caseHierarchy.findCaseTask('SubCase_Technical')?.id || '';
    await CaseService.getCase(user, technicalSubCase);
    await TaskService.getCaseTasks(receiver, technicalSubCase, true, 404);
    await assertTaskCount(user, technicalSubCase, true, 0);
  }
}

async function assertTaskCount(user: User, caseInstance: Case | string, includeSubcase: boolean, expectedCount: number, trace: Trace = new Trace()) {
  return TaskService.getCaseTasks(user, caseInstance, includeSubcase).then(tasks => {
    console.log(`Found ${tasks.length} tasks`);
      tasks.forEach((task, index) => {
        console.log(`Task[${index + 1}]: ${task.taskName} (id=${task.id} case=${task.caseInstanceId} )`);
      });
    if (tasks.length !== expectedCount) {
      throw new Error(`Expected ${expectedCount} tasks in the case, but found ${tasks.length}`);
    }
  });
}
