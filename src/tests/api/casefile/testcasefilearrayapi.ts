'use strict';

import CaseService from '../../../framework/service/case/caseservice';
import TestCase from '../../../framework/test/testcase';

import WorldWideTestTenant from '../../worldwidetesttenant';
import RepositoryService from '../../../framework/service/case/repositoryservice';
import CaseFileService from '../../../framework/service/case/casefileservice';
import assertCaseFileContent from '../../../framework/test/caseassertions/file';
import Case from '../../../framework/cmmn/case';
import DebugService from '../../../framework/service/case/debugservice';

const definition = 'casefile.xml';

const worldwideTenant = new WorldWideTestTenant();
const user = worldwideTenant.sender;
const tenant = worldwideTenant.name;

export default class TestCaseFileArrayAPI extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
        await RepositoryService.validateAndDeploy(user, definition, tenant);
    }

    async run() {
        await this.createChildArray();
        await this.runRootArray();
    }

    async runRootArray() {
        const caseInstance = await this.createEmptyCase();
        const rootArray3Elements = [{
            RootProperty1: "string",
            RootProperty2: true
        }, {
            RootProperty1: "string",
            RootProperty2: true
        }, {
            RootProperty1: "string",
            RootProperty2: true
        }];

        await CaseFileService.createCaseFileItem(user, caseInstance, 'RootCaseFileArray', rootArray3Elements);
        const rootArray1Element = [{
            RootProperty1: "string1",
            RootProperty2: false
        }];

        await CaseFileService.getCaseFile(user, caseInstance).then(file => console.log(JSON.stringify(file, undefined, 2)));

        await CaseFileService.replaceCaseFileItem(user, caseInstance, 'RootCaseFileArray', rootArray1Element);
        // await CaseFileService.replaceCaseFileItem(user, caseInstance, 'RootCaseFileArray', rootArray1Element);
        await CaseFileService.getCaseFile(user, caseInstance).then(file => console.log(JSON.stringify(file, undefined, 2)));
    }

    async createEmptyCase(): Promise<Case> {
        const startCase = { tenant, definition };
        const caseInstance = await CaseService.startCase(user, startCase);
        return caseInstance;
    }

    async createChildArray(): Promise<Case> {
        this.logTestName("createChildArray");
        const caseInstance = await this.createEmptyCase();
        const initialCaseFile = { RootCaseFileItem: {}};

        await CaseFileService.createCaseFile(user, caseInstance, initialCaseFile);
        await assertCaseFileContent(user, caseInstance, '', initialCaseFile);

        const ChildArray  = [{
            ChildName: "child0",
            ChildAge: 0
        }, {
            ChildName: "child1",
            ChildAge: 1
        }, {
            ChildName: "child2",
            ChildAge: 2
        }];

        const path = 'RootCaseFileItem/ChildArray';

        await CaseFileService.createCaseFileItem(user, caseInstance, path, ChildArray);

        // Force the case to be removed from memory and then recovered. This causes cafienne engine issue https://github.com/cafienne/cafienne-engine/issues/235
        await DebugService.forceRecovery(user, caseInstance.id);

        await CaseFileService.updateCaseFileItem(user, caseInstance, path, ChildArray);

        const pathChild1 = 'RootCaseFileItem/ChildArray[1]';
        await CaseFileService.deleteCaseFileItem(user, caseInstance, pathChild1);

        const newChildren: Array<any> = ChildArray;
        newChildren[1] = null;
        await assertCaseFileContent(user, caseInstance, path, newChildren);

        return caseInstance;
    }


    logTestName(name: string) {
        console.log(`\n=============== CASE FILE API TEST ${name}`);
    }

}
