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
import { CompanyTestTenant } from '../../../../setup/worldwidetesttenant';

const worldwideTenant = new CompanyTestTenant();
const tenant = worldwideTenant.name;
const caseOwner = worldwideTenant.owner;
const manager = worldwideTenant.manager;
const employee = worldwideTenant.employee;

const definition = Definitions.Chain;

export default class TestSubCaseTasks extends TestCase {
  isDefaultTest = false;
  isParallelTest: boolean = false;
  // lineReaderEnabled = true;

  async onPrepareTest() {
    await worldwideTenant.create();
    await definition.deploy(caseOwner, tenant);
  }

  async run() {
    const caseTeam = new CaseTeam([new CaseOwner(caseOwner, []), new CaseTeamUser(manager, ["Manager"])]);
    const startCase = { tenant, caseTeam, definition } as StartCase;

    const caseInstance = await CaseService.startCase(caseOwner, startCase).then(id => CaseService.getCase(caseOwner, id));

    this.addIdentifier(caseInstance);
    const caseHierarchy = CaseEvents.from(caseOwner, caseInstance);
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

    // Case Owner should be able to access all tasks in the case and subcases.
    await assertTaskCount(caseOwner, caseInstance, true, 17, caseHierarchy);
    await assertTaskCount(caseOwner, caseInstance, false, 3, caseHierarchy);

    // Show that manager has limited access to the case tasks.
    await assertTaskCount(manager, caseInstance, true, 12, caseHierarchy);
    await assertTaskCount(manager, caseInstance, false, 2, caseHierarchy);

    // Show that the employee has no access to the case tasks.
    await TaskService.getCaseTasks(employee, caseInstance, true, 404);

    const subCase = caseHierarchy.findCaseTask('SubCase')?.id || '';

    await assertTaskCount(caseOwner, subCase, true, 7, caseHierarchy);
    await assertTaskCount(caseOwner, subCase, false, 4, caseHierarchy);
    await assertTaskCount(manager, subCase, true, 5, caseHierarchy);
    await assertTaskCount(manager, subCase, false, 3, caseHierarchy);

    caseTeam.users.push(new CaseTeamUser(employee, ["Employee"]));
    await CaseTeamService.setCaseTeam(caseOwner, subCase, caseTeam);

    // Receiver should not have access to the root case, but only to the subcase.
    //  Also, the count for both full subcase task chain and top level should be the same, as the receiver is not in any of the subcases.
    await TaskService.getCaseTasks(employee, caseInstance, true, 404);
    await assertTaskCount(employee, subCase, true, 2, caseHierarchy);
    await assertTaskCount(employee, subCase, false, 2, caseHierarchy);

    const subCase2 = caseHierarchy.findCaseTask('SubCase2')?.id || '';

    // Now show that receiver does not have access to the subcase2 case or any of its tasks.
    await CaseService.getCase(employee, subCase2, 404);
    await TaskService.getCaseTasks(employee, subCase2, true, 404);
    // And show that user has access to the subcase2 case and its tasks.
    await assertTaskCount(caseOwner, subCase2, true, 7, caseHierarchy);

    // Now check a case without human tasks.
    const technicalSubCase = caseHierarchy.findCaseTask('SubCase_Technical')?.id || '';
    await CaseService.getCase(caseOwner, technicalSubCase);
    await TaskService.getCaseTasks(employee, technicalSubCase, true, 404);
    await assertTaskCount(caseOwner, technicalSubCase, true, 0, caseHierarchy);
  }
}

async function assertTaskCount(user: User, caseInstance: Case | string, includeSubcase: boolean, expectedCount: number, tree: CaseEvents, trace: Trace = new Trace()) {
  return TaskService.getCaseTasks(user, caseInstance, includeSubcase).then(tasks => {
    console.log(`Found ${tasks.length} tasks`);
    let pref = ''
      tasks.sort((t1, t2) => t1.lastModified > t2.lastModified ? 1 : -1).forEach((task, index) => {
        if (task.caseInstanceId !== pref) {
          console.log(`\nTasks for Case Instance: ${task.caseInstanceId} - ${tree.findCaseName(task.caseInstanceId)}`);
          pref = task.caseInstanceId;
        }
        console.log(`- Task[${index + 1}]: ${task.taskName} (access=${task.performable} id=${task.id} case=${task.caseInstanceId} )`);
      });
    if (tasks.filter(task => task.performable).length !== expectedCount) {
      throw new Error(`Expected ${expectedCount} tasks in the case, but found ${tasks.length}`);
    }
  });
}
