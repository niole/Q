import React, {PropTypes, Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
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
      return "there is no line";
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

  getLineHeader() {
    const {
      lineLength,
    } = this.props;
    let label = "Occupied";

    if (lineLength === 0) {
      label = "Vacant";
    }

    const className = lineLength ? "full-hourglass" : "empty-hourglass";
    return (
      <div title={ label } className={ `hourglass ${className}` }/>
    );
  }

	render() {
		return (
      <div>
        <div className="toilet-header">{ this.getLineHeader() }</div>
        <div className="line">{ this.getLineMembers() }</div>
      </div>
    );
	}
}

Line.propTypes = propTypes;
