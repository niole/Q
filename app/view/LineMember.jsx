import React, {PropTypes, Component} from 'react';
import $ from 'jquery';


const { string, func, number } = PropTypes;
const propTypes = {
  userRank: number.isRequired,
  rankLineMember: number.isRequired,
  userId: string.isRequired,
  bathroomId: string.isRequired,
};

export default class LineMember extends Component {
  constructor() {
    super();
    this.sendCutRequest = this.sendCutRequest.bind(this);
  }

  sendCutRequest() {
    const {
      bathroomId,
      userRank,
      rankLineMember,
      userId,
    } = this.props;

    const url = 'routes/linemember/cut';

    $.ajax({
      url,
      type: "POST",
      data: {
        "fromId": userId,
        "bathroomId": bathroomId,
        "rankLineMember": rankLineMember,
        "money": 1,
      },
      dataType: "json",
      success: () => {
        console.log('success', arguments);
      },
      error: e => console.log(e)
    });

  }

	render() {
    const {
      userRank,
      rankLineMember,
      userId,
      width,
    } = this.props;
    const color = userRank === rankLineMember ? "red" : "green";


		return (
      <div
        className="line-member"
        style={{ width, background: color }}
        onClick={ this.sendCutRequest }
      />
		);
	}
}

LineMember.propTypes = propTypes;
