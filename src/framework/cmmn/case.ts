import User from '../user';
import CaseService from '../service/caseservice'
import PlanItem from './planitem';

const caseService = new CaseService();
export default class CaseInstance {
    inputs: object;
    caseTeam: object;
    definition: string;
    tenant: string;
    caseInstanceId: string;
    json: object = {};
    planItems: Array<PlanItem> = [];
    caseFile: any = undefined;

    /**
     * Create a local case instance proxy.
     * This can be used to 
     * @param {String} definition 
     * @param {String} tenant 
     * @param {*} inputs
     * @param {*} caseTeam
     * @param {String} caseInstanceId
     */
    constructor(definition: string, tenant: string, inputs:object, caseTeam?:object, caseInstanceId?: string) {
        if (!definition) {
            throw new Error("Definition must be specified");
        }
        if (!tenant) {
            throw new Error("Tenant must be specified");
        }
        this.inputs = inputs;
        this.definition = definition;
        this.tenant = tenant;
        this.caseTeam = caseTeam ? caseTeam : {};
        this.caseInstanceId = caseInstanceId ? caseInstanceId : '';
    }

    /**
     * Fetches a new copy of the case information from the backend.
     * @param user 
     */
    async refreshData(user: User) {
        return caseService.getCase(this, user);
    }

    fillFromJson(json: any) {
        // console.log("Refreshed case information");
        this.json = json;
        // console.log("PIs:: "+JSON.stringify(json.planitems, undefined, 2))
        this.planItems = <Array<PlanItem>>json.planitems;
        this.caseFile = json.file;
    }
}
