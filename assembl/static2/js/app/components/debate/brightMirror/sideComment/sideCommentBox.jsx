// @flow
import * as React from 'react';

import ARange from 'annotator_range'; // eslint-disable-line
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import { Button } from 'react-bootstrap';
import { Translate, I18n } from 'react-redux-i18n';
import classnames from 'classnames';
import { EditorState } from 'draft-js';

import addPostExtractMutation from '../../../../graphql/mutations/addPostExtract.graphql';
import createPostMutation from '../../../../graphql/mutations/createPost.graphql';
import updatePostMutation from '../../../../graphql/mutations/updatePost.graphql';
import deletePostMutation from '../../../../graphql/mutations/deletePost.graphql';
import deleteExtractMutation from '../../../../graphql/mutations/deleteExtract.graphql';
import manageErrorAndLoading from '../../../../components/common/manageErrorAndLoading';
import { getConnectedUserId, getConnectedUserName } from '../../../../utils/globalFunctions';
import { displayAlert, displayModal, closeModal } from '../../../../utils/utilityManager';
import { COMMENT_BOX_OFFSET, PublicationStates } from '../../../../constants';
import { convertContentStateToHTML, editorStateIsEmpty, convertToEditorState } from '../../../../utils/draftjs';
import ReplyToCommentButton from '../../common/replyToCommentButton';
import InnerBoxSubmit from './innerBoxSubmit';
import InnerBoxView from './innerBoxView';

export type Props = {
  extracts: Array<FictionExtractFragment>,
  postId: string,
  ideaId: string,
  submitting: boolean,
  contentLocale: string,
  lang?: string,
  selection?: ?Object,
  setCommentBoxDisplay: () => void,
  cancelSubmit: () => void,
  refetchPost: Function,
  toggleCommentsBox?: () => void,
  clearHighlights: () => void,
  position: { x: number, y: number },
  setPositionToExtract: FictionExtractFragment => void,
  userCanReply: boolean
};

type State = {
  extractIndex: number,
  body: EditorState,
  submitting: boolean,
  replying: boolean,
  selectionText: ?string,
  serializedAnnotatorRange: ?Object,
  editComment: boolean,
  editingPostId: string
};

const ACTIONS = {
  create: 'create', // create a new comment
  confirm: 'confirm' // confirm a comment
};

class DumbSideCommentBox extends React.Component<Props, State> {
  actions: {
    [x: string]: {
      buttons: {
        id: string,
        title: string,
        className: string,
        onClick: Function
      }[]
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    // Required when switching from displaying comment to submitting to force a refresh of component
    const { submitting, selection } = nextProps;
    if (prevState.submitting !== submitting) {
      const annotatorRange = selection && ARange.sniff(selection.getRangeAt(0));
      return {
        submitting: submitting,
        selectionText: selection && selection.toString(),
        serializedAnnotatorRange: annotatorRange.serialize(document, 'annotation')
      };
    }

    return null;
  }

  constructor(props: Props) {
    super(props);
    const { cancelSubmit, submitting, selection } = props;
    const annotatorRange = selection && ARange.sniff(selection.getRangeAt(0));

    this.state = {
      extractIndex: 0,
      body: EditorState.createEmpty(),
      submitting: submitting,
      replying: false,
      selectionText: selection && selection.toString(),
      serializedAnnotatorRange: annotatorRange && annotatorRange.serialize(document, 'annotation'),
      editComment: false,
      editingPostId: ''
    };

    // actions props
    this.actions = {
      [ACTIONS.create]: {
        buttons: [
          { id: 'cancel', title: 'debate.confirmDeletionButtonCancel', className: 'button-cancel', onClick: cancelSubmit },
          { id: 'validate', title: 'harvesting.submit', className: 'button-submit', onClick: this.submit }
        ]
      },
      [ACTIONS.confirm]: {
        buttons: [
          { id: 'reject', title: 'harvesting.reject', className: 'button-cancel', onClick: cancelSubmit },
          { id: 'confirm', title: 'harvesting.confirm', className: 'button-submit', onClick: this.submit }
        ]
      }
    };
  }

  componentDidMount() {
    const { submitting, extractIndex } = this.state;
    if (submitting) {
      this.wrapSelectedText();
    } else {
      const currentExtract = this.getCurrentExtract(extractIndex);
      if (currentExtract) {
        this.hightlightExtract(currentExtract);
      }
    }
  }

  componentDidUpdate(prevState: State) {
    const { submitting, extractIndex } = this.state;
    const { clearHighlights } = this.props;
    if (!submitting) {
      const currentExtract = this.getCurrentExtract(extractIndex);
      if (currentExtract) {
        this.hightlightExtract(currentExtract);
      }
    } else {
      // Needed when switching from display comments to submitting
      clearHighlights();
      // Wrap selection only when switching, not when body is updated
      if (prevState.submitting !== submitting) this.wrapSelectedText();
    }
  }

  wrapSelectedText = () => {
    const { selection } = this.props;
    if (selection && selection.toString().length > 0) {
      const selectionRange = selection.getRangeAt(0);
      const selectedText = selectionRange.extractContents();
      const span = document.createElement('span');
      span.classList.add('selection-highlight');
      span.appendChild(selectedText);
      selectionRange.insertNode(span);
    }
  };

  changeCurrentExtract = (step: ?number): void => {
    const { setPositionToExtract } = this.props;
    this.setState((prevState) => {
      const next = step ? prevState.extractIndex + step : 0;
      setPositionToExtract(this.getCurrentExtract(next));
      return {
        extractIndex: next
      };
    });
  };

  getCurrentExtract = (extractIndex: number) => {
    const { extracts } = this.props;
    return extracts && extracts.length > 0 ? extracts[extractIndex] : null;
  };

  getCurrentComment = (extract: FictionExtractFragment) => {
    const topComments = extract && extract.comments && extract.comments.filter(post => post.parentId === null);
    return (topComments && topComments[0]) || null;
  };

  getCurrentCommentReply = (extract: ?FictionExtractFragment, comment: ?ExtractComment) => {
    const replies =
      extract &&
      comment &&
      extract.comments.filter(post => post.parentId === comment.id && post.publicationState === PublicationStates.PUBLISHED);
    return (replies && replies[0]) || null;
  };

  submit = (): void => {
    const { ideaId, postId, contentLocale, lang, addPostExtract, createPost, setCommentBoxDisplay, refetchPost } = this.props;
    const { body, selectionText, serializedAnnotatorRange } = this.state;
    if (!selectionText || !serializedAnnotatorRange) {
      return;
    }

    const bodyIsEmpty = editorStateIsEmpty(body);
    if (bodyIsEmpty) {
      displayAlert('warning', I18n.t('debate.thread.fillBody'));
      return;
    }

    const variables = {
      contentLocale: contentLocale,
      postId: postId,
      body: selectionText,
      important: false,
      lang: lang,
      xpathStart: serializedAnnotatorRange.start,
      xpathEnd: serializedAnnotatorRange.end,
      offsetStart: serializedAnnotatorRange.startOffset,
      offsetEnd: serializedAnnotatorRange.endOffset
    };
    displayAlert('success', I18n.t('loading.wait'));
    addPostExtract({ variables: variables })
      .then((result) => {
        const postVars = {
          ideaId: ideaId,
          extractId: result.data.addPostExtract.extract.id,
          body: convertContentStateToHTML(body.getCurrentContent()),
          contentLocale: contentLocale
        };
        createPost({ variables: postVars }).then(() => {
          this.setState(
            {
              submitting: false,
              body: EditorState.createEmpty()
            },
            () => {
              setCommentBoxDisplay();
              window.getSelection().removeAllRanges();
              displayAlert('success', I18n.t('debate.brightMirror.sideComment.submitSuccessMsg'));
              refetchPost();
            }
          );
        });
      })
      .catch((error) => {
        displayAlert('danger', `${error}`);
      });
  };

  submitReply = (): void => {
    const { ideaId, contentLocale, createPost, refetchPost } = this.props;
    const { body, extractIndex } = this.state;
    const currentExtract = this.getCurrentExtract(extractIndex);
    const currentComment = this.getCurrentComment(currentExtract);

    const bodyIsEmpty = editorStateIsEmpty(body);
    if (bodyIsEmpty) {
      displayAlert('warning', I18n.t('debate.thread.fillBody'));
      return;
    }

    const postVars = {
      ideaId: ideaId,
      extractId: currentExtract.id,
      parentId: currentComment.id,
      body: convertContentStateToHTML(body.getCurrentContent()),
      contentLocale: contentLocale
    };
    createPost({ variables: postVars }).then(() => {
      this.setState(
        {
          replying: false,
          body: EditorState.createEmpty()
        },
        () => {
          window.getSelection().removeAllRanges();
          displayAlert('success', I18n.t('debate.brightMirror.sideComment.submitSuccessMsg'));
          refetchPost();
        }
      );
    });
  };

  editPost = () => {
    const { contentLocale, refetchPost, updatePost } = this.props;
    const { body, editingPostId } = this.state;

    const bodyIsEmpty = editorStateIsEmpty(body);
    if (bodyIsEmpty) {
      displayAlert('warning', I18n.t('debate.thread.fillBody'));
      return;
    }

    const postVars = {
      postId: editingPostId,
      body: convertContentStateToHTML(body.getCurrentContent()),
      contentLocale: contentLocale
    };
    updatePost({ variables: postVars }).then(() => {
      this.setState(
        {
          editComment: false,
          body: EditorState.createEmpty()
        },
        () => {
          displayAlert('success', I18n.t('debate.brightMirror.sideComment.submitSuccessMsg'));
          refetchPost();
        }
      );
    });
  };

  onDeleteConfirmation = (comment: ExtractComment, extractId: number) => {
    const { refetchPost, deletePost, deleteExtract } = this.props;
    if (comment.parentId) {
      // If it's a reply, we just delete the post
      const postVars = {
        postId: comment.id
      };
      deletePost({ variables: postVars }).then(() => {
        displayAlert('success', I18n.t('debate.brightMirror.sideComment.deleteSuccessMsg'));
        closeModal();
        refetchPost();
      });
    } else {
      // If it's a main comment, we delete the extract
      const extractVars = {
        extractId: extractId
      };
      deleteExtract({ variables: extractVars }).then(() => {
        displayAlert('success', I18n.t('debate.brightMirror.sideComment.deleteSuccessMsg'));
        closeModal();
        refetchPost();
      });
    }
  };

  deletePost = (comment: ExtractComment, extractId: number) => {
    const title = <Translate value="debate.confirmDeletionTitle" />;
    const body = <Translate value="debate.brightMirror.sideComment.confirmDeleteMsg" />;
    const footer = [
      <Button key="cancel" onClick={closeModal} className="button-cancel button-dark">
        <Translate value="debate.confirmDeletionButtonCancel" />
      </Button>,
      <Button key="delete" onClick={() => this.onDeleteConfirmation(comment, extractId)} className="button-submit button-dark">
        <Translate value="debate.confirmDeletionButtonDelete" />
      </Button>
    ];
    const includeFooter = true;
    return displayModal(title, body, includeFooter, footer);
  };

  hightlightExtract = (extract: FictionExtractFragment) => {
    const { clearHighlights } = this.props;
    clearHighlights();
    const extractElement = document.getElementById(extract.id);
    if (extractElement) extractElement.classList.add('active-extract');
  };

  updateBody = (newValue: EditorState) => {
    this.setState({
      body: newValue
    });
  };

  renderSubmitFooter = () => {
    const { submitting } = this.state;
    const actionId = submitting ? ACTIONS.create : ACTIONS.confirm;
    if (!actionId) return null;
    const action = this.actions[actionId];
    return (
      <div className="harvesting-box-footer">
        {action.buttons.map(button => (
          <Button key={button.id} className={`${button.className} button-dark`} onClick={button.onClick}>
            {I18n.t(button.title)}
          </Button>
        ))}
      </div>
    );
  };

  toggleReplying = () => {
    this.setState(state => ({ replying: !state.replying }));
  };

  setCommentEditMode = (postId: number, body: string) => {
    this.setState({ editComment: true, editingPostId: postId, body: convertToEditorState(body) });
  };

  cancelEditMode = () => {
    this.setState({ editComment: false });
  };

  renderActionFooter = () => {
    const { userCanReply } = this.props;
    const { extractIndex } = this.state;
    const currentExtract = this.getCurrentExtract(extractIndex);
    const currentComment = this.getCurrentComment(currentExtract);
    const hasReply = !!this.getCurrentCommentReply(currentExtract, currentComment);

    return (
      <div className="action-box-footer">
        {userCanReply && <ReplyToCommentButton onClickCallback={this.toggleReplying} disabled={hasReply} />}
      </div>
    );
  };

  getCommentView = () => {
    const { contentLocale, extracts, cancelSubmit } = this.props;
    const { submitting, extractIndex, body, editComment } = this.state;
    const currentExtract = this.getCurrentExtract(extractIndex);
    const currentComment = this.getCurrentComment(currentExtract);

    if (submitting) {
      return (
        <InnerBoxSubmit
          userId={getConnectedUserId()}
          userName={getConnectedUserName()}
          body={body}
          updateBody={this.updateBody}
          submit={this.submit}
          cancelSubmit={cancelSubmit}
        />
      );
    } else if (editComment) {
      return (
        <InnerBoxSubmit
          userId={getConnectedUserId()}
          userName={getConnectedUserName()}
          body={body}
          updateBody={this.updateBody}
          submit={this.editPost}
          cancelSubmit={this.cancelEditMode}
        />
      );
    }
    return (
      <InnerBoxView
        contentLocale={contentLocale}
        extractIndex={extractIndex}
        extracts={extracts}
        comment={currentComment}
        changeCurrentExtract={this.changeCurrentExtract}
        setEditMode={this.setCommentEditMode}
        deletePost={this.deletePost}
      />
    );
  };

  render() {
    const { contentLocale, extracts, cancelSubmit, position, toggleCommentsBox } = this.props;
    const { submitting, extractIndex, body, replying, editComment } = this.state;
    const currentExtract = this.getCurrentExtract(extractIndex);
    const currentComment = this.getCurrentComment(currentExtract);
    const currentReply = this.getCurrentCommentReply(currentExtract, currentComment);
    const hasReply = !!currentReply;

    if (!submitting && !currentComment) return null;

    const commentView = this.getCommentView();

    return (
      <div
        className={classnames('side-comment-box')}
        style={{
          top: `${position ? position.y : 0}px`,
          left: `${position ? position.x + COMMENT_BOX_OFFSET : 0}px`
        }}
      >
        <div className="arrow-left" />
        <div>
          <div className="harvesting-close-button" onClick={submitting ? cancelSubmit : toggleCommentsBox}>
            <span className="assembl-icon-cancel grey" />
          </div>
        </div>
        <div
          className={classnames('theme-box', 'harvesting-box', {
            'active-box': !submitting
          })}
        >
          {!submitting && (
            <div className="extracts-nb-msg">
              <Translate value="debate.brightMirror.sideComment.commentersParticipation" count={extracts.length} />
            </div>
          )}
          {commentView}
          {!submitting &&
            !editComment &&
            extracts &&
            extracts.length > 1 && (
              <div className="extracts-numbering">
                {extractIndex + 1}/{extracts.length}
              </div>
            )}
          {!submitting && this.renderActionFooter()}
          {replying && (
            <InnerBoxSubmit
              userId={getConnectedUserId()}
              userName={getConnectedUserName()}
              body={body}
              updateBody={this.updateBody}
              submit={this.submitReply}
              cancelSubmit={this.toggleReplying}
            />
          )}
          {!submitting &&
            hasReply && <InnerBoxView contentLocale={contentLocale} comment={currentReply} deletePost={this.deletePost} />}
        </div>
      </div>
    );
  }
}

export { DumbSideCommentBox };

const mapStateToProps = state => ({
  contentLocale: state.i18n.locale
});

export default compose(
  connect(mapStateToProps),
  graphql(addPostExtractMutation, {
    name: 'addPostExtract'
  }),
  graphql(createPostMutation, {
    name: 'createPost'
  }),
  graphql(updatePostMutation, {
    name: 'updatePost'
  }),
  graphql(deletePostMutation, {
    name: 'deletePost'
  }),
  graphql(deleteExtractMutation, {
    name: 'deleteExtract'
  }),
  manageErrorAndLoading({ displayLoader: true })
)(DumbSideCommentBox);