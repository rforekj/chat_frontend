import React, { Component, useRef } from "react";
import ContactList from "./contactList";
import MessageBox from "./messageBox";
import API from "../../services/api";
import * as SockJS from "sockjs-client";
import config from "../../config";
import dataService from "../../Network/dataService";
import api from "../Global/api";
import SimplePeer, { Instance, SignalData } from "simple-peer";
import Stomp, { over } from "stompjs";
import { Modal } from "antd";

var loadMore = false;
var localStream;

export default class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      selectedChannel: {},
      ws: null,
      chats: [],
      members: {},
      simplePeer: null,
      visible: false
    };
    this.getSelectedChannel = this.getSelectedChannel.bind(this);
    this.getNewMsgObj = this.getNewMsgObj.bind(this);
    this.loadMoreMessage = this.loadMoreMessage.bind(this);
    this.createChannel = this.createChannel.bind(this)
    this.addMember = this.addMember.bind(this)
  }

  async componentDidMount() {
    window.addEventListener("beforeunload", function(e) {
      dataService.offline();
    });

    var username = this.props.loggedInUserObj.username.username;

    try {
      let channelsResult = await dataService.getChannelByUser();
      this.setState({ channels: channelsResult });
    } catch (error) {
      console.log("error:", error);
    }
    //var socket = new SockJS(config.HOST + "/wss?token=" + api.getToken());
    //socket.onclose = function
    // this.setState({ ws: socket });
    // console.log("socket", socket)
    //let stompClient = Stomp.over(socket);
    const stompClient = Stomp.client(
      config.WS + "/wss?token=" + api.getToken()
    );

    stompClient.heartbeat.outgoing = 0;
    stompClient.heartbeat.incoming = 0;
    stompClient.connect(
      {},
      frame => {
        //loadMore = false;
        stompClient.subscribe("/topic/" + username, async e => {
          let newMessage = JSON.parse(e.body);
          if (!newMessage.payload) {
            if (newMessage.channelId === this.state.selectedChannel.id) {
              let a = this.state.chats.concat(newMessage);
              this.setState({ chats: a });
            }
            let channelsResult = await dataService.getChannelByUser();
            this.setState({ channels: channelsResult });
          } else {
            let payload = JSON.parse(newMessage.payload);
            if (payload.type === "offer") {
              this.setState({
                visible: true,
                offerSignal: payload,
                caller: newMessage.caller,
                connectionStatus: "RECEIVING",
                channelVideoCallRequest: newMessage.channelId
              });
            } else if (payload.type === "answer") {
              if (this.state.simplePeer) {
                this.state.simplePeer.signal(payload);
              }
            }
          }

          if (newMessage.hangupUser) {
            const video = this.videoSelf;
            const videoCaller = this.videoCaller;
            video.src = "";
            videoCaller.src = "";
            localStream.getTracks().forEach(function(track) {
              track.stop();
            });
            this.setState({
              visible: false,
              caller: null,
              offerSignal: "",
              connectionStatus: "",
              channelVideoCallRequest: "",
              simplePeer: null
            });
          }
        });
      },
      () => {
        console.log("disconnect from server");
        dataService.offline();
      }
    );
    //  stompClient.disconnect(() => {
    //    console.log("disconnect from server");
    //    dataService.offline();
    //  })
  }

  // Method To Update the Selected User from Contact List Component to the Message Box Component
  async getSelectedChannel(selectedChannel) {
    try {
      let postsResult = await dataService.getPostByChannel({
        channelId: selectedChannel.id,
        offset: 0,
        limit: 25
      });
      this.setState({ offset: 0 });
      console.log("offset " + this.state.offset);
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
      await dataService.createPost(msgToSend);
      let channelsResult = await dataService.getChannelByUser();
      this.setState({ channels: channelsResult });
    } catch (error) {
      console.log(error);
    }
  }

  async loadMoreMessage() {
    loadMore = true;
    this.setState({ offset: this.state.offset + 1 });
    let postsResult = await dataService.getPostByChannel({
      channelId: this.state.selectedChannel.id,
      offset: this.state.offset,
      limit: 25
    });
    this.setState({ chats: postsResult.concat(this.state.chats) });
  }

  getSelectedChannelId() {}

  turnVideo() {
    const video = this.videoSelf;

    if (localStream.getTracks()[1].enabled) {
      video.pause();
      localStream.getTracks()[1].enabled = false;
    } else {
      video.play();
      localStream.getTracks()[1].enabled = true;
    }
  }

  vidOn() {
    const video = this.videoSelf;
    video.play();
    localStream.getTracks()[1].enabled = true;
  }

  hangup() {
    const video = this.videoSelf;
    const videoCaller = this.videoCaller;
    video.src = "";
    videoCaller.src = "";
    localStream.getTracks().forEach(function(track) {
      track.stop();
    });
    if (this.state.caller) {
      dataService.cancelCallVideo({ hangupUser: this.state.caller.username });
    } else {
      dataService.cancelCallVideo({
        hangupUser: this.state.selectedChannel.members[0].username
      });
    }
    this.setState({
      visible: false,
      caller: null,
      offerSignal: "",
      connectionStatus: "",
      channelVideoCallRequest: "",
      simplePeer: null
    });
  }

  sendOrAcceptInvitation = (isInitiator, channelId, offer) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(mediaStream => {
        if (!this.state.visible) this.setState({ visible: true });
        const video = this.videoSelf;
        video.srcObject = mediaStream;
        localStream = mediaStream;
        video.play();

        const sp = new SimplePeer({
          trickle: false,
          initiator: isInitiator,
          stream: mediaStream
        });

        if (isInitiator) {
          this.setState({ connectionStatus: "OFFERING" });
        } else offer && sp.signal(offer);

        sp.on("signal", data => {
          let request = { channelId: channelId, payload: JSON.stringify(data) };
          dataService.callVideo(request);
        });
        sp.on("connect", () =>
          this.setState({ connectionStatus: "CONNECTED" })
        );
        sp.on("stream", stream => {
          const video = this.videoCaller;
          video.srcObject = stream;
          video.play();
        });
        this.setState({ simplePeer: sp });
      });
  };

  createChannel(newChannel) {
    this.setState({channels:[newChannel].concat(this.state.channels), selectedChannel: newChannel})
  }

  addMember(newMember) {
    let memberObject = this.state.members;
    memberObject[newMember.username] = newMember.avatar;
    this.setState({
      members: memberObject
    });
  }

  render() {
    return (
      <div className="container flex mx-auto m-2 rounded h-screen bg-white border border-blue-800 bg-gray-100" style={{height:"97vh"}}>
        <ContactList
          channels={this.state.channels}
          selectedChannel={this.getSelectedChannel}
          channelAvatar={this.props.loggedInUserObj.username.avatar}
          loggedInUserAvatar={this.props.loggedInUserObj.username.avatar}
          loggedInUsername={this.props.loggedInUserObj.username.username}
          createChannel={this.createChannel}
        />
        {this.state.selectedChannel &&
          <MessageBox
            selectedChannel={this.state.selectedChannel}
            loggedInUserAvatar={this.props.loggedInUserObj.username.avatar}
            loggedInUsername={this.props.loggedInUserObj.username.username}
            setNewMsgObj={this.getNewMsgObj}
            loadMoreMessage={this.loadMoreMessage}
            members={this.state.members}
            messages={this.state.chats}
            loadMore={loadMore}
            sendOrAcceptInvitation={this.sendOrAcceptInvitation}
            addMember={this.addMember}
          />}

        <Modal
          zIndex={2}
          visible={this.state.visible}
          centered={true}
          width="1200px"
          footer={""}
          afterClose={() => {}}
          onCancel={() => this.hangup()}
        >
          <div>
            <div className="video-call">
              <video
                ref={el => {
                  this.videoSelf = el;
                }}
                className="video-sizing"
              />

              <video
                ref={el => {
                  this.videoCaller = el;
                }}
                className="video-sizing"
              />
            </div>

            <div className="caller">
              {this.state.caller ? this.state.caller.fullName : null}
            </div>

            {this.state.connectionStatus === "RECEIVING" &&
              <div>
                <button
                  className="btn-call"
                  onClick={() =>
                    this.sendOrAcceptInvitation(
                      false,
                      this.state.channelVideoCallRequest,
                      this.state.offerSignal
                    )}
                >
                  <div className="wrapper">
                    <div className="ring">
                      <div className="coccoc-alo-phone coccoc-alo-green coccoc-alo-show">
                        <div className="coccoc-alo-ph-circle" />
                        <div className="coccoc-alo-ph-circle-fill" />
                        <div className="coccoc-alo-ph-img-circle" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>}

            {this.state.connectionStatus === "CONNECTED" &&
              <button
                style={{ display: "block", width: "100%" }}
                onClick={() => this.turnVideo()}
              >
                Turn on/off camera
              </button>}
          </div>
        </Modal>
  
      </div>
    );
  }
}
