import Trace from "../../infra/trace";
import RepositoryService from "../../service/case/repositoryservice";
import Tenant from "../../tenant/tenant";
import User from "../../user";

export default class Definitions {
    public static readonly BootstrapCaseFileEvents = new Definitions('bootstrap-casefile-events.xml');
    public static readonly Calculation = new Definitions('calculation.xml');
    public static readonly CaseFile = new Definitions('casefile.xml');
    public static readonly CaseParameter = new Definitions('caseparameter.xml');
    public static readonly CaseTeam = new Definitions('caseteam.xml');
    public static readonly CaseWithSpace = new Definitions('casemetspatie.xml');
    public static readonly Chain = new Definitions('casetask/chain.xml');
    public static readonly Compatibility = new Definitions('compatibility.xml');
    public static readonly ComplexCase = new Definitions('complexcase.xml');
    public static readonly Documentation = new Definitions('documentation_case.xml');
    public static readonly DynamicTaskModel = new Definitions('dynamictaskmodel.xml');
    public static readonly EntryCriteriaOnCaseInputParameters = new Definitions('entrycriteriaoncaseinputparameters.xml');
    public static readonly EntryCriteriaOnRecovery = new Definitions('entrycriteriaonrecovery.xml');
    public static readonly EventListener = new Definitions('eventlistener.xml');
    public static readonly Expressions = new Definitions('expressions.xml');
    public static readonly FaultHandlingParentCase = new Definitions('faulthandling.xml');
    public static readonly FaultHandlingSubCase = new Definitions('faulthandling_subcase.xml');
    public static readonly FaultHandlingWithEntryCriterion = new Definitions('faulthandling_with_entrycriterion.xml');
    public static readonly FootballClubStats = new Definitions('footballclubstats.xml');
    public static readonly FootballStats = new Definitions('footballstats.xml');
    public static readonly FourEyes = new Definitions('four_eyes.xml');
    public static readonly GetListGetDetails = new Definitions('getlist_getdetails.xml');
    public static readonly GetListNow = new Definitions('getlist_immediately.xml');
    public static readonly InvokeCafienne = new Definitions('invokecafienne.xml');
    public static readonly HelloWorld = new Definitions('helloworld.xml');
    public static readonly HelloWorld2 = new Definitions('helloworld2.xml');
    public static readonly IncidentManagementForTraining = new Definitions('IncidentManagementForTraining.xml');
    public static readonly Migration_GetList = new Definitions('migration/getlist.xml');
    public static readonly Migration_GetList_v1 = new Definitions('migration/getlist_v1.xml');
    public static readonly Migration_v0 = new Definitions('migration/migration_v0.xml');
    public static readonly Migration_v1 = new Definitions('migration/migration_v1.xml');
    public static readonly Migration_HelloworldBase = new Definitions('helloworld_base.xml');
    public static readonly Migration_HelloworldMigrated = new Definitions('helloworld_migrated.xml');
    public static readonly Migration_RepeatingTask_v0 = new Definitions('migration/repeating_task_v0.xml');
    public static readonly Migration_RepeatingTask_v1 = new Definitions('migration/repeating_task_v1.xml');
    public static readonly Migration_Discretionary_v0 = new Definitions('migration/discretionary_v0.xml');
    public static readonly Migration_Discretionary_v1 = new Definitions('migration/discretionary_v1.xml');
    public static readonly Planning = new Definitions('planning.xml');
    public static readonly ProcessTaskTest = new Definitions('processtasktest.xml');
    public static readonly RepeatStageTest = new Definitions('repeatstagetest.xml');
    public static readonly RepeatWithMapping = new Definitions('repeat_with_mapping.xml');
    public static readonly SMTPTest = new Definitions('smtptest.xml');
    public static readonly SendMail = new Definitions('sendmail.xml');
    public static readonly StageTaskExpressions = new Definitions('stagetaskexpressions.xml');
    public static readonly StageTest = new Definitions('stagetest.xml');
    public static readonly SubCaseTest = new Definitions('subcasetest.xml');
    public static readonly SubCaseWithArrayOutput = new Definitions('subcasewitharrayoutput.xml');
    public static readonly TaskBindingRefinement = new Definitions('taskbindingrefinement.xml');
    public static readonly TaskOutputOperations = new Definitions('taskoutputoperations.xml');
    public static readonly TaskOutputValidation = new Definitions('taskoutputvalidation.xml');
    public static readonly Timer = new Definitions('timer.xml');
    public static readonly TravelRequest = new Definitions('travelrequest.xml');


    isDeployed: boolean = false;
    constructor(public file: string) {}

    toString() {
        return this.file;
    }

    async deploy(user: User, tenant: string | Tenant, trace: Trace = new Trace()) {
        if (! this.isDeployed) {
            await RepositoryService.validateAndDeploy(user, this.file, tenant, trace);
        }
        this.isDeployed = true;
    }
}
