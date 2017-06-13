import React from 'react';
import { connect } from 'react-redux';
import { gql, graphql, withApollo, compose } from 'react-apollo';
import { Button } from 'react-bootstrap';
import { Translate, I18n } from 'react-redux-i18n';
import { displayAlert } from '../../utils/utilityManager';

const GetThematics = gql`
{
  thematics(identifier:"survey") {
    id,
    titleEntries {
      localeCode,
      value
    },
    imgUrl,
    video {
      titleEntries {
        localeCode,
        value
      },
      descriptionEntries {
        localeCode,
        value
      },
      htmlCode
    },
    questions {
      titleEntries {
        localeCode,
        value
      }
    }
  }
}
`;

const createLanguageEntries = (titles) => {
  return titles.map((title) => {
    return { value: title.value, localeCode: title.localeCode };
  });
};

const createQuestionEntries = (questions) => {
  const questionsArray = [];
  questions.forEach((question) => {
    const titlesArray = [];
    question.titleEntries.forEach((title) => {
      titlesArray.push({
        value: title.value,
        localeCode: title.localeCode
      });
    });
    questionsArray.push({ titleEntries: titlesArray });
  });
  return questionsArray;
};

const createVideoEntries = (v) => {
  const video = {
    titleEntries: v.titleEntries !== null ? createLanguageEntries(v.titleEntries) : [],
    descriptionEntries: v.descriptionEntries !== null ? createLanguageEntries(v.descriptionEntries) : [],
    htmlCode: v.htmlCode !== null ? v.htmlCode : ''
  };
  return video;
};

const runSerial = (promises) => {
  let result = Promise.resolve();
  promises.forEach((promise) => {
    result = result.then(() => { return promise; });
  });
  return result;
};

const SaveButton = ({ client, createThematic, updateThematic, deleteThematic, thematicsToDelete }) => {
  const saveAction = () => {
    const thematicsData = client.readQuery({ query: GetThematics });
    const promisesArray = [];
    let payload = {};
    thematicsData.thematics.forEach((t) => {
      // To create a thematic, get if its ID is a negative number
      if (t.id < 0) {
        payload = {
          variables: {
            identifier: 'survey',
            titleEntries: createLanguageEntries(t.titleEntries),
            image: t.imgUrl,
            video: t.video.length === 0 ? null : createVideoEntries(t.video),
            questions: createQuestionEntries(t.questions)
          }
        };
        const p1 = createThematic(payload);
        promisesArray.push(p1);
      } else {
        // Update a thematic
        payload = {
          variables: {
            id: t.id,
            identifier: 'survey',
            titleEntries: createLanguageEntries(t.titleEntries),
            video: createVideoEntries(t.video),
            image: typeof t.imgUrl === 'string' ? null : t.imgUrl,
            questions: createQuestionEntries(t.questions)
          }
        };
        const p2 = updateThematic(payload);
        promisesArray.push(p2);
      }
    });
    // Delete a thematic
    if (thematicsToDelete.length > 0) {
      thematicsToDelete.forEach((id) => {
        if (isNaN(id)) {
          payload = {
            variables: {
              thematicId: id
            }
          };
          const p3 = deleteThematic(payload);
          promisesArray.push(p3);
        }
      });
    }
    runSerial(promisesArray).then(() => {
      displayAlert('success', I18n.t('administration.successThemeCreation'));
    }).catch((error) => {
      displayAlert('danger', `${error}`);
    });
  };
  return (
    <Button className="button-submit button-dark right" onClick={saveAction}>
      <Translate value="administration.saveThemes" />
    </Button>
  );
};

const createThematic = gql`
  mutation createThematic($identifier: String!, $image: String, $titleEntries: [LangStringEntryInput]!, $questions: [QuestionInput], $video: VideoInput) {
    createThematic(identifier: $identifier, image: $image, titleEntries: $titleEntries, questions: $questions, video: $video) {
      thematic {
        title,
        imgUrl,
        video {
          title,
          description,
          htmlCode
        },
        questions {
          title
        }
      }
    }
  }
`;

const updateThematic = gql`
  mutation updateThematic($id:ID!, $identifier: String!, $image: String, $titleEntries: [LangStringEntryInput]!, $questions: [QuestionInput], $video: VideoInput) {
    updateThematic(id:$id, identifier: $identifier, image: $image, titleEntries: $titleEntries, questions: $questions, video: $video) {
      thematic {
        title,
        imgUrl,
        video {
          title,
          description,
          htmlCode
        },
        questions {
          title
        }
      }
    }
  }
`;

const deleteThematic = gql`
  mutation deleteThematic($thematicId: ID!) {
    deleteThematic(thematicId: $thematicId) {
      success
    }
  }
`;

const SaveButtonWithMutations = compose(
  graphql(createThematic, {
    name: 'createThematic'
  }),
  graphql(updateThematic, {
    name: 'updateThematic'
  }),
  graphql(deleteThematic, {
    name: 'deleteThematic'
  })
)(SaveButton);

const mapStateToProps = (state) => {
  return {
    thematicsToDelete: state.admin.thematicsToDelete
  };
};

export default connect(mapStateToProps)(withApollo(SaveButtonWithMutations));