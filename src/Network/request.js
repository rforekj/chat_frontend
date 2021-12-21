// import api from './index'
import config from '../config';
// let cors = require('cors');
import api from '../components/Global/api';
const request = {
    get: async (url) => {
        url = config.HOST + '/' + url
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + api.getToken(),
            'Accept-Language': 'vi'
        }
        let response = await fetch(url, {
                crossDomain: true,
                method: 'GET',
                headers
            });
        let rs = await response.json();
            switch (response.status) {
                case 200: return rs
                case 401: return logoutUser()
                default: {
                    console.log('err')
                    throw (rs.message)
                }
            }
    },
    post: async (data, url) => {
        url = config.HOST + '/' + url
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + api.getToken(),
            'Accept-Language': 'vi'
        }
        process.env.NODE_ENV == 'development' && console.log(`\n %c-----------------------------[ POST ]-------------------------------------- \n [` + url + ` ] \n `, 'color:red;font-size:15px', headers, data, ' \n----------------------------------------------------------------------------- \n');
        try {
            let response = await fetch(url, {
                crossDomain: true,
                method: 'POST',
                headers,
                'Accept-Language': 'vi',
                body: JSON.stringify(data),
            });

            let rs = await response.json();
            process.env.NODE_ENV == 'development' && console.log(`\n %c-----------------------------[ RESPONSE ]------------------------------------ \n [` + url + ` ] \n `, 'color:green;font-size:15px', 'Data Post', data, `\n`, ' Respone  ', rs, ' \n----------------------------------------------------------------------------- \n');
            switch (response.status) {
                case 200: return rs
                case 401: return logoutUser()
                default: {
                    console.log('err')
                    throw (rs.message)
                }
            }
        } catch (error) {
            console.log(error)
            if (error.msg) {
                console.log(error.msg)
            }
            throw error

        }
    },
    postForm: async (data, url) => {
        url = config.HOST + '/' + url
        let headers = {
            'Authorization': 'Bearer ' + api.getToken(),
        }
        try {
            let response = await fetch(url, {
                crossDomain: true,
                method: 'POST',
                headers,
                body: data,
            });

            let rs = await response.json();
            switch (response.status) {
                case 200: return rs
                case 401: return logoutUser()
                default: {
                    console.log('err')
                    throw (rs.message)
                }
            }
        } catch (error) {
            console.log(error)
            if (error.msg) {
                console.log(error.msg)
            }
            throw error
        }
    }
}
function logoutUser() {
    alert('Phiên làm việc của bạn đã hết hạn. vui lòng đăng nhập lại')
    localStorage.clear('USER')
    window.location.href = "/";
}
export default request