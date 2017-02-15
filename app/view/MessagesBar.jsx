import React, {PropTypes} from 'react';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import MUIBaseTheme from './MUIBaseTheme.jsx';
import Message from './Message.jsx';
import Timeout from './Timeout.jsx';


const { object, arrayOf } = PropTypes;
const propTypes = {
  messages: arrayOf(object),
  timers: object,
};

const defaultProps = {
  messages: [],
  timers: {},
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
     timers,
     messages,
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
        <BottomNavigation selectedIndex={1}>
          <div className="timers toolbar-box">
            { this.renderTimers(timers) }
          </div>
          <BottomNavigationItem
            label="Messages"
            icon={ <div className="message-icon"/> }
            onTouchTap={() => this.select(0)}
            style={{
              height: 100,
              position: "absolute",
              top: 10,
            }}
          />
          <div className="messages toolbar-box">
            { messages.map(m => <Message key={ m.createdAt }  message={ m }/>) }
          </div>
        </BottomNavigation>
      </Paper>
    );
	}
}

MessagesBar.propTypes = propTypes;
MessagesBar.defaultProps = defaultProps;
