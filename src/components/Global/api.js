
let history = null
let token = JSON.parse(localStorage.getItem('USER')) ? JSON.parse(localStorage.getItem('USER'))['accessToken'] : null
// let token = null
// let token = localStorage.setItem('user', JSON.stringify(user))
let store = null;
let api = {
    setToken: () => {
        token = JSON.parse(localStorage.getItem("USER")) ? JSON.parse(localStorage.getItem("USER"))["accessToken"] : null;
    },
    getToken: () => {
        if(token==null)
            return 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJoaWV1cHQiLCJleHAiOjE2MzUwODYyNDIsImlhdCI6MTYzNTA2ODI0Mn0.sWXHZVunR6etdgx66LMXlY6E5kxiEuhMNWN0sSJf8IVKTJdmVQ_yPG4A8n6DdFbKfAVtz8kM7HWAttMsTSf8bQ'
        return token
    },
    setHistory: (newHistory) => {
        history = newHistory
    },
    getHistory: () => {
        return history
    }
}

export default api;