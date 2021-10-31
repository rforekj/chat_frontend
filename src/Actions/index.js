// import * as userActions from './Login'

// const allActions = {
//     userActions
// }

// export default 
import * as types from '../constants/ActionType'

export const actLogout = () => {
    return {
        type: types.LOGOUT_ACCOUNT,
    }
}

export const actLogin = (data) => {
    console.log("aclogin")
    return {
        type: types.LOGIN_ACCOUNT,
        data: data
    }
}


