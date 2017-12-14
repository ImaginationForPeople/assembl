// @flow
import React from 'react';
import { Translate } from 'react-redux-i18n';

import { getDomElementOffset } from '../../../../utils/globalFunctions';
import Attachments from '../../../common/attachments';
import ProfileLine from '../../../common/profileLine';
import PostTranslate from '../../common/translations/postTranslate';
import PostActions from '../../common/postActions';
import AnswerForm from '../../thread/answerForm';
import Nuggets from '../../thread/nuggets';
import { transformLinksInHtml } from '../../../../utils/linkify';
import type { Props as PostProps } from './index';

type Props = PostProps & {
  body: string,
  subject: string,
  handleEditClick: Function,
  modifiedSubject: React.Element<*>
};

type State = {
  showAnswerForm: boolean
};

class PostView extends React.PureComponent<void, Props, State> {
  props: Props;

  state: State;

  answerTextarea: HTMLTextAreaElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      showAnswerForm: false
    };
  }

  handleAnswerClick = () => {
    this.setState({ showAnswerForm: true }, this.props.measureTreeHeight);
    setTimeout(() => {
      if (!this.answerTextarea) return;
      const txtareaOffset = getDomElementOffset(this.answerTextarea).top;
      window.scrollTo({ top: txtareaOffset - this.answerTextarea.clientHeight, left: 0, behavior: 'smooth' });
    }, 200);
  };

  hideAnswerForm = () => {
    this.setState({ showAnswerForm: false }, this.props.measureTreeHeight);
  };

  recomputeTreeHeightOnImagesLoad = (el: HTMLElement) => {
    // recompute the tree height after images are loaded
    if (el) {
      const images = el.getElementsByTagName('img');
      Array.from(images).forEach(img =>
        img.addEventListener('load', () => {
          this.props.measureTreeHeight(400);
        })
      );
    }
  };

  render() {
    const {
      bodyMimeType,
      indirectIdeaContentLinks,
      creator,
      modificationDate,
      sentimentCounts,
      mySentiment,
      attachments,
      extracts
    } = this.props.data.post;
    const {
      borderLeftColor,
      handleEditClick,
      contentLocale,
      id,
      lang,
      ideaId,
      refetchIdea,
      // creationDate is retrieved by IdeaWithPosts query, not PostQuery
      creationDate,
      fullLevel,
      numChildren,
      routerParams,
      debateData,
      nuggetsManager,
      rowIndex,
      originalLocale,
      identifier,
      body,
      subject,
      modifiedSubject,
      multiColumn
    } = this.props;
    const translate = contentLocale !== originalLocale;

    const relatedIdeasTitle = indirectIdeaContentLinks
      ? indirectIdeaContentLinks.map(link => link && link.idea && link.idea.title)
      : [];
    const completeLevelArray = fullLevel ? [rowIndex, ...fullLevel.split('-').map(string => Number(string))] : [rowIndex];

    const answerTextareaRef = (el: HTMLTextAreaElement) => {
      this.answerTextarea = el;
    };

    const boxStyle = {
      borderLeftColor: borderLeftColor
    };
    return (
      <div>
        <Nuggets extracts={extracts} postId={id} nuggetsManager={nuggetsManager} completeLevel={completeLevelArray.join('-')} />
        <div className="box" style={boxStyle}>
          <div className="post-row">
            <div className="post-left">
              {creator && (
                <ProfileLine
                  userId={creator.userId}
                  userName={creator && creator.displayName}
                  creationDate={creationDate}
                  locale={lang}
                  modified={modificationDate !== null}
                />
              )}
              {debateData.translationEnabled ? (
                <PostTranslate
                  contentLocale={contentLocale}
                  id={id}
                  lang={lang}
                  originalLocale={originalLocale}
                  translate={translate}
                />
              ) : null}
              <h3 className="dark-title-3">{modifiedSubject}</h3>
              <div
                className={`body ${bodyMimeType === 'text/plain' ? 'pre-wrap' : ''}`}
                dangerouslySetInnerHTML={{ __html: transformLinksInHtml(body) }}
                ref={this.recomputeTreeHeightOnImagesLoad}
              />

              <Attachments attachments={attachments} />

              {!multiColumn &&
                relatedIdeasTitle.length && (
                  <div className="link-idea">
                    <div className="label">
                      <Translate value="debate.thread.linkIdea" />
                    </div>
                    <div className="badges">
                      {relatedIdeasTitle.map((title, index) => (
                        <span className="badge" key={index}>
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {!multiColumn && (
                <div className="answers annotation">
                  <Translate value="debate.thread.numberOfResponses" count={numChildren} />
                </div>
              )}
            </div>
            <div className="post-right">
              <PostActions
                creatorUserId={creator && creator.userId}
                postId={id}
                handleEditClick={handleEditClick}
                sentimentCounts={sentimentCounts}
                mySentiment={mySentiment}
                numChildren={numChildren}
                routerParams={routerParams}
                debateData={debateData}
                postSubject={subject.replace('Re: ', '')}
                identifier={identifier}
              />
            </div>
          </div>
        </div>
        {!multiColumn && (
          <div className={this.state.showAnswerForm ? 'answer-form' : 'collapsed-answer-form'}>
            <AnswerForm
              parentId={id}
              ideaId={ideaId}
              refetchIdea={refetchIdea}
              textareaRef={answerTextareaRef}
              hideAnswerForm={this.hideAnswerForm}
              handleAnswerClick={this.handleAnswerClick}
              identifier={identifier}
            />
          </div>
        )}
      </div>
    );
  }
}

export default PostView;