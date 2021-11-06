import React, { Component } from 'react'
import API from '../../services/api'
import dataService from '../../Network/dataService';
import { actLogin, actLogout, actSaveInfo } from '../../Actions';
import { connect } from 'react-redux';
import api from '../Global/api';


export class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: "",
            password: ""
        }
    }

    onLoginComplete = (user) => {
        this.props.onSaveInfo(user);
        this.props.loginProp(user)
    }

    login = async () => {
        // Call Login API to get user ID if the user exists in DB
        try {
            let loginResult = await dataService.login({
                username: this.state.username,
                password: this.state.password
            })
            this.props.onLogin({
              accessToken: loginResult.jwttoken
            });
            api.setToken();
            let userResult = await dataService.currentUser()
            this.onLoginComplete({
              username: userResult.username,
              avatar: userResult.avatar,
              fullName: userResult.fullName,
              email: userResult.email,
              active: userResult.active
            });
        } catch (error) {
            //let element = document.querySelector(".incorrect-user")
            //element.innerText = "Some Error Occurred."
        }
    }

    handleUser = e => {
        this.setState({ username: e.target.value })
    }
    handlePass = e => {
        this.setState({ password: e.target.value })
    }
    render() {
        return (
            <div className="bg-gray-900">
                <div className="login container mx-auto w-full max-w-xs items-center pt-12 h-screen">
                    <form action="chat.html" method="GET" className="bg-white shadow-md rounded px-8 pt-8 pb-8 m-4">
                        <label className="block text-lg font-bold mb-4 py-2 text-center bg-gray-800 rounded text-white">Healthcare Chat Login</label>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Username</label>
                            <label className="incorrect-user text-red-500"></label>
                            <input value={this.state.username} onChange={(e) => this.handleUser(e)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="username" type="text" placeholder="Enter Username here..." />

                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Password</label>
                            <label className="incorrect-user text-red-500"></label>
                            <input value={this.state.password} onChange={(e) => this.handlePass(e)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="username" type="text" placeholder="Enter Password here..." />
                        </div>
                        <button id="login" onClick={() => this.login()}
                            className="btn-primary rounded-full text-white font-bold py-2 px-4 mx-16 rounded focus:outline-none focus:shadow-outline place-self-center"
                            type="button">
                            Login</button>
                    </form>
                    <p className="text-center text-gray-500 text-xs">
                        &copy;2020 QED42. All rights reserved.</p>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onLogin: (data) => {
            dispatch(actLogin(data))
        },
        onSaveInfo: (data) => {
            dispatch(actSaveInfo(data))
        },
    }
}

export default connect(null, mapDispatchToProps)(Login)