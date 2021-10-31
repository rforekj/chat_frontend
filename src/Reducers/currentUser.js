import * as types from './../constants/ActionType'

var data = JSON.parse(localStorage.getItem('USER'))
var initailState = data ? data : {}



const currentUser = (state = initailState, action) => {
    var { accessToken, userInfo } = action
    var newState = { ...state }
    switch (action.type) {
        case types.LOGIN_ACCOUNT:
            console.log("logindata "+ action.data);
            newState = action.data
            localStorage.setItem('USER', JSON.stringify(newState));
            return newState
        case types.LOGOUT_ACCOUNT:
            newState = {}
            localStorage.clear('USER')
            return newState
        case types.UPDATE_USER_INFO:
            newState = { ...newState, userInfo: action.data }
            localStorage.setItem('USER', JSON.stringify(newState));
            return newState
        default:
            return state;
    }

}

export default currentUser;