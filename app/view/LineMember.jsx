import React, {PropTypes, Component} from 'react';
import $ from 'jquery';


const { string, func, number } = PropTypes;
const propTypes = {
  userRank: number.isRequired,
  rankLineMember: number.isRequired,
  userId: number.isRequired,
  bathroomId: number.isRequired,
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

    const url = `routes/linemember/${bathroomId}/${userId}/cut`;

    $.ajax({
      url,
      type: "POST",
      data: {
        rankLineMember: rankLineMember,
        money: 1,
      },
      dataType: "json",
      success: message => {
        console.log('success');
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
