import React, {PropTypes, Component} from 'react';
import Popover from 'material-ui/Popover/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Line from './Line.jsx';
import MUIBaseTheme from './MUIBaseTheme.jsx';


const { bool, arrayOf, string, object, number } = PropTypes;
const propTypes = {
  location: arrayOf(number.isRequired).isRequired,
  lineLength: number.isRequired,
  userRank: number.isRequired, // rank > 0, in line, rank === 0, in bathroom, rank === -1, not in line
  shouldOpen: bool.isRequired,
  userId: string.isRequired,
  bathroomId: string.isRequired,
  target: object,
};


export default class ToolTip extends MUIBaseTheme {
  constructor() {
    super();
    this.enterLine = this.enterLine.bind(this);
    this.leaveLine = this.leaveLine.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

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
      <FlatButton key={ `${label}-btn` } onClick={ handler } label={ label }/>
    );
  }

  getAddTimeButton(disabled) {
    return (
      <FlatButton key="add-time" label="Add Time" onClick={ this.addTime } disabled={ disabled }/>
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

  handleRequestClose() {
    const {
      closeTooltip,
      bathroomId,
    } = this.props;
    closeTooltip(bathroomId);
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
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
        onRequestClose={this.handleRequestClose}
      >
        <Menu>
          <MenuItem key="location">{ location }</MenuItem>
          <MenuItem key="line-vis">{ this.getLineVis() }</MenuItem>
          <MenuItem key="btns">{ this.getButtons() }</MenuItem>
        </Menu>
      </Popover>
    );
	}
}

ToolTip.propTypes = propTypes;
