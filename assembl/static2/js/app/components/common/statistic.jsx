import React from 'react';

const Statistic = (props) => {
  const { numPosts, numContributors } = props;
  return (
    <div className="stats">
      <div className="stat-nb">
        <span>{numPosts}</span>
        <span className="assembl-icon-message white">&nbsp;</span>
      </div>
      <div className="dash">-</div>
      <div className="stat-nb">
        <span>{numContributors}</span>
        <span className="assembl-icon-profil white">&nbsp;</span>
      </div>
    </div>
  );
};

export default Statistic;