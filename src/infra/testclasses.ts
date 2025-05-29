
import TestAnonymousStartCase from '../tests/api/anonymous/testanonymousstartcase';
import TestNoAnonymousStartCase from '../tests/api/anonymous/testnoanonymousstartcase';
import TestArchiveCase from '../tests/api/archiving/testarchivecase';
import TestArchiveHelloworld from '../tests/api/archiving/testarchivehelloworld';
import TestDeleteCase from '../tests/api/archiving/testdeletecase';
import TestDeleteCaseAuthorization from '../tests/api/archiving/testdeletecaseauthorization';
import TestDeleteHelloworld from '../tests/api/archiving/testdeletehelloworld';
import TestDeleteTenant from '../tests/api/archiving/testdeletetenant';
import TestDeleteTenantWithContent from '../tests/api/archiving/testdeletetenantwithcontent';
import TestRestoreCase from '../tests/api/archiving/testrestorecase';
import TestRestoreCaseWithTimer from '../tests/api/archiving/testrestorecasewithtimer';
import TestFootballBusinessIdentifiers from '../tests/api/businessidentifiers/footballbusinessidentifiers/testfootballbusinessidentifiers';
import TestBusinessIdentifiers from '../tests/api/businessidentifiers/testbusinessidentifiers';
import TestHelloWorldBusinessIdentifiers from '../tests/api/businessidentifiers/testhelloworldbusinessidentifiers';
import TestCaseMigration from '../tests/api/case/migration/testcasemigration';
import TestCaseTeamMigration from '../tests/api/case/migration/testcaseteammigration';
import TestDiscretionaryMigration from '../tests/api/case/migration/testdiscretionarymigration';
import TestReactivationMigration from '../tests/api/case/migration/testreactivationmigration';
import TestRepetitionMigration from '../tests/api/case/migration/testrepetitionmigration';
import TestSubCaseMigration from '../tests/api/case/migration/testsubcasemigration';
import TestBootstrapCaseFileEvents from '../tests/api/case/testbootstrapcasefileevents';
import TestDefinitionInStartCase from '../tests/api/case/testdefinitioninstartcase';
import TestInvalidStartCase from '../tests/api/case/testinvalidstartcase';
import TestStatsAPI from '../tests/api/case/teststatsapi';
import TestValidStartCase from '../tests/api/case/testvalidstartcase';
import TestUsersCaseAPI from '../tests/api/case/usercases';
import TestCaseFileAPI from '../tests/api/casefile/testcasefileapi';
import TestCaseFileArrayAPI from '../tests/api/casefile/testcasefilearrayapi';
import TestCaseParameterAPI from '../tests/api/casefile/testcaseparameterapi';
import TestTaskBindingRefinement from '../tests/api/casefile/testtaskbindingrefinement';
import TestTaskCompletion from '../tests/api/casefile/testtaskcompletion';
import TestTaskOutputOperations from '../tests/api/casefile/testtaskoutputoperations';
import TestTimer from '../tests/api/caseplan/event/testtimer';
import TestEntryCriteriaOnRecovery from '../tests/api/caseplan/sentry/testentrycriteriaonrecovery';
import TestClassicFaultHandling from '../tests/api/caseplan/stage/testclassicfaulthandling';
import TestEntryCriteriaOnCaseInputParameters from '../tests/api/caseplan/stage/testentrycriteriaoncaseinputparameters';
import TestFaultBubbling from '../tests/api/caseplan/stage/testfaultbubbling';
import TestModelBasedReactivate from '../tests/api/caseplan/stage/testmodelbasedreactivate';
import TestNoFaultBubbling from '../tests/api/caseplan/stage/testnofaultbubbling';
import TestStage from '../tests/api/caseplan/stage/teststage';
import TestSubCaseFailureBubble from '../tests/api/caseplan/task/casetask/testsubcasefailurebubble';
import TestSubCaseTasks from '../tests/api/caseplan/task/casetask/testsubcasetasks';
import TestAuthenticationFlow from '../tests/api/caseplan/task/testauthenticationflow';
import TestProcessTask from '../tests/api/caseplan/task/testprocesstask';
import TestTaskWithSpaces from '../tests/api/caseplan/task/testtaskwithspaces';
import TestCasePlanAPI from '../tests/api/caseplan/testcaseplanapi';
import TestCasePlanHistoryAPI from '../tests/api/caseplan/testcaseplanhistoryapi';
import TestEventAuthorization from '../tests/api/caseplan/testeventauthorization';
import TestCaseTeam from '../tests/api/caseteam/testcaseteam';
import TestCaseTeamAPI from '../tests/api/caseteam/testcaseteamapi';
import TestCaseTeamAuthorizations from '../tests/api/caseteam/testcaseteamauthorizations';
import TestCaseTeamConsentGroupAPI from '../tests/api/caseteam/testcaseteamconsentgroupapi';
import TestCaseTeamTaskAuthorizations from '../tests/api/caseteam/testcaseteamtaskauthorizations';
import TestCaseTeamTaskAuthorizationsForGroups from '../tests/api/caseteam/testcaseteamtaskauthorizationsforgroups';
import TestCaseTeamTenantRoleMembers from '../tests/api/caseteam/testcaseteamtenantrolemembers';
import TestCaseWithoutUserMembership from '../tests/api/caseteam/testcasewithoutusermembership';
import TestStartCaseEmptyRole from '../tests/api/caseteam/teststartcaseemptyrole';
import TestTenantGroupMembership from '../tests/api/caseteam/testtenantgroupmembership';
import TestConsentGroupAPI from '../tests/api/consentgroup/testconsentgroupapi';
import TestDebugMode from '../tests/api/debug/testdebugmode';
import TestDiscretionaryItems from '../tests/api/discretionary/testdiscretionaryitems';
import TestDocumentationAPI from '../tests/api/documentation/testdocumentationapi';
import PingTestEnvironment, { PingTokenService } from '../tests/api/environment/ping';
import TestRecovery from '../tests/api/environment/testrecovery';
import TestResponseType from '../tests/api/environment/testresponsetype';
import TestSwagger from '../tests/api/environment/testswagger';
import TestTokenValidation from '../tests/api/environment/tokentest';
import TestCaseFileExpressions from '../tests/api/expression/testcasefileexpressions';
import TestRepeatWithMapping from '../tests/api/expression/testrepeatwithmapping';
import TestStageTaskExpressions from '../tests/api/expression/teststagetaskexpressions';
import TestTaskExpressions from '../tests/api/expression/testtaskexpressions';
import TestInvalidDefinitions from '../tests/api/repository/testinvaliddefinitions';
import TestRecursiveDefinitions from '../tests/api/repository/testrecursivedefinitions';
import TestRepositoryAPI from '../tests/api/repository/testrepositoryapi';
import TestRepeatStage from '../tests/api/stage/testrepeatstage';
import TestArraySubCase from '../tests/api/task/case/testarraysubcase';
import TestSubCase from '../tests/api/task/case/testsubcase';
import TestDynamicForm from '../tests/api/task/humantask/testdynamicform';
import TestFourEyes from '../tests/api/task/humantask/testfoureyes';
import TestTaskAPI from '../tests/api/task/humantask/testtaskapi';
import TestTaskCountAPI from '../tests/api/task/humantask/testtaskcountapi';
import TestTaskFilterAPI from '../tests/api/task/humantask/testtaskfilterapi';
import TestTaskFilterAPI2 from '../tests/api/task/humantask/testtaskfilterapi2';
import TestTaskValidationAPI from '../tests/api/task/humantask/testtaskvalidationapi';
import TestGetListGetDetails from '../tests/api/task/process/http/getlistgetdetails';
import TestGetListNow from '../tests/api/task/process/http/getlistnow';
import TestDashedParameters from '../tests/api/task/process/http/testdashedparameters';
import TestInputMappingFailure from '../tests/api/task/process/http/testinputmappingfailure';
import TestSMTP from '../tests/api/task/process/mail/testsmtp';
import TestProcessTaskMigration from '../tests/api/task/process/migration/testprocesstaskmigration';
import TestCalculation from '../tests/api/task/process/testcalculation';
import TestTenantRegistration from '../tests/api/tenant/testtenantregistration';
import TestVersion from '../tests/api/version/testversion';
import TestCompatibility from '../tests/compatibility/testcompatibility';
import TestHelloworld from '../tests/helloworld/testhelloworld';
import TestIncidentManagement from '../tests/incidentmanagement/incidentmanagement';
import TestTravelRequest from '../tests/travelrequest/testtravelrequest';
import TestRunner from './testrunner';

export default class TestClasses {
    static getTestClass(name: string): Function {
        const t = AllTests.find(t => (t.name.toLowerCase() === name.toLowerCase() || t.name.toLowerCase() === `test${name}`.toLowerCase()));
        if (!t) {
            throw new Error(`Cannot find a test '${name}'`);
        }
        return t;
    }

    /**
     * Map the list of string to a series of constructors of corresponding test classes.
     * Note that '*' gives a collection of all test classes and 'storage' gives the archival & deletion testcases (they are not default).
     * This enables to run both storage and other classes in one 
     */
    static createTestRunners(list: Array<string>): Array<TestRunner> {
        const runners: Array<TestRunner> = [];
        const addRunner = (test: Function, needsRunning: boolean) => runners.push(new TestRunner(test, needsRunning));
        const addExplicitRunner = (test: Function) => addRunner(test, true);
        const addDefaultRunner = (test: Function) => addRunner(test, false);

        const from = (list.length === 2 && list[0] === 'from' && Number(list[1]) > 0) ? Number(list[1]) : -1;

        if (!list.length || from > 0) {
            AllTests.forEach(addDefaultRunner);
        } else {
            list.forEach(name => {
                if (name === '*') {
                    AllTests.forEach(addDefaultRunner);
                } else if (name === 'storage') {
                    StorageTests.forEach(addExplicitRunner);
                } else if (name === 'migration') {
                    MigrationTests.forEach(addExplicitRunner);
                } else {
                    addExplicitRunner(this.getTestClass(name));
                }
            });
        }
        // Filter out the tests that do not to be ran.
        const foundRunners = runners.filter(run => run.needsRunning())
        const actualRunners = from > 0 ? foundRunners.splice(from - 1) : foundRunners;
        // Give each runner the right test number, starting from 1 as that is more "human-intuitive"
        actualRunners.forEach((run, index) => run.testNumber = index + 1);
        return actualRunners;
    }
}

const StorageTests: Array<Function> = [
    TestArchiveHelloworld,
    TestArchiveCase,
    TestRestoreCase,
    TestRestoreCaseWithTimer,
    TestDeleteCase,
    TestDeleteHelloworld,
    TestDeleteTenant,
    TestDeleteTenantWithContent,
    TestDeleteCaseAuthorization
];

const MigrationTests: Array<Function> = [
    TestProcessTaskMigration
    , TestProcessTaskMigration
    , TestCaseMigration
    , TestSubCaseMigration
    , TestCaseTeamMigration
    , TestReactivationMigration
    , TestRepetitionMigration
    , TestDiscretionaryMigration
];

const AllTests: Array<Function> = [
    PingTokenService
    , PingTestEnvironment
    , TestResponseType
    , TestSwagger
    , TestHelloworld
    , TestVersion
    , TestTenantRegistration
    , TestConsentGroupAPI
    , TestTaskCompletion
    , TestTaskOutputOperations
    , TestTaskBindingRefinement
    , TestEntryCriteriaOnCaseInputParameters
    , TestEntryCriteriaOnRecovery
    , TestStage
    , TestFaultBubbling
    , TestClassicFaultHandling
    , TestModelBasedReactivate
    , TestNoFaultBubbling
    , TestSubCaseFailureBubble
    , TestSubCaseTasks
    , TestTimer
    , TestUsersCaseAPI
    , TestDiscretionaryItems
    , TestStatsAPI
    , TestTaskValidationAPI
    , TestTaskAPI
    , TestTaskFilterAPI
    , TestTaskFilterAPI2
    , TestTaskCountAPI
    , TestTaskWithSpaces
    , TestDynamicForm
    , TestFourEyes
    , TestDebugMode
    , TestDocumentationAPI
    , TestRepositoryAPI
    , TestInvalidDefinitions
    , TestRecursiveDefinitions
    , TestTokenValidation
    , TestCaseFileAPI
    , TestCaseFileArrayAPI
    , TestCaseFileExpressions
    , TestCaseParameterAPI
    , TestBootstrapCaseFileEvents
    , TestCasePlanAPI
    , TestCasePlanHistoryAPI
    , TestBusinessIdentifiers
    , TestFootballBusinessIdentifiers
    , TestHelloWorldBusinessIdentifiers
    , TestRepeatWithMapping
    , TestTaskExpressions
    , TestStageTaskExpressions
    , TestProcessTask
    , TestAuthenticationFlow
    , TestCaseTeamAPI
    , TestCaseTeam
    , TestCaseTeamTenantRoleMembers
    , TestCaseTeamConsentGroupAPI
    , TestCaseTeamTaskAuthorizations
    , TestCaseTeamTaskAuthorizationsForGroups
    , TestCaseTeamAuthorizations
    , TestEventAuthorization
    , TestArchiveHelloworld
    , TestArchiveCase
    , TestDeleteCase
    , TestDeleteCaseAuthorization
    , TestDeleteHelloworld
    , TestDeleteTenant
    , TestDeleteTenantWithContent
    , TestIncidentManagement
    , TestTravelRequest
    , TestInvalidStartCase
    , TestValidStartCase
    , TestStartCaseEmptyRole
    , TestTenantGroupMembership
    , TestCaseWithoutUserMembership
    , TestSubCase
    , TestArraySubCase
    , TestRepeatStage
    , TestSMTP
    , TestNoAnonymousStartCase
    , TestAnonymousStartCase
    , TestDefinitionInStartCase
    , TestCalculation
    , TestGetListNow
    , TestGetListGetDetails
    , TestDashedParameters
    , TestInputMappingFailure
    , ...StorageTests
    , ...MigrationTests
    , TestRecovery
    , TestCompatibility
];
