import React, {PropTypes, Component} from 'react';
import LineMember from './LineMember.jsx';


const { string, number } = PropTypes;
const propTypes = {
  lineLength: number.isRequired,
  userRank: number.isRequired, // rank > 0, in line, rank === 0, in bathroom, rank === -1, not in line
  userId: string.isRequired,
  bathroomId: string.isRequired,
};


export default class Line extends Component {
  getLineMembers() {
    const {
      lineLength,
      userRank,
      userId,
      bathroomId,
    } = this.props;

    if (!lineLength) {
      return "there is no line";
    }

    const width = (100/lineLength)+"%";

    const line = new Array(lineLength);
    let i=0;
    for (; i < lineLength; i++) {
      line[i] = (
        <LineMember
          key={ `linemember-${i}` }
          userId={ userId }
          rankLineMember={ i }
          userRank={ userRank }
          width={ width }
          bathroomId={ bathroomId }
        />
      );
    }

		return line;
  }

	render() {
		return (
      <div>
        line: <div className="line">{ this.getLineMembers() }</div>
      </div>
    );
	}
}

Line.propTypes = propTypes;
