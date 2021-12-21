import React, { Component } from "react";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import dataService from "../../Network/dataService";

export default class MessageBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msgText: "",
      hasMore: true,
      fileName: ""
    };
    this.sendMessageToServer = this.sendMessageToServer.bind(this);
  }
  handleMessageText(e) {
    this.setState({ msgText: e.target.value });
  }
  handleEnterSend(e) {
    if (e.key === "Enter") {
      this.sendMessageToServer();
    }
  }
  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  };

  componentDidMount() {
    if (Object.keys(this.props.selectedChannel).length !== 0)
      this.scrollToBottom();
  }

  componentDidUpdate() {
    console.log("load more ", this.props.loadMore);
    if (
      Object.keys(this.props.selectedChannel).length !== 0 &&
      !this.props.loadMore
    ) {
      this.scrollToBottom();
    }
  }

  sendMessageToServer() {
    if (this.state.msgText) {
      //to not send empty message
      console.log("filename", this.state.fileName);
      let msgObj = {
        message: this.state.msgText,
        filenames: this.state.fileName,
        createdBy: this.props.loggedInUsername,
        date: moment().format("LT")
      };
      this.props.setNewMsgObj(msgObj);
    }
    this.setState({ msgText: "", fileName: "" });
  }

  onChangeFile(event) {
    event.stopPropagation();
    event.preventDefault();
    var file = event.target.files[0];
    this.postFile(file);
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
    fetch(fileUrl, { crossDomain: true, method: "GET"})
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
    this.setState({ hasMore: true });
  };
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
            function(message, index) {
              if (message.createdBy === this.props.loggedInUsername)
                return (
                  <div
                    key={message.id}
                    className="outgoing w-3/4 justify-end float-right flex my-2"
                  >

                    {message.filenames &&
                    <button
                      className="rounded-full focus:outline-none place-self-center transform hover:scale-110 motion-reduce:transform-none"
                      onClick={() => this.downloadFile(message.filenames, message.fileUrl)}
                    >
                        <i className="fa fa-file" style={{ fontSize: "48px", color: "red" }} />
                      </button>
                    }

                    <div className=" w-max bg-gray-200 text-black shadow-lg clear-both p-2 rounded-md">
                      {message.message}
                    </div>
                    <div className="w-16 rounded-full relative h-16 mx-2 px-2">
                      {(message.createdBy !==
                        this.props.messages[
                          index + 1 < this.props.messages.length
                            ? index + 1
                            : index
                        ].createdBy ||
                        index + 1 === this.props.messages.length) &&
                        <img
                          className="profile-picture absolute h-full object-cover self-center p-2"
                          style={{ borderRadius: 50 }}
                          src={this.props.loggedInUserAvatar}
                          alt="dp"
                        />}
                    </div>
                  </div>
                );
              else
                return <div key={message.id} className="incoming w-3/4 flex my-2">
                    <div className="w-16 rounded-full relative h-16 mx-2 px-2">
                      {(message.createdBy !== this.props.messages[index + 1 < this.props.messages.length ? index + 1 : index].createdBy || index + 1 === this.props.messages.length) && <img className="profile-picture absolute h-full object-cover self-center p-2" style={{ borderRadius: 50 }} src={this.props.members[message.createdBy]} alt="dp" />}
                    </div>

                    <div className="w-max bg-gray-900 text-white shadow-lg clear-both p-2 rounded-md">
                      {message.message}
                    </div>

                    {message.filenames &&
                    <button
                      className="rounded-full focus:outline-none place-self-center transform hover:scale-110 motion-reduce:transform-none"
                      onClick={() => this.downloadFile(message.filenames, message.fileUrl)}
                    >
                        <i className="fa fa-file" style={{ fontSize: "48px", color: "red" }} />
                      </button>
                    }
                  </div>;
            }.bind(this)
          )}
        </InfiniteScroll>
      );

      // const msgContent = this.props.messages.map(
      //   function(message, index) {
      //     if (message.createdBy === this.props.loggedInUsername)
      //       return (
      //         <div
      //           key={message.id}
      //           className="outgoing w-3/4 justify-end float-right flex my-2"
      //         >
      //           <div className=" w-max bg-gray-200 text-black shadow-lg clear-both p-2 rounded-md">
      //             {message.message}
      //           </div>
      //           <div className="w-16 rounded-full relative h-16 mx-2 px-2">
      //             {(message.createdBy !==
      //               this.props.messages[
      //                 index + 1 < this.props.messages.length ? index + 1 : index
      //               ].createdBy ||
      //               index + 1 === this.props.messages.length) &&
      //               <img
      //                 className="profile-picture absolute h-full object-cover self-center p-2"
      //                 src={this.props.loggedInUserAvatar}
      //                 alt="dp"
      //               />}
      //           </div>
      //         </div>
      //       );
      //     else
      //       return (
      //         <div key={message.id} className="incoming w-3/4 flex my-2">
      //           <div className="w-16 rounded-full relative h-16 mx-2 px-2">
      //             {(message.createdBy !==
      //               this.props.messages[
      //                 index + 1 < this.props.messages.length ? index + 1 : index
      //               ].createdBy ||
      //               index + 1 === this.props.messages.length) &&
      //               <img
      //                 className="profile-picture absolute h-full object-cover self-center p-2"
      //                 src={this.props.members[message.createdBy]}
      //                 alt="dp"
      //               />}
      //           </div>
      //           <div className=" w-max bg-gray-900 text-white shadow-lg clear-both p-2 rounded-md">
      //             {message.message}
      //           </div>
      //         </div>
      //       );
      //   }.bind(this)
      // );
      return msgContent;
    }
  }

  render() {
    return (
      <div className="message-box w-3/5">
        {Object.keys(this.props.selectedChannel).length !== 0 &&
          <div className=" w-full relative h-full grid grid-flow-rows">
            {/* Contact Options Bar */}
            <div className="user-bar flex w-full py-4 absolute inset-x-0 top-0 shadow-lg">
              <div className="w-12 rounded-full relative h-12 text-center mx-2">
                <img
                  className="profile-picture absolute h-full object-cover self-center p-2"
                  src={this.props.selectedChannel.members[0].avatar}
                  alt="dp"
                />
              </div>
              <div className="contact-name font-bold w-3/4 float-left py-2">
                {this.props.selectedChannel.name}
                {this.props.selectedChannel.members[0].fullName}
              </div>
              <div className="icons w-1/4 text-right mr-4">
                <i className="fas fa-video p-2 text-l" />
                <i className="fa fa-phone p-2 text-l" />
                <i className="fa fa-ellipsis-v p-2 text-l" />
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
            <div className="input-box flex p-4 bottom-0 absolute inset-x-0 bg-white shadow-inner">
              <input
                className="msg-input p-2 w-4/5 float-left text-sm focus:outline-none focus:ring"
                placeholder="Write Message.."
                value={this.state.msgText}
                onChange={e => this.handleMessageText(e)}
                onKeyDown={e => this.handleEnterSend(e)}
              />
              <div className="icons py-2 w-1/5 text-center flex">
                <i className="las la-grin p-2 text-xl" />
                <button
                  className="rounded-full focus:outline-none place-self-center transform hover:scale-110 motion-reduce:transform-none"
                  onClick={() => {
                    this.upload.click();
                  }}
                >
                  <i className="las la-paperclip p-2 text-xl" />
                </button>
                <input
                  id="myInput"
                  type="file"
                  ref={ref => (this.upload = ref)}
                  style={{ display: "none" }}
                  onChange={this.onChangeFile.bind(this)}
                />
                <i className="las la-image p-2 text-xl" />
              </div>
              <div className="bar text-gray-300 text-4xl px-4">|</div>
              <button
                className="rounded-full focus:outline-none place-self-center transform hover:scale-110 motion-reduce:transform-none"
                onClick={() => this.sendMessageToServer()}
              >
                <i className="lar la-paper-plane m-4 text-xl mx-4" />
              </button>
            </div>
          </div>}
      </div>
    );
  }
}
