import React, {PropTypes, Component} from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import MUIBaseTheme from './MUIBaseTheme.jsx';
import {
  toggleBathroomMaker,
} from '../actions.js';


class CreateBathroomDialog extends MUIBaseTheme {
  constructor() {
    super();
    this.closeNewBathroomDialog = this.closeNewBathroomDialog.bind(this);
  }

  closeNewBathroomDialog(shouldSubmit = false) {
    const {
      toggleBathroomMaker,
      inProgressBathroomLatLng,
      inProgressBathroomAddress,
      userId,
    } = this.props;

    //get data
    const name = document.getElementById("new-bathroom-name").value;

    if (shouldSubmit) {
      //send to BE
      const url = 'routes/bathrooms/add';
      $.ajax({
        url,
        type: "POST",
        dataType: "json",
        data: {
          address: inProgressBathroomAddress,
          name: name,
          ownerId: userId,
          lat: inProgressBathroomLatLng[0],
          lng: inProgressBathroomLatLng[1],
        },
        success: bData => {
        },
        error: err => {
          console.log('error', err);
        }
      });
    }

    toggleBathroomMaker();
  }

  showAddBathroomDialog() {
    const {
      inProgressBathroomAddress,
    } = this.props;

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.closeNewBathroomDialog}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.closeNewBathroomDialog.bind(this, true)}
      />,
    ];

    return (
      <Dialog
        title="Creating new bathroom at ..."
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={this.closeNewBathroomDialog}
      >
      <MenuItem primaryText={ inProgressBathroomAddress }/>
      <TextField
        hintText="Name This Bathroom"
        id="new-bathroom-name"
      />
      </Dialog>
    );
  }

  render() {
    return this.showAddBathroomDialog();
  }
}

const mapStateToProps = (state) => {
  const {
    inProgressBathroomAddress,
    inProgressBathroomLatLng,
    userId,
  } = state;

  return {
    inProgressBathroomAddress,
    inProgressBathroomLatLng,
    userId,
  };
}

const mapDispatchToProps = dispatch => {
  //initiated by actions
  //put in a container component that
  return {
    toggleBathroomMaker: (shouldOpen, address, latLng) => dispatch(toggleBathroomMaker(shouldOpen, address, latLng)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateBathroomDialog)
