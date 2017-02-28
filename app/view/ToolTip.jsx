import React, {PropTypes, Component} from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import MUIBaseTheme from './MUIBaseTheme.jsx';
import FlatButton from 'material-ui/FlatButton';
import Line from './Line.jsx';
import {
  enterLine,
  leaveLine,
  enterBathroom,
  updateTimeInBathroom,
} from '../actions.js';



const { bool, arrayOf, string, object, number, oneOfType } = PropTypes;
const propTypes = {
  address: string.isRequired,
  name: string.isRequired,
  map: object.isRequired,
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
  constructor(props) {
    super(props);
    const {
      bathroomId,
      updateTimeInBathroom,
    } = props;

    this.enterLine = this.enterLine.bind(this);
    this.leaveLine = this.leaveLine.bind(this);
    this.enterBathroom = this.enterBathroom.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.addTime = this.addTime.bind(this);
    this.updateTimeInBathroom = updateTimeInBathroom.bind(this, bathroomId);
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
      map,
    } = this.props;
    const ne = map.getBounds().getNorthEast();
    const sw = map.getBounds().getSouthWest();

    const url = `routes/linemember/${userId}/${bathroomId}/new`;

    $.ajax({
      type: "POST",
      url,
      data: {
        mapBounds: {
          lats: [ne.lat(), sw.lat()],
          lngs: [ne.lng(), sw.lng()],
        }
      },
      dataType: "json",
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
      timer,
      map,
    } = this.props;
    const ne = map.getBounds().getNorthEast();
    const sw = map.getBounds().getSouthWest();

    const url = `routes/linemember/${userId}/${bathroomId}/leave`;

    $.ajax({
      type: "POST",
      url,
      data: {
        mapBounds: {
          lats: [ne.lat(), sw.lat()],
          lngs: [ne.lng(), sw.lng()],
        }
      },
      dataType: "json",
      success: data => {
        console.log('success');
        leaveLine(data.bathroomId, data.lineLength);

        if (timer.isActive()) {
          timer.stopTimer();
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
      timer,
      map,
      userId,
    } = this.props;

    timer.stopTimer();

    const ne = map.getBounds().getNorthEast();
    const sw = map.getBounds().getSouthWest();

    const url = `routes/bathrooms/${bathroomId}/${userId}/enter`;

    $.ajax({
      type: "POST",
      url,
      data: {
        mapBounds: {
          lats: [ne.lat(), sw.lat()],
          lngs: [ne.lng(), sw.lng()],
        }
      },
      dataType: "json",
      success: data => {
        enterBathroom(bathroomId, 180);
      },
      error: e => {
        console.log('error', e);
      }
    });
  }

  /**
     gets button which allows user to enter or leave a line at viewed bathroom
   */
  getEnterLeaveButton(userRank, inBathroom, timeInBathroom) {
    //enter bathroom is handled somewhere else
    const {
      timer,
    } = this.props;

    let label = "Click to Enter Line";
    let handler = this.enterLine;

    if (userRank === 0) {
      if (!inBathroom) {
        handler = this.enterBathroom;

        if (!timer.isActive()) {
          //start timer
          label = '20 Enter Bathroom';
          timer.setIntervalObserver(this.updateTimeInBathroom);
          timer.setObserver(this.leaveLine);
          timer.setMS(20000);
          timer.runIntervalTimer();
        } else {
          label = `${timeInBathroom} Enter Bathroom`;
        }

      } else if (!timer.isActive()) {
        //in bathroom, but no timer
        handler = this.leaveLine;
        label = "180 Leave Bathroom";
        timer.setIntervalObserver(this.updateTimeInBathroom);
        timer.setObserver(this.leaveLine);
        timer.setMS(180000);
        timer.runIntervalTimer();
      } else {
        //timer's running, but in bathroom
        handler = this.leaveLine;
        label = `${timeInBathroom} Leave Bathroom`;
      }
    }

    const labelStyle = { textTransform: "none" };

    return (
      <div className="enter-leave-container">
        <FlatButton
          disabled={ userRank < 0 }
          labelStyle={ labelStyle }
          key="leave-btn"
          onClick={ this.leaveLine }
          label="Click to Leave Line"/>
        <FlatButton
          disabled={ userRank > 0 }
          labelStyle={ labelStyle }
          key={ `${label}-btn` }
          onClick={ handler }
          label={ label }/>
      </div>
    );
  }

  /**
     gets button which allows user to add time to timer while in bathroom
   */
  getAddTimeButton(disabled) {
    return (
      <FlatButton labelStyle={{ textTransform: "none" }} key="add-time" label="Add Time" onClick={ this.addTime } disabled={ !!disabled }/>
    );
  }

  /**
     handler for adding time when user is in bathroom
     always adds 1 min
   */
  addTime() {
    const {
      timer,
    } = this.props;

    const ms = 60000;
    const s = 60;
    timer.addAdditionalTime(ms);
    this.updateTimeInBathroom(s);
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

    return (
        <Line
          bathroomId={ bathroomId }
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
      userRank,
      name,
      address,
    } = this.props;

    return (
      <Dialog
        title={ name }
        actions={ this.getButtons() }
        modal={false}
        open={ true }
        onRequestClose={ this.handleRequestClose }
      >
        <Menu>
          <MenuItem key="location">{ address }</MenuItem>
          <MenuItem key="line-vis">
            <div className="toilet-header">
              { this.getLineHeader() }
            </div>
            { this.getLineBody() }
          </MenuItem>
        </Menu>
      </Dialog>
    );
	}
}

ToolTip.propTypes = propTypes;
ToolTip.defaultProps = defaultProps;

const mapStateToProps = (state, ownProps) => {
  const bathroom = state.nearbyBathrooms.find(b => b.id === ownProps.bathroomId);
  return {
    occupyingBathroom: state.occupiedBathroom === ownProps.bathroomId,
    occupiedBathroom: state.occupiedBathroom,
    userRank: state.lines[ownProps.bathroomId],
    lineLength: bathroom ? bathroom.lineLength : 0,
    timeInBathroom: state.timeInBathroom[ownProps.bathroomId] || 0,
    timer: state.timers[ownProps.bathroomId],
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    enterLine: (bId, time) => dispatch(enterLine(bId, time)),
    leaveLine: (bId, time) => dispatch(leaveLine(bId, time)),
    enterBathroom: (bId, time) => dispatch(enterBathroom(bId, time)),
    updateTimeInBathroom: (bId, time) => dispatch(updateTimeInBathroom(bId, time))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolTip)
