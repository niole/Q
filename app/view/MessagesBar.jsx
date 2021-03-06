import React, {PropTypes} from 'react';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import MUIBaseTheme from './MUIBaseTheme.jsx';
import Message from './Message.jsx';
import Timeout from './Timeout.jsx';


const { object, arrayOf } = PropTypes;
const propTypes = {
  messages: arrayOf(object),
  map: object.isRequired,
  timeInBathroom: object.isRequired,
};

const defaultProps = {
  messages: [],
};

export default class MessagesBar extends MUIBaseTheme {
  renderTimers(timers) {
    let renderable = [];
    let bId;
    for (bId in timers) {
      if (timers[bId] > 0) {
        renderable.push(<Timeout bathroomId={ bId }/>);
      }
    }

    return renderable;
  }

	render() {
   const {
     timeInBathroom,
     messages,
     map,
   } = this.props;

   return (
      <Paper
        style={{
          height: "120px",
          width: "100%",
          position: "fixed",
          bottom: "0px",
        }}
        zDepth={1}>
        <div>
          <div className="message-icon-container">
            <div className="message-icon"/>
            <div>Messages</div>
          </div>
          <div className="messages toolbar-box">
            { messages.map(m => <Message map={ map } key={ m.createdAt }  message={ m }/>) }
          </div>
          <div className="timers toolbar-box">
            { this.renderTimers(timeInBathroom) }
          </div>
        </div>
        <a id="logout-link" href="/logout">logout</a>
      </Paper>
    );
	}
}

MessagesBar.propTypes = propTypes;
MessagesBar.defaultProps = defaultProps;
