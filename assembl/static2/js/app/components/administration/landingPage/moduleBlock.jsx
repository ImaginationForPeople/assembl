// @flow
import React from 'react';
import { OverlayTrigger, Button } from 'react-bootstrap';

import { upTooltip, downTooltip } from '../../common/tooltips';

type Props = {
  moveUp: Function,
  moveDown: Function,
  title: string,
  withArrows: boolean
};

const ModuleBlock = ({ moveDown, moveUp, title, withArrows }: Props) => (
  <div className="module-block">
    {title}
    {withArrows ? (
      <span>
        <OverlayTrigger placement="top" overlay={downTooltip}>
          <Button onClick={moveDown} className="admin-icons">
            <span className="assembl-icon-down-bold grey" />
          </Button>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={upTooltip}>
          <Button onClick={moveUp} className="admin-icons">
            <span className="assembl-icon-up-bold grey" />
          </Button>
        </OverlayTrigger>
      </span>
    ) : null}
  </div>
);

ModuleBlock.defaultProps = {
  withArrows: false
};

export default ModuleBlock;