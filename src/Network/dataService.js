import request from './request';
let dataService = {
  loginApp: params => {
    return request.post(params);
  },
  login: params => {
    let url = 'user/authenticate';
    return request.post(params, url);
  },
  
  logoutApi: (params) => {
    let url = 'api/user/logout';
    return request.post(params, url);
  },
};

export default dataService;
