// @flow
import React from 'react';

import { isMobile } from '../../utils/globalFunctions';
import { withScreenHeight } from './screenDimensions';

type Props = {
  hidden: boolean,
  screenHeight: number
};

const scrollOnePageDown = (screenHeight: number) => () => {
  window.scrollTo({ top: screenHeight, left: 0, behavior: 'smooth' });
};

export const DumbScrollOnePageButton = ({ hidden, screenHeight }: Props) => {
  const scrollOnePageTopPosition = screenHeight - 35;
  const isTouchScreen = isMobile.any();
  return (
    <button
      type="button"
      className={`scroll-one-page no-border no-background ${hidden || screenHeight > 750 || isTouchScreen ? 'hidden' : ''}`}
      onClick={scrollOnePageDown(screenHeight)}
      style={{ top: scrollOnePageTopPosition }}
    >
      <span>
        <span className="icon assembl-icon-down-open">&nbsp;</span>
      </span>
    </button>
  );
};

export default withScreenHeight(DumbScrollOnePageButton);