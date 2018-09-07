// @flow
import React, { Fragment } from 'react';

import CircleAvatar from './circleAvatar';
import type { CircleAvatarType } from './circleAvatar';

export type FictionHeaderType = {
  /** Author fullname */
  authorFullname: string,
  /** Article published date */
  publishedDate: string,
  /** Article displayed published date */
  displayedPublishedDate: string,
  /** Circle avatar props */
  circleAvatar: CircleAvatarType
};

const noAuthorMessage: string = 'no author specified';

const fictionHeader = ({ authorFullname, publishedDate, displayedPublishedDate, circleAvatar }: FictionHeaderType) => (
  <Fragment>
    <header className="header">
      <CircleAvatar {...circleAvatar} />
      <div className="meta">
        <p className="author">{authorFullname || noAuthorMessage}</p>
        <p className="date-time">
          <time dateTime={publishedDate} pubdate="true">
            {displayedPublishedDate}
          </time>
        </p>
      </div>
    </header>
    <hr />
  </Fragment>
);

export default fictionHeader;