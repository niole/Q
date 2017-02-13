import React, {PropTypes, Component} from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import Paper from 'material-ui/Paper';
import {
  acceptCut,
} from '../actions.js';


const { object, arrayOf } = PropTypes;
const propTypes = {
  message: object.isRequired,
};

class Message extends Component {
  constructor() {
    super();
    this.acceptMessage = this.acceptMessage.bind(this);
  }

  getFormattedMessage(m) {
    return `user ${m.fromId} would like to cut you in line for $${m.money}.`;
  }

  getContainerStyle() {
      return {
        width: 100,
        height: 90,
        padding: 5,
        margin: 5,
        textAlign: 'center',
        display: 'inline-block',
      };
  }

  acceptMessage(event) {
    event.stopPropagation();
    const {
      message,
      acceptCut,
    } = this.props;

    const url = 'routes/messages/accept';
    $.ajax({
      url,
      type: "POST",
      dataType: "json",
      data: message,
      success: data => {
        acceptCut(...data);
      },
      error: err => {
        console.log('error', err);
      }
    });
  }

	render() {
    const {
      message,
    } = this.props;

    return (
      <Paper
        onClick={ this.acceptMessage }
        style={ this.getContainerStyle() }
        zDepth={2}>
        { this.getFormattedMessage(message) }
      </Paper>
    );
  }

}

Message.propTypes = propTypes;

const mapDispatchToProps = dispatch => {
  return {
    acceptCut: (bathroomId, newRank, messageId) => dispatch(acceptCut(bathroomId, newRank, messageId)),
  };
}

export default connect(
  undefined,
  mapDispatchToProps
)(Message)

