import React, { Component } from 'react';
import Friends from './friends/friends';
import Messanger from './messanger/messanger';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getUserChats, clearUserChats } from '../../store/actions/socketActions';

import socket from '../../socket/socket';

import './chat.css';

class Chat extends Component {
  componentDidMount() {
    socket.connect();
    this.props.getUserChats(socket);

    socket.on('sendChatToClient', () => {
      this.props.getUserChats(socket);
    });

    socket.on('chatRemoved', () => {
      this.props.clearUserChats();
      this.props.history.push('/');
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.nick !== this.props.match.params.nick) {
      this.props.getUserChats(socket);
    }
  }

  render() {
    return (
        <div className="chat">
            <Friends activeChat={this.props.match.params.nick} avatars={this.props.avatars} chats={this.props.chats} name={this.props.name} />
            <Messanger socket={socket} name={this.props.name} avatars={this.props.avatars} chats={this.props.chats} activeChat={this.props.match.params.nick} />
        </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    chats: state.socket.chats,
    name: state.socket.name,
    avatars: state.socket.avatars
  }
}

export default connect(mapStateToProps, { getUserChats, clearUserChats })(withRouter(Chat));