// @flow
import React from 'react';

export type ToggleCommentButtonProps = {
  /** Expand flag that changes the icon style */
  isExpanded: boolean,
  /** On click callback function */
  onClickCallback?: ?Function
};

const ToggleCommentButton = ({ isExpanded, onClickCallback }: ToggleCommentButtonProps) => {
  const iconStyle = isExpanded ? 'up' : 'down';

  return (
    <button type="button" className="action-toggle no-border no-background" onClick={onClickCallback}>
      <span className={`assembl-icon-${iconStyle}-open`} />
    </button>
  );
};

ToggleCommentButton.defaultProps = {
  onClickCallback: () => null
};

export default ToggleCommentButton;