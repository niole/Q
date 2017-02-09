import React, {PropTypes, Component} from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import Popover from 'material-ui/Popover/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import MUIBaseTheme from './MUIBaseTheme.jsx';
import FlatButton from 'material-ui/FlatButton';
import Line from './Line.jsx';
import {
  enterLine,
  leaveLine,
} from '../actions.js';



const { bool, arrayOf, string, object, number } = PropTypes;
const propTypes = {
  location: arrayOf(number.isRequired).isRequired,
  lineLength: number.isRequired,
  shouldOpen: bool.isRequired,
  userId: number.isRequired,
  bathroomId: number.isRequired,
  target: object,
  userRank: number,
};
const defaultProps = {
  userRank: -1,
};


class ToolTip extends MUIBaseTheme {
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
      bathroomId,
      enterLine,
    } = this.props;
    const url = `routes/linemember/${userId}/${bathroomId}/new`;

    $.ajax({
      url,
      success: lineDetails => {
        console.log('success');
        const {
          bathroomId,
          rank,
        } = lineDetails;
        enterLine({ [bathroomId]: rank });
      },
      error: e => {
        console.log('error', e);
      }
    });
  }

  leaveLine() {
    const {
      userId,
      bathroomId,
      leaveLine,
    } = this.props;

    const url = `routes/linemember/${userId}/${bathroomId}/leave`;

    $.ajax({
      url,
      success: bathroomId => {
        console.log('success');
        leaveLine(bathroomId);
      },
      error: e => {
        console.log('error', e);
      }
    });
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
ToolTip.defaultProps = defaultProps;

const mapStateToProps = (state, ownProps) => {
  const bathroom = state.nearbyBathrooms.find(b => b.id === ownProps.bathroomId);
  return {
    userRank: state.lines[ownProps.bathroomId],
    lineLength: bathroom ? bathroom.lineLength : 0,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    enterLine: bId => dispatch(enterLine(bId)),
    leaveLine: bId => dispatch(leaveLine(bId)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolTip)
