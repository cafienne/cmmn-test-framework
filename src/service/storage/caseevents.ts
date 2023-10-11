import Case from "../../cmmn/case";
import PlanItem from "../../cmmn/planitem";
import State from "../../cmmn/state";
import { assertCasePlan } from "../../test/caseassertions/plan";
import { PollUntilSuccess } from "../../test/time";
import User from "../../user";
import CaseService from "../case/caseservice";
import ActorEvents from "./actorevents";
import PlanItemEvents from "./planitemevents";
import ProcessEvents from "./processevents";

/**
 * CaseEvents enables building a hierarchy of a case events with those from it's CaseTasks and ProcessTasks.
 */
export default class CaseEvents extends PlanItemEvents {
    static from(user: User, caseInstance: Case): CaseEvents {
        const fakedItem = new PlanItem(caseInstance.id, caseInstance.caseName, '', 'CaseTask', caseInstance.state, '', '', false, false, 0, caseInstance.lastModified, caseInstance.createdBy);
        return new CaseEvents(user, fakedItem);
    }

    cases: Array<CaseEvents> = [];
    processes: Array<ProcessEvents> = [];

    private constructor(public user: User, item: PlanItem, public parentCase?: CaseEvents) {
        super(user, item, parentCase);
    }

    async load() {
        // reset state of children.
        this.cases = [];
        this.processes = [];
        if (this.state.is(State.Available)) {
            return; // no need to load more details, as the plan item is not yet active
        }
        const caseInstance = await assertCasePlan(this.user, this.id, this.state) as Case;

        // Add sub cases
        const caseTasks = caseInstance.planitems.filter(item => item.type === 'CaseTask');
        for (const subCase of caseTasks) {
            await this.addCase(subCase).load();
        }

        // Now add process tasks to the list
        caseInstance.planitems.filter(item => item.type === 'ProcessTask').map(item => this.processes.push(new ProcessEvents(item, this)));
    }

    addCase(subCase: PlanItem): CaseEvents {
        const subCaseHierarchy = new CaseEvents(this.user, subCase, this);
        this.cases.push(subCaseHierarchy);
        return subCaseHierarchy;
    }

    findItem(name: string, type?: string): ActorEvents|undefined {
        const matches = (task: ActorEvents) => task.name === name && (!type || task.type === type);

        // Check if we ourselves match.
        if (matches(this)) return this;

        // Check if one of our process tasks matches
        const processTask = this.processes.find(matches);
        if (processTask) return processTask;

        // Search the item in our sub cases
        for (const subCase of this.cases) {
            const task = subCase.findItem(name, type);
            if (task) return task;
        } 
    }

    findProcessTask(name: string): ProcessEvents|undefined {
        const task = this.findItem(name, 'Process');
        console.log("Foudn task named " + name +": " + task?.constructor.name)
        if (task && task instanceof ProcessEvents) return task;
        return undefined;
    }

    private collect<T>(collector: (a: PlanItemEvents) => T): Array<T> {
        const list: Array<T> = [];
        list.push(...this.cases.map(collector));
        list.push(...this.processes.map(collector));
        return list;
    }

    print(indent: string = ''): string {
        const list: Array<string> = this.cases.map(c => c.print(indent + ' '));
        list.push(...this.processes.map(p => p.print(indent + ' ')));
        return `${super.print(indent)}${list.length ? '\n' + list.join('\n') : ''}`;
    }

    printEvents(indent: string = ''): string {
        console.log("PRINTING EVENTs OF CASE ")
        const list: Array<string> = this.cases.map(c => c.printEvents(indent + ' '));
        list.push(...this.processes.map(p => p.printEvents(indent + ' ')));
        return `${super.printEvents(indent)}${list.length ? `\n${list.join('\n')}` : ''}`;
    }

    async loadEventHierarchy(): Promise<void> {
        await super.loadEvents();
        const promises: Array<Promise<any>> = [];
        this.cases.forEach(subCase => promises.push(subCase.loadEventHierarchy()));
        this.processes.forEach(subProcess => promises.push(subProcess.loadEvents()));
        await Promise.all(promises);
    }

    get totalEventCount(): number {
        return super.totalEventCount + this.collect(t => t.totalEventCount).reduce((sum, count) => sum + count, 0);
    }

    hasArchivedHierarchy(): boolean {
        if (!this.isArchived()) {
            return false;
        }
        if (this.cases.find(c => !c.hasArchivedHierarchy())) return false;
        return this.processes.find(p => !p.isArchived()) === undefined;
    }

    isArchived(): boolean {
        return this.hasArchiveEvent('CaseArchived');
    }

    async assertRestored() {
        return await PollUntilSuccess(async () => {
            console.log("Checking that we're restored ...")
            await CaseService.getDiscretionaryItems(this.user, this.id);
        })
    }

    toString(): string {
        return this.print('');
    }
}
