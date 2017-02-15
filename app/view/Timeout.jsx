import React, {PropTypes, Component} from 'react';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';

const { number } = PropTypes;
const propTypes = {
  bathroomId: number.isRequired,
};

export default class Timeout extends Component {
  render() {
    const {
      bathroomId,
    } = this.props;

    return (
      <Badge
        style={{
          padding: 25,
          top: 15,
        }}
        badgeContent={ bathroomId }
        secondary={true}
      >
        <NotificationsIcon/>
      </Badge>
    );
  }
}

Timeout.propTypes = propTypes;
