// @flow
import React from 'react';
import classNames from 'classnames';
// Components imports
import ResponsiveOverlayTrigger from '../../common/responsiveOverlayTrigger';
import { answerTooltip } from '../../common/tooltips';

export type ReplyToCommentButtonProps = {
  /** On click callback function */
  onClickCallback: Function,
  disabled?: boolean,
  tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left'
};

const ReplyToCommentButton = ({ onClickCallback, disabled, tooltipPlacement }: ReplyToCommentButtonProps) => (
  <button type="button" className={classNames('action-reply no-border no-background', { disabled: disabled })} onClick={onClickCallback}>
    <ResponsiveOverlayTrigger placement={tooltipPlacement || 'top'} tooltip={answerTooltip}>
      <span className="assembl-icon-back-arrow" />
    </ResponsiveOverlayTrigger>
  </button>
);

ReplyToCommentButton.defaultProps = {
  disabled: false,
  tooltipPlacement: 'left'
};

export default ReplyToCommentButton;