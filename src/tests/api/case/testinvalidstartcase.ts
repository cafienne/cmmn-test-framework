'use strict';

import CaseService from '../../../framework/service/case/caseservice';
import TestCase from '../../../framework/test/testcase';
import WorldWideTestTenant from '../../worldwidetesttenant';
import RepositoryService from '../../../framework/service/case/repositoryservice';
import CaseTeamMember from '../../../framework/cmmn/caseteammember';
import CaseTeam from '../../../framework/cmmn/caseteam';
import TenantService from '../../../framework/service/tenant/tenantservice';
import StartCase from '../../../framework/service/case/startcase';

const repositoryService = new RepositoryService();
const definition = 'caseteam.xml';

const caseService = new CaseService();
const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const sender = worldwideTenant.sender;
const receiver = worldwideTenant.receiver;
const employee = worldwideTenant.employee;


export default class TestInvalidStartCase extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
        await repositoryService.validateAndDeploy(definition, sender, tenant);
        await new TenantService().addTenantUserRole(sender, worldwideTenant.tenant, sender.id, "Receiver");
    }

    startCase: StartCase = { tenant, definition, debug: true };

    async run() {

        const startCase = this.startCase;

        // Case team without owner
        startCase.caseTeam = new CaseTeam([new CaseTeamMember(sender)]);
        await this.tryStartCase("Missing owner should fail");

        // Case team with invalid roles
        startCase.caseTeam = new CaseTeam([new CaseTeamMember(sender, undefined, true, ["ADMIN", "Not-Exisitng-TenantRole-Still-Allowed-In-Team"])]);
        await this.tryStartCase("Invalid roles should fail");
        

        // TODO: add a check for invalid member type in the backend??

        // Case team with invalid member type
        // startCase.caseTeam = new CaseTeam([new CaseTeamMember(sender, 'wrong-type', true)]);
        // await this.tryStartCase("Wrong member type should fail");


        // Remove case team, sender would become member and owner of the new case to be started (if that ever succeeds ...)
        delete startCase.caseTeam;


        // TODO: Engine chokes on below test case, to be fixed some time

        // Invalid format of case instance id
        // startCase.caseInstanceId = 'Ueè';
        // await this.tryStartCase(`Invalid case instance id '${startCase.caseInstanceId}' should fail`);

        // Invalid format of case instance id
        startCase.caseInstanceId = tenant;
        await this.tryStartCase(`Invalid case instance id '${startCase.caseInstanceId}' should fail`);


        // Remove invalid case instance id and let it be generated by server
        delete startCase.caseInstanceId;

        // Wrong tenant should fail
        startCase.tenant = 'not-existing-tenants';
        await this.tryStartCase(`Wrong tenant should fail`);

        startCase.tenant = tenant;

        // Wrong input should fail
        startCase.inputs = {'not-existing-input-parameter': 123};
        await this.tryStartCase(`Wrong inputs should fail`);


        // TODO: case engine throws 500 for below test case, but should return something like bad request 

        // Remove definition should make it fail
        delete startCase.definition;
        await this.tryStartCase(`Missing case definition should fail`);
    }

    async tryStartCase(msg: string) {
        console.log(msg);
        await caseService.startCase(this.startCase, sender, false).then(response => response.text()).then(response => {
            console.log("Response text: " + response);
        });
    }
}