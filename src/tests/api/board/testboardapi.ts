'use strict';

import TestCase from '@cafienne/typescript-client/test/testcase';
import BoardService from '../../../framework/board/boardservice';
import WorldWideTestTenant from '../../worldwidetesttenant';
import {getRawInput} from "readline-sync";


const worldwideTenant = new WorldWideTestTenant();
const user = worldwideTenant.sender;

export default class TestBoardAPI extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
    }

    async run() {
        let boardId = 'MySecondBoard4';

        await BoardService.createBoard(user, {
            title: "title",
            id: boardId
        })

        await BoardService.getBoard(user, boardId);

        await BoardService.getBoards(user);

        await BoardService.addTeam(user, {
            boardId: boardId,
            team: [{ subject: user.id, roles: ['BOARD_MANAGER', 'APPROVE']}]
        });

        await BoardService.getTeamForBoard(user, boardId);
    }
}
