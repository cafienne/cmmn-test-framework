
/**
 * Wrapper for the CreateBoard command 
 */
export default interface BoardRequestDetails {
    /**
     * Title of the board to create
     */
    title: string;
    /**
     * Optional id for the board to create.
     * If not specified, the server will create one.
     */
    id?: string;
    /**
     * Optional form that the board can use to start a flow
     */
    form?: object;
}