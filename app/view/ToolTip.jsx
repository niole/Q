import React, {PropTypes, Component} from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import Popover from 'material-ui/Popover/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import MUIBaseTheme from './MUIBaseTheme.jsx';
import FlatButton from 'material-ui/FlatButton';
import Line from './Line.jsx';
import Timer from '../Timer.js';
import {
  enterLine,
  leaveLine,
  enterBathroom,
  updateTimeInBathroom,
} from '../actions.js';



const { bool, arrayOf, string, object, number, oneOfType } = PropTypes;
const propTypes = {
  location: arrayOf(number.isRequired).isRequired,
  lineLength: number.isRequired,
  shouldOpen: bool.isRequired,
  userId: number.isRequired,
  bathroomId: number.isRequired,
  target: object,
  userRank: number,
  occupyingBathroom: oneOfType([bool, number]),
};
const defaultProps = {
  userRank: -1,
};


/**
  allows user to look at lines
  see their rank in line
  enter/leave line
  enter/leave bathroom
  add time while in bathroom
  send messages to LineMembers to ask
  to cut them in line
 */
class ToolTip extends MUIBaseTheme {
  constructor() {
    super();
    this.timer = null;
    this.enterLine = this.enterLine.bind(this);
    this.leaveLine = this.leaveLine.bind(this);
    this.enterBathroom = this.enterBathroom.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.addTime = this.addTime.bind(this);
  }

  /**
    gets buttons which allow user to add time while in bathroom and
    enter/leave line
   */
  getButtons() {
    const {
      userRank,
      occupyingBathroom,
      timeInBathroom,
    } = this.props;

    const addTimeBtn = this.getAddTimeButton(!!!occupyingBathroom); //can only add time if in bathroom
    const enterLeaveBtns = this.getEnterLeaveButton(userRank, occupyingBathroom, timeInBathroom);
    return [addTimeBtn, enterLeaveBtns];
  }

  /**
     dispatches action to update client state and
     updates LineMember collection when user enters line
   */
  enterLine() {
    const {
      userId,
      bathroomId,
      enterLine,
    } = this.props;
    const url = `routes/linemember/${userId}/${bathroomId}/new`;

    $.ajax({
      url,
      success: lineDetails => {
        const {
          bathroomId,
          rank,
        } = lineDetails;

        if (rank === 0) {
          enterLine({ [bathroomId]: rank }, 20);
        } else {
          enterLine({ [bathroomId]: rank });
        }

      },
      error: e => {
        console.log('error', e);
      }
    });
  }

  /**
     dispatches action to update client state and
     updates LineMember collection when user leaves line
   */
  leaveLine() {
    const {
      userId,
      bathroomId,
      leaveLine,
    } = this.props;

    const url = `routes/linemember/${userId}/${bathroomId}/leave`;

    $.ajax({
      url,
      success: data => {
        console.log('success');
        leaveLine(data.bathroomId, data.lineLength);

        if (this.timer) {
          this.timer.stopTimer();
          this.timer = null;
        }
      },
      error: e => {
        console.log('error', e);
      }
    });
  }

  enterBathroom() {
    const {
      enterBathroom,
      bathroomId,
    } = this.props;

    this.timer.stopTimer();
    this.timer = null;
    enterBathroom(bathroomId, 180);
  }

  /**
     gets button which allows user to enter or leave a line at viewed bathroom
   */
  getEnterLeaveButton(userRank, inBathroom, timeInBathroom) {
    //enter bathroom is handled somewhere else
    let handler = this.leaveLine;
    let label = "Leave Line";

    if (userRank <= 0) {
      label = "Enter Line";
      handler = this.enterLine;
    }

    if (userRank === 0) {
      if (!inBathroom) {
        handler = this.enterBathroom;

        if (!this.timer) {
          //start timer
          label = '20 Enter Bathroom';
          this.timer = new Timer(this.leaveLine, 20000, this.props.updateTimeInBathroom);
          this.timer.runIntervalTimer();
        } else {
          label = `${timeInBathroom} Enter Bathroom`;
        }

      } else if (!this.timer) {
        //in bathroom, but no timer
        handler = this.leaveLine;
        label = "180 Leave Bathroom";
        this.timer = new Timer(this.leaveLine, 180000, this.props.updateTimeInBathroom);
        this.timer.runIntervalTimer();
      } else {
        //timer's running, but in bathroom
        handler = this.leaveLine;
        label = `${timeInBathroom} Leave Bathroom`;
      }
    }

    return (
      <FlatButton key={ `${label}-btn` } onClick={ handler } label={ label }/>
    );
  }

  /**
     gets button which allows user to add time to timer while in bathroom
   */
  getAddTimeButton(disabled) {
    return (
      <FlatButton key="add-time" label="Add Time" onClick={ this.addTime } disabled={ !!disabled }/>
    );
  }

  /**
     handler for adding time when user is in bathroom
     always adds 1 min
   */
  addTime() {
    const ms = 60000;
    const s = 60;
    this.timer.addAdditionalTime(ms);
    this.props.updateTimeInBathroom(s);
  }

  getLineHeader() {
    const {
      lineLength,
      occupyingBathroom,
      userRank,
    } = this.props;
    let label = "Vacant";
    let className = "empty-hourglass";

    if (lineLength > 0 && userRank !== 0 || userRank === 0 && occupyingBathroom) {
      label = "Occupied";
      className = "full-hourglass";
    }

    return (
      <div title={ label } className={ `hourglass ${className}` }/>
    );
  }

  /**
    renders the linemembers of bathroom currently viewed
    user can click on linemember to send a "cut in line message"
    current user is red
    everyone else is green
    user that is in the bathroom is not in the linemember vis, but
    the data for the person in the bathroom is a LineMember model instance
   */
  getLineBody() {
    const {
      lineLength,
      userId,
      bathroomId,
      userRank,
    } = this.props;

    if (userRank > 0) {
      return (
          <Line
            bathroomId={ bathroomId }
            lineLength={ lineLength }
            userRank={ userRank }
            userId={ userId }
          />
      );
    }
  }

  handleRequestClose() {
    const {
      closeTooltip,
      bathroomId,
      timeInBathroom,
    } = this.props;

    if (timeInBathroom === 0) {
      closeTooltip(bathroomId);
    }
  }

	render() {
    const {
      target,
      shouldOpen,
      location,
      userRank,
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
          <MenuItem key="line-vis">
            <div className="toilet-header">
              { this.getLineHeader() }
            </div>
            { this.getLineBody() }
          </MenuItem>
          <MenuItem key="btns">{ this.getButtons() }</MenuItem>
        </Menu>
      </Popover>
    );
	}
}

ToolTip.propTypes = propTypes;
ToolTip.defaultProps = defaultProps;

const mapStateToProps = (state, ownProps) => {
  const bathroom = state.nearbyBathrooms.find(b => b.id === ownProps.bathroomId);
  return {
    occupyingBathroom: state.occupyingBathroom,
    userRank: state.lines[ownProps.bathroomId],
    lineLength: bathroom ? bathroom.lineLength : 0,
    timeInBathroom: state.timeInBathroom,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    enterLine: (bId, time) => dispatch(enterLine(bId, time)),
    leaveLine: (bId, time) => dispatch(leaveLine(bId, time)),
    enterBathroom: (bId, time) => dispatch(enterBathroom(bId, time)),
    updateTimeInBathroom: (time) => dispatch(updateTimeInBathroom(time))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolTip)
