'use strict';

import { SomeTime } from '@cafienne/typescript-client';
import TestCase from '@cafienne/typescript-client/test/testcase';
import BoardFlowService from '../../../framework/board/boardflowservice';
import BoardService from '../../../framework/board/boardservice';
import ColumnDetails from '../../../framework/board/columndetails';
import WorldWideTestTenant from '../../worldwidetesttenant';


const worldwideTenant = new WorldWideTestTenant();
const user = worldwideTenant.sender;

export default class TestBoardFlowAPI extends TestCase {
    isDefaultTest: boolean = false;
    async onPrepareTest() {
        await worldwideTenant.create();
    }

    async run() {
        const board = await BoardService.createBoard(user, {
            title: "Board to Test Flow API",
        })

        console.log("Created board " + JSON.stringify(board, undefined, 2))

        // await SomeTime(5000)

        board.form = {
            schema: {
            },
            uiSchema: {
            }
        };
        await BoardService.updateBoard(user, board);

        const column: ColumnDetails = {
            title: 'FirstColumn',
            form: board.form,
        }

        const column2: ColumnDetails = {
            title: 'SecondColumn',
            form: board.form,
        }

        await BoardService.addColumn(user, board, column);

        await BoardService.addColumn(user, board, column2);

        const flow = await BoardFlowService.startFlow(user, board, { subject: 'MyFirstFlow', data: { input: "een getal"}});
        const flow2 = await BoardFlowService.startFlow(user, board, { subject: 'MySecondFlow', data: { somethingElse: false}});

        await SomeTime(2000)

        
        const boardResponse = await BoardService.getBoard(user, ''+board.id);
        const task = boardResponse.columns[0].tasks.find((task: any) => task.flowId === flow.id);

        await BoardFlowService.claimFlowTask(user, board, task.flowId, task.id);
        await BoardFlowService.saveFlowTask(user, board, task.flowId, task.id, "MyFirstFlowWithChangedSubject", { input: "een ander getal"});
        await BoardFlowService.completeFlowTask(user, board, task.flowId, task.id, "MyFirstFlowWithOriginalSubject", { input: "een getal"});

        await SomeTime(1000)
        const boardResponse2 = await BoardService.getBoard(user, ''+board.id);
        const task2 = boardResponse2.columns[1].tasks.find((task: any) => task.flowId === flow.id);
        await BoardFlowService.completeFlowTask(user, board, task2.flowId, task2.id, "MyFirstFlow", { input: "Completing the first flow!"});

        await SomeTime(2000)
        await BoardService.getBoard(user, ''+board.id);

        console.log("Board ID: " + board.id)
        console.log("\n\nFlow id: " + flow.id)
        console.log("\nFlow2: " + flow2.id)


    }
}
