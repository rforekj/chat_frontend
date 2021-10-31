import React, { Component } from 'react'
import ContactList from './contactList'
import MessageBox from './messageBox'
import API from '../../services/api'
import * as SockJS from "sockjs-client";
import Stomp, { over } from "stompjs";
import config from "../../config";
import dataService from '../../Network/dataService';


export default class ChatWindow extends Component {
    constructor(props) {
        super(props)
        this.state = {
            channels: [],
            selectedChannel: {},
            ws: null,
            chats: [],
            lastSentMessage: undefined
        }
        this.getSelectedChannel = this.getSelectedChannel.bind(this)
        this.getNewMsgObj = this.getNewMsgObj.bind(this)
    }

    async componentDidMount() {
        
        var username = this.props.loggedInUserObj._id;
        var signalProtocolManagerUser = this.props.signalProtocolManagerUser;

        // API call to fetch all contacts
        try {
            let channelsResult = await dataService.getChannelByUser(this.props.loggedInUserObj._id)
            this.setState({ channels: channelsResult });
        } catch (error) {
            console.log("error:", error);
        }

        // Fetch Existing Chats from LocalStorage
        // let lsChats = JSON.parse(localStorage.getItem(this.props.loggedInUserObj._id + "_messages"))

        // var socket = new SockJS(config.HOST+"/gs-guide-websocket");
        
        // let stompClient = Stomp.over(socket);
        // //const headers = { Authorization: `Bearer ${jwt}` };
        // stompClient.connect({}, (frame) => {
        //   console.log("Connected: " + frame);
        //   stompClient.subscribe("/topic/1e1b9578-7d14-4610-819f-ed66cc791995",  (e) => {
        //     let newMessage = JSON.parse(e.body);
        //     // In case message is from self, save state-stored message to Chats i.e. no need of using/decrypting the received message
        //     // This is only for verifying that the messages have successfully been received.
        //     // if (newMessage.createdBy === username) {
        //     //   newMessage.message = this.state.lastSentMessage;
        //     // } else {
        //     //   // Otherwise decrypt it and then save to Chats
        //     //   // Decryption using Signal Protocol
        //     //   let decrytedMessage = await signalProtocolManagerUser.decryptMessageAsync(newMessage.createdBy, newMessage.message);
        //     //   newMessage.message = decrytedMessage;
        //     // }

        //     // Update message data to Chats & LocalStorage -> 2 Scenarios 
        //     // 1. If the Chat already exists
            
        //     console.log("chats statse" + this.state.chats);

        //     //if (newMessage.channelId in this.state.chats) {
        //       this.setState(prevState => ({ chats: { ...prevState.chats, [newMessage.channelId]: { ...prevState.chats[newMessage.channelId], messages: [...prevState.chats[newMessage.channelId].messages.concat(newMessage)] } } }), () => localStorage.setItem(username + "_messages", JSON.stringify(this.state.chats)));
        //     // } else {
        //     //   // 2. In case the Chat does not exist, Create New Chat
        //     //   let newChat = { chatId: newMessage.channelId, members: [newMessage.createdBy, newMessage.channelId], messages: [] };
        //     //   newChat.messages.push(newMessage);
        //     //   this.setState(prevState => ({ chats: { ...prevState.chats, [newMessage.channelId]: newChat } }), () => localStorage.setItem(username + "_messages", JSON.stringify(this.state.chats)));
        //     // }
        //   });
        // });
    }

    // Method To Update the Selected User from Contact List Component to the Message Box Component
    async getSelectedChannel(selectedChannel) {
        this.setState({ selectedChannel: selectedChannel })
        try {
            let postsResult = await dataService.getPostByChannel({
                channelId: selectedChannel.id,
                offset:0,
                limit:100
            })
            console.log("data"+postsResult.data)
            this.setState({
                chats: postsResult.data
            });
             var socket = new SockJS(config.HOST+"/gs-guide-websocket");
        
        let stompClient = Stomp.over(socket);
        //const headers = { Authorization: `Bearer ${jwt}` };
        stompClient.connect({}, (frame) => {
          console.log("Connected: " + frame);
          stompClient.subscribe("/topic/"+selectedChannel.id,  (e) => {
            let newMessage = JSON.parse(e.body);
        
            //if (newMessage.channelId in this.state.chats) {
              this.setState(prevState => ({ chats: { ...prevState.chats,  newMessage} }),
               () => localStorage.setItem(this.props.loggedInUserObj._id + "_messages", JSON.stringify(this.state.chats)));
            // } else {
            //   // 2. In case the Chat does not exist, Create New Chat
            //   let newChat = { chatId: newMessage.channelId, members: [newMessage.createdBy, newMessage.channelId], messages: [] };
            //   newChat.messages.push(newMessage);
            //   this.setState(prevState => ({ chats: { ...prevState.chats, [newMessage.channelId]: newChat } }), () => localStorage.setItem(username + "_messages", JSON.stringify(this.state.chats)));
            // }
          });
        });

        } catch (error) {
            console.log("error:", error);
        }
    }

    // Method to Send New Message using Web Socket when User hits send button from Message Box component
    async getNewMsgObj(newMsgObj) {
        let msgToSend = { channelId: this.state.selectedChannel.id, ...newMsgObj };
        // Send Message for Encryption to Signal Server, then send the Encrypted Message to Push server
        try {
            // let encryptedMessage = await this.props.signalProtocolManagerUser.encryptMessageAsync(this.state.selectedChannel._id, newMsgObj.message);
            // msgToSend.message = encryptedMessage
            // this.state.ws.send(JSON.stringify(msgToSend))
            dataService.createPost(msgToSend);

            this.setState({ lastSentMessage: newMsgObj.message }) // Storing last-sent message for Verification with Received Message
        } catch (error) {
            console.log(error);
        }
    }

    // Method to return the chatID of the Currently Selected User
    getSelectedChannelId() {
        // Because of the state selectedUserChatId problem, we are selecting the chatId everytime a new message is being sent
        // let selectedChannelId = undefined
        // for (let chat of Object.values(this.state.chats)) {
        //     if (chat.members.includes(this.state.selectedChannel._id)) {
        //         selectedChannelId = chat.chatId
        //         break
        //     }
        // }
        // return selectedChannelId
    }

    render() {
        return (
            <div className="container flex mx-auto m-2 rounded h-screen bg-white border border-blue-800 bg-gray-100">
                {(this.state.channels.length > 0) && <ContactList
                    channels={this.state.channels}
                    selectedChannel={this.getSelectedChannel}
                />}
                {this.state.selectedChannel && <MessageBox
                    selectedChannel={this.state.selectedChannel}
                    loggedInUserDP={this.props.loggedInUserObj.img}
                    setNewMsgObj={this.getNewMsgObj}
                    messages={(this.state.chats)}
                />}
            </div>
        )
    }
}
