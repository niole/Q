import React, {PropTypes, Component} from 'react';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import MUIBaseTheme from './MUIBaseTheme.jsx';


const { object, arrayOf } = PropTypes;
const propTypes = {
  messages: arrayOf(object),
};

const defaultProps = {
  messages: [],
};

export default class MessagesBar extends MUIBaseTheme {
	constructor() {
		super();

		this.state = {
		};
	}

	render() {
   return (
      <Paper zDepth={1}>
        <BottomNavigation selectedIndex={0}>
          <BottomNavigationItem
            label="Messages"
            icon={ <div className="message-icon"/> }
            onTouchTap={() => this.select(0)}
            style={{ float: "left" }}
          />
          { this.props.messages.map(m => <Paper zDepth={2}>{ m }</Paper>) }
        </BottomNavigation>
      </Paper>
    );
	}
}

MessagesBar.propTypes = propTypes;
MessagesBar.defaultProps = defaultProps;
