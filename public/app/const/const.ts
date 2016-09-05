export class Const {
    /*
        Internal app events
     */
    public static get SEARCH_RESULT_EVT(): string { return 'SEARCH_RESULT_EVT'; }
    public static get SUGGEST_RESULT_EVT(): string { return 'SUGGEST_RESULT_EVT'; }
    public static get UPDATE_VIEW(): string { return 'UPDATE_VIEW'; }
    public static get DID_NAVIGATE(): string { return 'DID_NAVIGATE'; }

    /*
        API related
     */
    public static get API_URL(): string { return '/api'; }

    /*
        App path references
     */
    public static get SEARCH_PATH(): string { return 'search' }
    public static get QA_PATH(): string { return 'qa' }
}