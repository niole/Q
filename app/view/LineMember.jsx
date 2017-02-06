import React, {PropTypes, Component} from 'react';


const { string, number } = PropTypes;
const propTypes = {
  userRank: number.isRequired,
  rankLineMember: number.isRequired,
  userId: string.isRequired,
};

export default class LineMember extends Component {
  sendCutRequest() {
    const {
      userRank,
      rankLineMember,
      userId,
    } = this.props;

    if (userRank !== rankLineMember) {
      console.log('sending cut request', this.props);
    }
  }

	render() {
    const {
      userRank,
      rankLineMember,
      userId,
    } = this.props;
    const color = userRank === rankLineMember ? "red" : "green";


		return (
      <div
        className="line-member"
        style={{ background: color }}
        onClick={ this.sendCutRequest }
      />
		);
	}
}

LineMember.propTypes = propTypes;
