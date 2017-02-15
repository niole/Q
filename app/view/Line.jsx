import React, {PropTypes, Component} from 'react';
import LineMember from './LineMember.jsx';


const { string, number } = PropTypes;
const propTypes = {
  lineLength: number.isRequired,
  userRank: number.isRequired, // rank > 0, in line, rank === 0, in bathroom, rank === -1, not in line
  userId: number.isRequired,
  bathroomId: number.isRequired,
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
      return <div className="no-line-placeholder">there is no line</div>;
    }
    const viewableLineLength = lineLength-1;
    const width = (100/viewableLineLength)+"%";

    const line = new Array(viewableLineLength);
    let i=1;
    for (; i < viewableLineLength+1; i++) {
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
      <div className="line">{ this.getLineMembers() }</div>
    );
	}
}

Line.propTypes = propTypes;
