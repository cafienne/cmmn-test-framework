import Definitions from "../../cmmn/definitions/definitions";
import State from "../../cmmn/state";
import QueryFilter from "../queryfilter";

/**
 * Query to statistics across cases, with a set of optional filters on it.
 */
export default interface StatisticsFilter extends QueryFilter {
    /**
     * Only fetch statistics from this tenant
     */
    tenant?: string,
    /**
     * Fetch statistisc for cases that have this definition as their name
     */
    definition?: string | Definitions,
    /**
     * Fetch statistisc for cases in this state (e.g. to fetch all 'Completed' or 'Failed' cases)
     */
    state?: State,
    /**
     * Fetch statistics from offset.
     */
    offset?: number,
    /**
     * Restrict the filter list. E.g. if there are more than 100 case definitions.
     */
    numberOfResults?: number,
}
