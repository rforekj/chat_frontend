import React, { Component } from "react";
import dataService from "../../Network/dataService";
import "antd/dist/antd.css";
import { AutoComplete, Badge, Popover, Modal } from "antd";
import group from "../../images/group.png";

const { Option } = AutoComplete;

export default class ContactList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: this.props.channels,
      keySearch: "",
      suggestion: [],
      fullName: this.props.loggedInUsername,
      avatar: this.props.loggedInUserAvatar
    };
    this.createChannelFunc = this.createChannelFunc.bind(this);
  }

  async onSelect(value) {
    this.setState({ keySearch: "" });
    let channelResult = await dataService.getChannelWithUser(value);
    this.setSelectedChannel(channelResult);
  }

  setSelectedChannel(selectedChannel) {
    this.props.selectedChannel(selectedChannel);
  }

  async search(e) {
    this.setState({ keySearch: e });
    let result = [];
    if (e.length > 0) {
      result = await dataService.searchUser(e);
      this.setState({ suggestion: result });
    }
  }

  async logout() {
    localStorage.clear("USER");
    window.location.href = "/";
  }

  handleChannelName(e) {
    this.setState({ channelName: e.target.value });
  }

  async createChannelFunc() {
    if (this.state.channelName) {
      let channel = await dataService.createChannel({
        name: this.state.channelName,
        type: "GROUP"
      });
      this.setState({ createChannel: false, name: "" });
      this.props.createChannel(channel);
    }
  }
  onChangeFile(event) {
    if (event.target.files[0]) {
      let name = event.target.files[0].name;
      if (name.endsWith("jpg") || name.endsWith("png")) {
        event.stopPropagation();
        event.preventDefault();
        var file = event.target.files[0];
        this.postFile(file);
      }
    }
  }
  async postFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    let resp = await dataService.postFile(formData);
    console.log("post file success ", resp.name);
    this.setState({ avatar: resp.file_url, avatarName: resp.name });
  }

  async updateUserInfo() {
    await dataService.updateUserInfo({
      fullName: this.state.fullName,
      avatar: this.state.avatarName
    });
    this.setState({
      updateInfoVisible: false
    });
  }

  render() {
    const children = this.state.suggestion.map(suggestion =>
      <Option key={suggestion.id}>
        {suggestion.fullName}
      </Option>
    );
    const content = (
      <div>
        <ul>
          <li>
            <button onClick={() => this.setState({ createChannel: true })}>
              Tạo kênh
            </button>
          </li>
          <li>
            <button onClick={() => this.setState({ updateInfoVisible: true })}>
              Cập nhật thông tin
            </button>
          </li>
          <li>
            <button onClick={() => this.logout()}>Đăng xuất</button>
          </li>
        </ul>
      </div>
    );
    return (
      <div className="contact-box w-2/5 bg-gray-900 text-white rounded-l" style={{height:"700px"}}>
        <div className="flex mt-2">
          <Popover trigger={"click"} content={content} placement={"bottomLeft"}>
            <i className="las la-bars p-2 ml-2 text-xl" />
          </Popover>
          <i className="search-bar las la-search p-2 text-xl" />
          <AutoComplete
            className="search-bar px-2 bg-gray-900 text-white w-full focus:outline-none focus:ring rounded"
            value={this.state.keySearch}
            onSearch={e => this.search(e)}
            onSelect={e => this.onSelect(e)}
            placeholder="Search here.."
          >
            {children}
          </AutoComplete>
          <i className="las la-ellipsis-v p-2 text-xl" />
        </div>

        <div
          className="contact-list p-2"
          style={{ overflow: "auto", height: "650px" }}
        >
          {this.props.channels.map(channel =>
            <div
              className="user flex items-center mt-2 p-2 border-b "
              id={channel.id}
              key={channel.id}
              onClick={() => this.setSelectedChannel(channel)}
            >
              <div>
                <div
                  className=" rounded-full h-12 text-center mr-5"
                  style={{ width: 50 }}
                >
                  <Badge dot={true} color={"green"}>
                    <img
                      className="profile-picture h-full object-cover self-center"
                      style={{ borderRadius: "50%", width: 50 }}
                      src={
                        channel.type === "DIRECT"
                          ? channel.members[0].avatar
                          : group
                      }
                      alt="dp"
                    />
                  </Badge>
                </div>
              </div>
              <div className="w-full">
                <div className="grid flex-1">
                  <div className="flex justify-between">
                    <div className="font-medium text-lg">
                      {channel.type === "DIRECT"
                        ? channel.members[0].fullName
                        : channel.name}
                    </div>
                    {channel.lastPost
                      ? <div className="last-message-time w-1/4 text-right">
                          {channel.lastPost.createdTime}
                        </div>
                      : null}
                  </div>

                  {channel.lastPost
                    ? <div className="last-message px-2 text-sm">
                        {channel.lastPost.message}
                      </div>
                    : null}
                </div>
              </div>
            </div>
          )}
        </div>
        <Modal
          zIndex={2}
          visible={this.state.createChannel}
          centered={true}
          width="500px"
          onCancel={() =>
            this.setState(
              //footer={""}
              { createChannel: false }
            )}
          onOk={() => this.createChannelFunc()}
          cancelButtonProps={{ style: { display: "none" } }}
          okButtonProps={{ style: { backgroundColor: "black" } }}
          okText="Tạo kênh"
        >
          <input
            className="p-2 w-full float-left text-sm focus:outline-none focus:ring"
            placeholder="Tên kênh..."
            value={this.state.channelName}
            onChange={e => this.handleChannelName(e)}
          />
        </Modal>
        <Modal
          zIndex={2}
          visible={this.state.updateInfoVisible}
          centered={true}
          width="500px"
          onCancel={() =>
            this.setState(
              //footer={""}
              { updateInfoVisible: false }
            )}
          onOk={() => this.updateUserInfo()}
          cancelButtonProps={{ style: { display: "none" } }}
          okButtonProps={{ style: { backgroundColor: "black" } }}
          okText="Cập nhật"
        >
          <input
            className="p-2 w-full float-left text-sm focus:outline-none focus:ring"
            placeholder="Tên..."
            value={this.state.fullName}
            onChange={e => this.setState({ fullName: e.target.value })}
          />

          <input
            id="myInput"
            type="file"
            onChange={this.onChangeFile.bind(this)}
            ref={ref => (this.upload = ref)}
            style={{ display: "none" }}
          />

          <button
            onClick={() => {
              this.upload.click();
            }}
          >
            <img
              className="profile-picture h-full object-cover self-center"
              style={{ borderRadius: "50%", width: 500 }}
              src={this.state.avatar}
              alt="dp"
            />
          </button>
        </Modal>
      </div>
    );
  }
}
