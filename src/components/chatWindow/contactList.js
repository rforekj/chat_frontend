import React, { Component } from 'react'

export default class ContactList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            channels: this.props.channels
        }
    }

    setSelectedChannel(selectedChannel) {
        this.props.selectedChannel(selectedChannel)
    }

    getLastMessageDetails(channel) {
        let lastMessage = channel.lastPost
        const lastMessageDetails = (
            <>
                <div className="grid w-full">
                    <div className="contact-name font-bold px-2">{channel.name}</div>
                    {lastMessage ? <div className="last-message px-2 text-sm">{lastMessage.message}</div> : null}
                </div>
                {lastMessage ? <div className="last-message-time w-1/4 text-right">{lastMessage.date}</div> : null}
            </>
        )
        return lastMessageDetails
    }

    getChannels() {
        const channelDetails = this.state.channels.map(channel =>
            <div className="user flex mt-2 p-2 border-b " id={channel.id} key={channel.id} onClick={() => this.setSelectedChannel(channel)}>
                {channel.type === 'DIRECT' &&<div className="w-1/4 rounded-full relative h-12 text-center">
                    <img className="profile-picture absolute h-full object-cover self-center" src={channel.members[0].avatar} alt="dp" />
                    <div>{channel.members[0].fullName}</div>
                </div>}
                {channel.type === 'GROUP' &&<div className="w-1/4 rounded-full relative h-12 text-center">
                    <img className="profile-picture absolute h-full object-cover self-center" src={channel.name} alt="dp" />
                    <div>{channel.avatar}</div>
                </div>}
                {this.getLastMessageDetails(channel)}
            </div>
        )
        return (channelDetails)
    }

    render() {
        return (
            <div className="contact-box w-2/5 bg-gray-900 text-white rounded-l">
                <div className="flex mt-2">
                    <i className="las la-bars p-2 ml-2 text-xl"></i>
                    <i className="search-bar las la-search p-2 text-xl"></i>
                    <input className="search-bar px-2 bg-gray-900 text-white w-full focus:outline-none focus:ring rounded" placeholder="Search here.."></input>
                    <i className="las la-ellipsis-v p-2 text-xl"></i>
                </div>
                <div className="contact-list grid-cols-1 p-2">
                    {this.getChannels()}
                </div>
            </div>
        )
    }
}
