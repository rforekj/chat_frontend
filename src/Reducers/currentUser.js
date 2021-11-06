import * as types from './../constants/ActionType'

var data = JSON.parse(localStorage.getItem('USER'))
var initState = data ? data : {}



const currentUser = (state = initState, action) => {
    var newState = { ...state }
    switch (action.type) {
      case types.LOGIN_ACCOUNT:
        newState = action.data;
        localStorage.setItem("USER", JSON.stringify(newState));
        return newState;
      case types.LOGOUT_ACCOUNT:
        newState = {};
        localStorage.clear("USER");
        return newState;
      case types.UPDATE_USER_INFO:
        newState = { ...newState, userInfo: action.data };
        localStorage.setItem("USER", JSON.stringify(newState));
        return newState;
      case types.SAVE_INFO:
        newState = { ...newState, userInfo: action.data };
        localStorage.setItem("USER", JSON.stringify(newState));
        return newState;
      default:
        return state;
    }

}

export default currentUser;