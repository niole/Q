import React, {PropTypes, Component} from 'react';
import Paper from 'material-ui/Paper';


const { object, arrayOf } = PropTypes;
const propTypes = {
  message: object.isRequired,
};

export default class Message extends Component {
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

	render() {
    const {
      message,
    } = this.props;

    return (
      <Paper
        style={ this.getContainerStyle() }
        zDepth={2}>
        { this.getFormattedMessage(message) }
      </Paper>
    );
  }

}

Message.propTypes = propTypes;
