import React, {PropTypes} from 'react';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import MUIBaseTheme from './MUIBaseTheme.jsx';
import Message from './Message.jsx';


const { object, arrayOf } = PropTypes;
const propTypes = {
  messages: arrayOf(object),
};

const defaultProps = {
  messages: [],
};

export default class MessagesBar extends MUIBaseTheme {
	render() {
   return (
      <Paper
        style={{ height: "100px" }}
        zDepth={1}>
        <BottomNavigation selectedIndex={0}>
          <BottomNavigationItem
            label="Messages"
            icon={ <div className="message-icon"/> }
            onTouchTap={() => this.select(0)}
            style={{ left: 0 }}
          />
          { this.props.messages.map(m => <Message key={ m.createdAt }  message={ m }/>) }
        </BottomNavigation>
      </Paper>
    );
	}
}

MessagesBar.propTypes = propTypes;
MessagesBar.defaultProps = defaultProps;
