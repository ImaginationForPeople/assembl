// @flow
import React from 'react';
// Components imports
import { Tree } from '../../common/tree';
import FictionComment from './fictionComment';
import FoldedPost from '../common/post/foldedPost';
import { noRowsRenderer } from '../../../pages/idea';
// Type imports
import type { FictionCommentExtraProps } from './fictionComment';
import type { ContentLocaleMapping } from '../../../actions/actionTypes';

export type FictionCommentListProps = {
  /** Array of fiction comments */
  comments: Array<TreeItem & { id: string, contentLocale: string }>,
  /** Content locale used by Tree */
  contentLocale: string,
  /** Content locale mapping used by Tree */
  contentLocaleMapping: ContentLocaleMapping,
  /** Identifier of the idea - e.g 'brightMirror' */
  identifier: string,
  messageViewOverride: string,
  /** Submit comment callback used in order to catch a submit event from tree.jsx */
  onSubmitHandler: Function
};

const FictionCommentList = ({ comments, contentLocale, contentLocaleMapping, identifier, messageViewOverride, onSubmitHandler }: FictionCommentListProps) => {
  const FIRST_ROW_INDEX = 0;

  const fictionCommentExtraProps: FictionCommentExtraProps = {
    submitCommentCallback: onSubmitHandler
  };

  return (
    <Tree
      contentLocaleMapping={contentLocaleMapping}
      lang={contentLocale}
      data={comments}
      initialRowIndex={FIRST_ROW_INDEX}
      InnerComponent={FictionComment}
      InnerComponentFolded={FoldedPost}
      noRowsRenderer={noRowsRenderer}
      SeparatorComponent={() => null}
      identifier={identifier}
      fictionCommentExtraProps={fictionCommentExtraProps}
      messageViewOverride={messageViewOverride}
    />
  );
};

export default FictionCommentList;