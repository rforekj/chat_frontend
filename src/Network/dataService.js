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
  getChannelByUser: username => {
    let url = 'channel/'+username;
    return request.get(url);
  },
  createPost: (params) => {
    let url = 'post';
    return request.post(params,url);
  },
  getPostByChannel: (params) => {
    let url = 'post/' + params.channelId + '?offset=' + params.offset + '&limit=' + params.limit;
    return request.get(url);
  }
};

export default dataService;
