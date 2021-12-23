import React, { Component } from 'react'
import Login from './components/login/login'
import ChatWindow from "./components/chatWindow/chatWindow";

import './App.css';
export default class ChatApp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: JSON.parse(localStorage.getItem('USER')) ? true : false,
      loggedInUserObj: JSON.parse(localStorage.getItem('USER')) ? {username:JSON.parse(localStorage.getItem('USER'))['userInfo']} : {}
    }
    this.setLoggedinUser = this.setLoggedinUser.bind(this)
  }

  setLoggedinUser(loggedInUserObj) {
    this.setState({ isLoggedIn: true, loggedInUserObj: { ...loggedInUserObj } })
  }

  render() {

    return (
      <div className="App">
        { !this.state.isLoggedIn && <Login loginProp={this.setLoggedinUser} />}
        { this.state.isLoggedIn && <ChatWindow
          loggedInUserObj={this.state.loggedInUserObj}
        />}
      </div>
    )
  }
}
