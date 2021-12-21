import React, { Component } from "react";
import ContactList from "./contactList";
import MessageBox from "./messageBox";
import API from "../../services/api";
import * as SockJS from "sockjs-client";
import Stomp, { over } from "stompjs";
import config from "../../config";
import dataService from "../../Network/dataService";
import api from "../Global/api";

var loadMore = false;

export default class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      selectedChannel: {},
      ws: null,
      chats: [],
      members: {},
      lastSentMessage: undefined
    };
    this.getSelectedChannel = this.getSelectedChannel.bind(this);
    this.getNewMsgObj = this.getNewMsgObj.bind(this);
    this.loadMoreMessage = this.loadMoreMessage.bind(this);
  }

  async componentDidMount() {
    var username = this.props.loggedInUserObj.username.username;

    // API call to fetch all contacts
    try {
      let channelsResult = await dataService.getChannelByUser();
      this.setState({ channels: channelsResult });
    } catch (error) {
      console.log("error:", error);
    }
    var socket = new SockJS(config.HOST + "/ws?token=" + api.getToken());

    let stompClient = Stomp.over(socket);
    stompClient.connect({}, (frame) => {
      loadMore = false;
      console.log("Connected: " + username);
      stompClient.subscribe("/topic/" + username, (e) => {
        console.log("mesage" + e.body);

        let newMessage = JSON.parse(e.body);
        //if (newMessage.channelId in this.state.chats) {
        if (newMessage.channelId === this.state.selectedChannel.id) {
          let a = this.state.chats.concat(newMessage);
          this.setState({ chats: a });
        }
        // this.state.channels.forEach(channel => {
        //   if(channel.id === newMessage.channelId) {
        //     channel.lastMessage = newMessage.message;
        //   }
        // })
      });
    });
  }

  // Method To Update the Selected User from Contact List Component to the Message Box Component
  async getSelectedChannel(selectedChannel) {
    try {
      let postsResult = await dataService.getPostByChannel({
        channelId: selectedChannel.id,
        offset: 0,
        limit: 25
      });
      this.setState({offset : 0})
      console.log("offset " + this.state.offset)
      let memberResult = await dataService.getUserByChannel(selectedChannel.id);
      selectedChannel.members = memberResult;
      this.setState({ selectedChannel: selectedChannel });

      var memberObject = {};
      for (let i = 0; i < memberResult.length; i++) {
        memberObject[memberResult[i].username] = memberResult[i].avatar;
      }
      this.setState({ chats: postsResult, members: memberObject });
    } catch (error) {
      console.log("error:", error);
    }
  }

  async getNewMsgObj(newMsgObj) {
    loadMore = false;
    let msgToSend = { channelId: this.state.selectedChannel.id, ...newMsgObj };
    try {
      let a = this.state.chats.concat(newMsgObj);
      this.setState({ chats: a });
      dataService.createPost(msgToSend);

      this.setState({ lastSentMessage: newMsgObj.message }); 
    } catch (error) {
      console.log(error);
    }
  }

  async loadMoreMessage() {
    loadMore = true;
    this.setState({ offset: this.state.offset + 1 });
    console.log("loadmorit", this.state.offset);
    let postsResult = await dataService.getPostByChannel({
        channelId: this.state.selectedChannel.id,
        offset: this.state.offset,
        limit: 25
    });
    this.setState({ chats: postsResult.concat(this.state.chats) });
  }

  getSelectedChannelId() {

  }

  render() {
    return (
      <div className="container flex mx-auto m-2 rounded h-screen bg-white border border-blue-800 bg-gray-100">
        {this.state.channels.length > 0 && (
          <ContactList
            channels={this.state.channels}
            selectedChannel={this.getSelectedChannel}
            channelAvatar={this.props.loggedInUserObj.username.avatar}
          />
        )}
        {this.state.selectedChannel && (
          <MessageBox
            selectedChannel={this.state.selectedChannel}
            loggedInUserAvatar={this.props.loggedInUserObj.username.avatar}
            loggedInUsername={this.props.loggedInUserObj.username.username}
            setNewMsgObj={this.getNewMsgObj}
            loadMoreMessage={this.loadMoreMessage}
            members={this.state.members}
            messages={this.state.chats}
            loadMore={loadMore}
          />
        )}
      </div>
    );
  }
}
