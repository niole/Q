import React from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

/**
 * Basic theme bookkeeping for Material UI
 */
class BaseMUI extends React.Component {
  getChildContext() {
    return {
      muiTheme: getMuiTheme(lightBaseTheme)
    };
  }
}

BaseMUI.childContextTypes = {
  muiTheme: React.PropTypes.object
};

export default BaseMUI;
