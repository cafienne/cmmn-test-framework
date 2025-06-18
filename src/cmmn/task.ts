import CMMNBaseClass from "./cmmnbaseclass";

export default class Task extends CMMNBaseClass {
    constructor(
        public id: string,
        public taskName: string,
        public taskState: string,
        public assignee: string,
        public performable: boolean,
        public owner: string,
        public caseInstanceId: string,
        public tenant: string,
        public role: string,
        public lastModified: string,
        public modifiedBy: string,
        public dueDate: string,
        public createdOn: string,
        public createdBy: string,
        public input: any,
        public output: any,
        public taskModel: any
    ) { super(); }

    toString() {
        return `${this.taskName}[${this.id}]`;
    }

    summary() {
        return this.toString() + ` - ${this.taskState}`
    }

    isCompleted() {
        return this.taskState === 'Completed';
    }

    isAssigned() {
        return this.taskState === 'Assigned';
    }

    isActive() {
        return this.taskState !== 'Completed' && this.taskState !== 'Terminated';
    }

    /**
     * Returns true for Delegated, Unassigned and Assigned tasks.
     */
    static isActive(task: Task) {
        return task && task.isActive();
    }
}
