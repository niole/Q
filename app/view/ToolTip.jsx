import React, {PropTypes, Component} from 'react';
import Popover from 'material-ui/Popover/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Line from './Line.jsx';


const { bool, arrayOf, string, node, number } = PropTypes;
const propTypes = {
  location: arrayOf(string.isRequired).isRequired,
  lineLength: number.isRequired,
  userRank: number.isRequired, // rank > 0, in line, rank === 0, in bathroom, rank === -1, not in line
  target: node.isRequired,
  shouldOpen: bool.isRequired,
  userId: string.isRequired,
};


export default class ToolTip extends Component {
  getButtons() {
    const {
      userRank,
    } = this.props;

    const addTimeBtn = this.getAddTimeButton(userRank !== 0); //can only add time if in bathroom
    const enterLeaveBtns = this.getEnterLeaveButton(userRank);
    return [addTimeBtn, enterLeaveBtns];
  }

  enterLine() {
    const {
      userId,
    } = this.props;
    console.log(userId, "enterLine");
  }

  leaveLine() {
    const {
      userId,
    } = this.props;
    console.log(userId, "leaveLine");
  }

  getEnterLeaveButton(userRank) {
    //enter bathroom is handled somewhere else
    let handler = this.leaveLine;
    let label = "Leave";

    if (userRank === -1) {
      label = "Enter Line";
      handler = this.enterLine;
    }

    return (
      <FlatButton onClick={ handler } label={ label }/>
    );
  }

  getAddTimeButton(disabled) {
    return (
      <FlatButton label="Add Time" onClick={ this.addTime } disabled={ disabled }/>
    );
  }

  addTime() {
    const {
      userRank,
    } = this.props;

    if (userRank === 0) {
      console.log('add time');
    }
  }

  getLineVis() {
    const {
      userRank,
      lineLength,
      userId,
    } = this.props;
    return (
      <Line
        lineLength={ lineLength }
        userRank={ userRank }
        userId={ userId }
      />
    );
  }

	render() {
    const {
      target,
      shouldOpen,
      location,
    } = this.props;

    return (
      <Popover
        open={shouldOpen}
        anchorEl={target}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        onRequestClose={this.handleRequestClose}
      >
        <Menu>
          <MenuItem>{ location }</MenuItem>
          <MenuItem>{ this.getLineVis() }</MenuItem>
          <MenuItem>{ this.getButtons() }</MenuItem>
        </Menu>
      </Popover>
    );
	}
}

ToolTip.propTypes = propTypes;
