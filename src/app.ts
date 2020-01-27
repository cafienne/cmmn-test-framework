import TestCase from './framework/test/testcase';
import TestStatsAPI from './tests/api/case/stats';
import TestUsersCaseAPI from './tests/api/case/usercases';
import TestDiscretionaryItems from './tests/api/discretionary/testdiscretionaryitems';
import TestDebugMode from './tests/api/debug/testdebugmode';
import TestHelloworld from './tests/helloworld/helloworld';
import TestTenantRegistration from './tests/api/tenant/tenantregistration';
import TestTaskValidationAPI from './tests/api/task/taskvalidation';


function findTestsFromCommandLineArguments(): Array<string> {
    // TODO: it will be nice if we can implement running test cases given from command line,
    //  but as of now (because TypeScript transpiling the class names?) they cannot be found in runtime based on string
    const stringList = process.argv.slice(2);
    if (stringList.length > 0) {
        console.log('Command line arguments are not yet supported')
    }
    return [];
}

function getHardCodedTestDeclarations(): Array<any> {
    return [
        TestHelloworld
        , TestUsersCaseAPI

        // Test currently fails with in-memory configuration of Cafienne Engine. (it works in cassandra+postgres combination)
        // , TestStatsAPI

        // For now, TestDiscretionaryItems is commented out, because planning.xml is not deployed by default
        // , TestDiscretionaryItems
        //  And same for testing task validation, which requires taskoutputvalidation.xml
        // , TestTaskValidationAPI
        , TestDebugMode
        , TestTenantRegistration
    ];
}

console.log('=========\nCreating test cases\n')
const testDeclarations = getHardCodedTestDeclarations().concat(findTestsFromCommandLineArguments());

function getTestCaseInstances(testDeclarations: Array<any>) {
    // Filter out undefined tests (e.g., because trailing comma is first one)
    return testDeclarations.filter(test => test).map(test => {
        if (test instanceof TestCase) return test;
        if (typeof (test) === 'function') {
            return new test();
        }
        throw new Error('Test ' + test + ' of type "' + typeof (test) + '" cannot be converted to a TestCase');
    });
}

async function runTests(testDeclarations: Array<any>) {
    const tests: Array<TestCase> = getTestCaseInstances(testDeclarations);
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const calculatedWhitespace = '                            '.substring(test.name.length)
        try {
            console.log(`\n
#######################################################
#                                                     #
#      PREPARING TEST:  "${test.name}"${calculatedWhitespace}#
#                                                     #
#######################################################
                        `);
            const preparationDone = await test.onPrepareTest();
            console.log(`\n
#######################################################
#                                                     #
#      STARTING TEST:   "${test.name}"${calculatedWhitespace}#
#                                                     #
#######################################################
                        `);
            const testRun = await test.run();
            console.log(`\n
#######################################################
#                                                     #
#      CLOSING TEST:    "${test.name}"${calculatedWhitespace}#
#                                                     #
#######################################################
                        `);
            const closeDone = await test.onCloseTest();
        } catch (error) {
            throw {
                test: test.name,
                number: i + 1,
                error
            }
        }
    }
}

const startTime = new Date();
console.log('=========\n\nStarting test cases at ' + startTime + '\n');

runTests(testDeclarations).then(done => {
    const endTime = new Date();
    console.log('\n=========\n\nTesting completed in ' + (endTime.getTime() - startTime.getTime()) + ' milliseconds at ' + endTime + '\n');
    process.exit(0)
}).catch(e => {
    console.error(`\n\nTest ${e.number} "${e.test}" failed with error\n\n`, e.error);
    process.exit(-1);
});
