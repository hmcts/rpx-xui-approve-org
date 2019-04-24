export function reducer(state,action) {
    switch(action.type) {

        case 'SHOW_PENDING_ORG':
            console.log('existing state: ' + JSON.stringify(state));
            console.log('payload' + action.payload);
            return {
                ...state,
                showPendingOrg: action.payload
            }
        default:
        return state;
}
}