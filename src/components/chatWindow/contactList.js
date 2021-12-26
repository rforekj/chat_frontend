import React, {Component} from "react";
import dataService from "../../Network/dataService";
import "antd/dist/antd.css";
import {AutoComplete, Badge, Popover} from "antd";
import group from '../../images/group.png'

const {Option} = AutoComplete;

export default class ContactList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: this.props.channels,
      keySearch: "",
      suggestion: []
    };
  }

  async onSelect(value) {
    this.setState({ keySearch: "" });
    let channelResult = await dataService.getChannelWithUser(value);
    this.setSelectedChannel({ id: channelResult.channelId });
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

  async logout(){
      localStorage.clear("USER");
      window.location.href = "/";
  }

  render() {
    const children = this.state.suggestion.map(suggestion =>
      <Option key={suggestion.id}>
        {suggestion.fullName}
      </Option>
    );
    const content=(
        <div>
          <ul>
            <li><a>Sửa thông tin</a></li>
            <li><button onClick={() => this.logout()}>Đăng xuất</button></li>
          </ul>
        </div>

    );
    return <div className="contact-box w-2/5 bg-gray-900 text-white rounded-l">
        <div className="flex mt-2">
          <Popover trigger={"click"} content={content} placement={"bottomLeft"}>
            <i className="las la-bars p-2 ml-2 text-xl" />
          </Popover>
          <i className="search-bar las la-search p-2 text-xl" />
          <AutoComplete className="search-bar px-2 bg-gray-900 text-white w-full focus:outline-none focus:ring rounded" value={this.state.keySearch} onSearch={e => this.search(e)} onSelect={e => this.onSelect(e)} placeholder="Search here..">
            {children}
          </AutoComplete>
          {/* <input className="search-bar px-2 bg-gray-900 text-white w-full focus:outline-none focus:ring rounded" placeholder="Search here.." onSearch={e => this.search(e)}></input> */}
          <i className="las la-ellipsis-v p-2 text-xl" />
        </div>

        <div className="contact-list p-2">
          {this.props.channels.map(channel =>
            <div
              className="user flex items-center mt-2 p-2 border-b "
              id={channel.id}
              key={channel.id}
              onClick={() => this.setSelectedChannel(channel)}
            >
              <div>
                {channel.type === "DIRECT" &&
                  <div
                    className=" rounded-full h-12 text-center mr-5"
                    style={{ width: 50 }}
                  >
                    <Badge dot={true} color={"green"} >
                      <img
                        className="profile-picture h-full object-cover self-center"
                        style={{ borderRadius: "50%", width: 50 }}
                        src={channel.members[0].avatar}
                        alt="dp"
                      />
                    </Badge>

                  </div>}
                {channel.type !== "DIRECT" &&
                  <div
                    className="rounded-full h-12 text-center mr-5"
                    style={{ width: 50 }}
                  >
                    <Badge dot={true} color={"green"}>
                      <img
                        className="profile-picture h-full object-cover self-center"
                        style={{ borderRadius: "50%", width: 50 }}
                        src={group}
                        alt="dp"
                      />
                    </Badge>

                  </div>}
              </div>
              <div className="w-full">
                <div className="grid flex-1">
                  <div className="flex justify-between">
                    <div className="font-medium text-lg">
                      {channel.members[0].fullName}
                    </div>
                    {channel.lastPost
                      ? <div className="last-message-time w-1/4 text-right">
                          {channel.lastPost.createdTime}
                        </div>
                      : null}
                  </div>
                  <div className="contact-name font-bold px-2">
                    {channel.name}
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
      </div>;
  }
}