import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import socket from '../../../socket/socket';

import { login } from '../../../store/actions/authActions';

import './login.css';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: null,
      password: null
    }
  }

  componentWillUnmount() {
    socket.disconnect();
  }

  handleInputChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleLoginSubmit = e => {
    e.preventDefault();
    this.props.login({
      username: this.state.username,
      password: this.state.password
    });
  }

  render() {
    return (
        <div className="login">
            <form onSubmit={this.handleLoginSubmit} className="login__form">
              {
                this.props.loginError ? (
                  <div className="login__errors">
                    <p className="login__errors--message">{this.props.loginError}</p>
                  </div>
                ) : (
                  ''
                )
              }
              <div className="login__input--group">
                <input onChange={this.handleInputChange} className="login__input" name="username" type="text" required></input>
                <label className="floating-label" htmlFor="username">Your nick</label>
              </div>
              <div className="login__input--group">
                <input onChange={this.handleInputChange} className="login__input" name="password" type="password" required></input>
                <label className="floating-label" htmlFor="password">Your password</label>
              </div>
              <button className="login__button">Log in</button>
              <Link to="/register" className="login__link">Register</Link>
            </form>
        </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginError: state.auth.loginError
  }
}

export default connect(mapStateToProps, { login })(Login);