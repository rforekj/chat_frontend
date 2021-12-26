import request from './request';
let dataService = {
  loginApp: params => {
    return request.post(params);
  },
  login: params => {
    let url = "user/authenticate";
    return request.post(params, url);
  },
  logoutApi: params => {
    let url = "user/logout";
    return request.post(params, url);
  },
  currentUser: () => {
    let url = "user";
    return request.get(url);
  },
  getChannelByUser: () => {
    let url = "channel";
    return request.get(url);
  },
  getUserByChannel: channel => {
    let url = "user/" + channel;
    return request.get(url);
  },
  createPost: params => {
    let url = "post";
    return request.post(params, url);
  },
  getPostByChannel: params => {
    let url =
      "post/" +
      params.channelId +
      "?offset=" +
      params.offset +
      "&limit=" +
      params.limit;
    return request.get(url);
  },
  searchUser: params => {
    let url = "user/search?key=" + params;
    return request.get(url);
  },
  getChannelWithUser: params => {
    let url = "channel/channel-with-user?userId=" + params;
    return request.get(url);
  },
  postFile: params => {
    let url = "post/file";
    return request.postForm(params, url);
  },
  callVideo: params => {
    let url = "post/video";
    return request.post(params, url);
  },
  cancelCallVideo: params => {
    let url = "post/cancel-video";
    return request.post(params, url);
  },
  offline: () => {
    let url = "user/offline";
    return request.post({}, url);
  },
  getOnlineUser: () => {
    let url = "user/online";
    return request.get(url);
  },
  updateUserInfo: params => {
    let url = "user/update";
    return request.postForm(params, url);
  }
};

export default dataService;
