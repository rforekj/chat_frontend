import React, {Component} from "react";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import dataService from "../../Network/dataService";
import {CloseOutlined} from "@ant-design/icons";
import {Modal, Badge, AutoComplete} from "antd";
import group from '../../images/group.png'

const {Option} = AutoComplete;

export default class MessageBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            msgText: "",
            hasMore: true,
            fileName: "",
            visible: false,
            keySearch: "",
            suggestion: []
        };
        this.sendMessageToServer = this.sendMessageToServer.bind(this);
    }

    handleMessageText(e) {
        this.setState({msgText: e.target.value});
    }

    handleEnterSend(e) {
        if (e.key === "Enter") {
            this.sendMessageToServer();
        }
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({behavior: "smooth"});
    };

    componentDidMount() {
        if (Object.keys(this.props.selectedChannel).length !== 0)
            this.scrollToBottom();
    }

    componentDidUpdate() {
        if (
            Object.keys(this.props.selectedChannel).length !== 0 &&
            !this.props.loadMore
        ) {
            this.scrollToBottom();
        }
    }

    sendMessageToServer() {
        if (this.state.msgText) {
            let msgObj = {
                message: this.state.msgText,
                filenames: this.state.fileName,
                createdBy: this.props.loggedInUsername,
                date: moment().format("LT")
            };
            this.props.setNewMsgObj(msgObj);
        }
        this.setState({msgText: "", fileName: ""});
    }

    onChangeFile(event) {
        if (event.target.files[0]) {
        event.stopPropagation();
        event.preventDefault();
        var file = event.target.files[0];
        this.postFile(file);
        }
    }

    async postFile(file) {
        const formData = new FormData();
        formData.append("file", file);
        let resp = await dataService.postFile(formData);
        console.log("post file success ", resp.name)
        this.setState({fileName: resp.name})
    }

    downloadFile(filename, fileUrl) {
        console.log("file ", filename)
        fetch(fileUrl, {crossDomain: true, method: "GET"})
            .then(response => {
                response.blob().then(blob => {
                    let url = window.URL.createObjectURL(blob);
                    let a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                });
            })
    }

    fetchMoreData = () => {
        this.props.loadMoreMessage();
        this.setState({hasMore: true});
    };

    callVideo() {
        console.log("video")
        this.props.sendOrAcceptInvitation(true, this.props.selectedChannel.id);
    }
    showUser() {
        if(this.props.selectedChannel.type!=='DIRECT')
            this.setState({members: this.props.selectedChannel.members, visible: true})
    }
    addMember() {
        this.setState({searchVisible: true})
    }
    async search(e) {
        this.setState({ keySearch: e });
        let result = [];
        if (e.length > 0) {
        result = await dataService.searchUser(e);
        this.setState({ suggestion: result });
        }
    }
    async onSelect(value) {
        this.setState({ keySearch: "" });
        let resp = await dataService.addUserToChannel({userId:value, channelId: this.props.selectedChannel.id});
        if(resp.response !== 'fail') {
            let response = resp.response.split(';')
            let a = this.state.members;
            a.push({fullName:response[0], avatar:response[1], username:response[2]})
            this.setState({members:a})
            this.props.addMember({username: response[2], avatar:response[1]})
        }
    }

    // Method to Display Messages
    addMessagesToChat() {
        if (this.props.messages.length > 0) {
            const msgContent = (
                <InfiniteScroll
                    dataLength={this.props.messages.length}
                    next={this.fetchMoreData}
                    //style={{ display: "flex", flexDirection: "column-reverse"}}
                    //inverse={true} //
                    hasMore={this.state.hasMore}
                    //loader={<h4>Loading...</h4>}
                >
                    {this.props.messages.map(
                        function (message, index) {
                            if (message.createdBy === this.props.loggedInUsername)
                                return (
                                    <div
                                        key={message.id}
                                        className="w-3/4 justify-end float-right flex my-2"
                                    >


                                        <div className="bg-gray-200 text-black shadow-lg clear-both p-2 rounded-md">
                                            <div>
                                                {message.message}
                                            </div>
                                            {message.filenames &&
                                                <a
                                                    className="rounded-full overflow focus:outline-none place-self-center transform hover:scale-110 motion-reduce:transform-none"
                                                    onClick={() => this.downloadFile(message.filenames, message.fileUrl)}
                                                >
                                                    {message.filenames}
                                                </a>
                                            }
                                            <div className="text-right" style={{color: "gray"}}>
                                                {message.createdTime}
                                            </div>
                                        </div>
                                        <div className="w-16 rounded-full relative h-16 mx-2 px-2"
                                             style={{flexShrink: 0}}>
                                            {(message.createdBy !==
                                                    this.props.messages[
                                                        index + 1 < this.props.messages.length
                                                            ? index + 1
                                                            : index
                                                        ].createdBy ||
                                                    index + 1 === this.props.messages.length) &&
                                                <img
                                                    className="profile-picture absolute h-full object-cover self-center p-2"
                                                    style={{borderRadius: 50}}
                                                    src={this.props.loggedInUserAvatar}
                                                    alt="dp"
                                                />}
                                        </div>
                                    </div>
                                );
                            else
                                return <div key={message.id} className="incoming w-3/4 flex my-2">
                                    <div className="w-16 rounded-full relative h-16 mx-2 px-2" style={{flexShrink: 0}}>
                                        {(message.createdBy !== this.props.messages[index + 1 < this.props.messages.length ? index + 1 : index].createdBy || index + 1 === this.props.messages.length) &&
                                            <img
                                                className="profile-picture absolute h-full object-cover self-center p-2"
                                                style={{borderRadius: 50}} src={this.props.members[message.createdBy]}
                                                alt="dp"/>}
                                    </div>

                                    <div className="bg-gray-900 text-white shadow-lg clear-both p-2 rounded-md">
                                        <div>
                                            {message.message}
                                        </div>
                                        {message.filenames &&
                                                <a
                                                    className="rounded-full overflow focus:outline-none place-self-center transform hover:scale-110 motion-reduce:transform-none"
                                                    onClick={() => this.downloadFile(message.filenames, message.fileUrl)}
                                                >
                                                    {message.filenames}
                                                </a>
                                            }
                                        <div className="text-right" style={{color: "gray"}}>
                                            {message.createdTime}
                                        </div>
                                    </div>
                                </div>;
                        }.bind(this)
                    )}
                </InfiniteScroll>
            );
            return msgContent;
        }
    }

    render() {
        const children = this.state.suggestion.map(suggestion =>
            <Option key={suggestion.id}>
                {suggestion.fullName}
            </Option>
        );
        return (
            <div className="message-box w-3/5">
                {Object.keys(this.props.selectedChannel).length !== 0 &&
                    <div className=" w-full relative h-full grid grid-flow-rows">
                        {/* Contact Options Bar */}
                        <div className="user-bar flex w-full py-4 absolute inset-x-0 top-0 shadow-lg">
                            <div className="w-12 rounded-full relative h-12 text-center mx-2">
                                <img
                                    className="profile-picture absolute h-full object-cover self-center p-2"
                                    src={this.props.selectedChannel.type==='DIRECT' ? this.props.selectedChannel.members[0].avatar : group}
                                    alt="dp"
                                />}
                            </div>
                            <div className="contact-name font-bold w-3/4 float-left py-2">
                                {this.props.selectedChannel.type==='DIRECT' ? this.props.selectedChannel.members[0].fullName : this.props.selectedChannel.name}
                            </div>
                            <div className="icons w-1/4 text-right mr-4">
                                <button
                                    className="rounded-full focus:outline-none place-self-center transform hover:scale-110 motion-reduce:transform-none"
                                    onClick={() => this.callVideo()}
                                >
                                    <i className="fas fa-video p-2 text-l"/>
                                </button>
                                <i className="fa fa-phone p-2 text-l"/>
                                <button
                                    className="rounded-full focus:outline-none place-self-center transform hover:scale-110 motion-reduce:transform-none"
                                    onClick={() => this.showUser()}
                                >
                                    <i className="fa fa-ellipsis-v p-2 text-l"/>
                                </button>
                            </div>
                        </div>
                        {/* Messages Area */}
                        <div className="message-area clearfix overflow-auto my-20 p-2">
                            {this.addMessagesToChat()}
                            <div
                                className="outgoing w-3/4 justify-end float-right flex my-2"
                                ref={el => {
                                    this.messagesEnd = el;
                                }}
                            />
                        </div>

                        {/* Input Box and other Options */}
                        <div className="message-input-box">
                            <div className="flex-1 ">
                                <div style={{height: 38}}>
                                    <input
                                        className="p-2 w-full float-left text-sm focus:outline-none focus:ring"
                                        placeholder="Write Message..."

                                        value={this.state.msgText}
                                        onChange={e => this.handleMessageText(e)}
                                        onKeyDown={e => this.handleEnterSend(e)}
                                    />
                                </div>
                                <div className="file-tagged">
                                    {this.state.fileName ?
                                        <>
                                            <i className="las la-paperclip p-2 text-xl " style={{color: "black"}}/>
                                            {this.state.fileName}
                                            <CloseOutlined style={{color:"red"}} onClick={()=>this.setState({fileName:""})  } className="ml-2"/>
                                        </>

                                        : null}
                                </div>
                            </div>

                            <div className="icons py-2 w-1/5 text-center flex">
                                <i className="las la-grin p-2 text-xl"/>
                                <button
                                    className="rounded-full focus:outline-none place-self-center transform hover:scale-110 motion-reduce:transform-none"
                                    onClick={() => {
                                        this.upload.click();
                                    }}
                                >
                                    <i className="las la-paperclip p-2 text-xl"/>
                                </button>
                                <input
                                    id="myInput"
                                    type="file"
                                    ref={ref => (this.upload = ref)}
                                    style={{display: "none"}}
                                    onChange={this.onChangeFile.bind(this)}
                                />
                                <i className="las la-image p-2 text-xl"/>
                            </div>
                            <div className="bar text-gray-300 text-4xl px-4">|</div>
                            <div>
                                <button
                                    className="rounded-full focus:outline-none place-self-center transform hover:scale-110 motion-reduce:transform-none"
                                    onClick={() => this.sendMessageToServer()}
                                >
                                    <i className="lar la-paper-plane m-4 text-xl mx-4"/>
                                </button>
                            </div>

                        </div>
                    </div>}
                    <Modal
                        zIndex={2}
                        visible={this.state.visible}
                        centered={true}
                        width="500px"
                        //footer={""}
                        onCancel={() => this.setState({visible:false, searchVisible: false})}
                        onOk={() => this.addMember()}
                        cancelButtonProps={{style: { display: 'none' }}}
                        okButtonProps={{style: { backgroundColor: "black"}}}
                        okText="Thêm thành viên"
                    >
                    {this.state.searchVisible && <AutoComplete className="search-bar px-2 bg-gray-900 text-white w-full focus:outline-none focus:ring rounded" value={this.state.keySearch} onSearch={e => this.search(e)} onSelect={e => this.onSelect(e)} placeholder="Search here..">
                        {children}
                    </AutoComplete>}
                    {this.state.visible && this.state.members.map(
                        function (member, index) {
                            return(
                                <div className="user flex items-center mt-2 p-2 border-b ">
                                    <div
                                        className=" rounded-full h-12 text-center mr-5"
                                        style={{ width: 50 }}
                                    >
                                        <Badge dot={true} color={"green"} >
                                        <img
                                            className="profile-picture h-full object-cover self-center"
                                            style={{ borderRadius: "50%", width: 50 }}
                                            src={member.avatar}
                                            alt="dp"
                                        />
                                        </Badge>
                                    </div>
                                    <div className="font-medium text-lg">{member.fullName}</div>
                                </div>
                            )
                        }
                    )}
                    
                    </Modal>
            </div>
        );
    }
}
