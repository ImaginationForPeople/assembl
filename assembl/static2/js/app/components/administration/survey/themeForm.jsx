import React from 'react';
import { connect } from 'react-redux';
import { Translate, I18n } from 'react-redux-i18n';
import { compose, graphql, withApollo } from 'react-apollo';
import { Button, FormGroup, FormControl } from 'react-bootstrap';

import { listThematicsToDelete, listPreviewsToDisplay } from '../../../actions/adminActions';
import ImageUploader from '../../common/imageUploader';
import withLoadingIndicator from '../../common/withLoadingIndicator';
import { ThematicsQuery, ThematicQuery } from '../../../graphql';

export const updateTitle = (client, id, selectedLocale, titleEntryIndex, value) => {
  const data = client.readQuery({ query: ThematicQuery, variables: { id: id } });
  const modifiedEntry = { localeCode: selectedLocale, value: value, __typename: 'LangStringEntry' };
  if (titleEntryIndex === -1) {
    data.thematic.titleEntries.push(modifiedEntry);
  } else {
    data.thematic.titleEntries[titleEntryIndex] = modifiedEntry;
  }
  client.writeQuery({ query: ThematicQuery, variables: { id: id }, data: data });
};

export const updateImage = (client, id, file) => {
  const data = client.readQuery({ query: ThematicQuery, variables: { id: id } });
  data.thematic.imgUrl = file;
  client.writeQuery({
    data: data,
    query: ThematicQuery,
    variables: { id: id }
  });
};

export const getPreviewToDisplay = (previewsToDisplay, imgUrl, thematicId) => {
  let previewUrl = imgUrl;
  if (previewsToDisplay.length > 0) {
    previewsToDisplay.forEach((preview) => {
      if (preview.thematicId === thematicId) {
        previewUrl = preview.imgUrl;
      }
    });
  }
  return previewUrl;
};

export const DumbThemeCreationForm = ({ client, data, id, index, selectedLocale, thematicsToDelete, addThematicsToDelete, previewsToDisplay, addPreviewsToDisplay }) => {
  const { thematic: { imgUrl, titleEntries } } = data;

  const trsl = I18n.t('administration.ph.title');
  const ph = `${trsl} ${selectedLocale.toUpperCase()}`;
  const num = (Number(index) + 1).toString();
  const titleEntry = titleEntries.find((entry) => {
    return entry.localeCode === selectedLocale;
  });
  const titleEntryIndex = titleEntries.indexOf(titleEntry);
  const title = titleEntry ? titleEntry.value : '';
  const previewUrl = getPreviewToDisplay(previewsToDisplay, imgUrl, id);
  const remove = (thematicId) => {
    thematicsToDelete.push(thematicId);
    addThematicsToDelete(thematicsToDelete);
    const thematicsData = client.readQuery({ query: ThematicsQuery });
    thematicsData.thematics.forEach((thematic, index2) => {
      if (thematic.id === thematicId) {
        thematicsData.thematics.splice(index2, 1);
      }
    });
    return client.writeQuery({
      query: ThematicsQuery,
      data: thematicsData
    });
  };
  const handleImageChange = (file, url) => {
    previewsToDisplay.push({ thematicId: id, imgUrl: url });
    addPreviewsToDisplay(previewsToDisplay);
    updateImage(client, id, file);
  };
  const handleTitleChange = (e) => {
    return updateTitle(client, id, selectedLocale, titleEntryIndex, e.target.value);
  };
  return (
    <div className="form-container">
      <div className="title">
        <Translate value="administration.themeNum" index={num} />
      </div>
      <FormGroup>
        <FormControl type="text" placeholder={ph} value={title} onChange={handleTitleChange} />
      </FormGroup>
      <FormGroup>
        <ImageUploader imgUrl={previewUrl} handleImageChange={handleImageChange} />
      </FormGroup>
      <div className="pointer right">
        <Button
          onClick={() => {
            remove(id);
          }}
        >
          <span className="assembl-icon-delete grey" />
        </Button>
      </div>
      <div className="separator" />
    </div>
  );
};

DumbThemeCreationForm.defaultProps = {
  title: ''
};

const mapStateToProps = (state) => {
  return {
    thematicsToDelete: state.admin.thematicsToDelete,
    previewsToDisplay: state.admin.previewsToDisplay
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addThematicsToDelete: (thematicsToDelete) => {
      dispatch(listThematicsToDelete(thematicsToDelete));
    },
    addPreviewsToDisplay: (previewsToDisplay) => {
      dispatch(listPreviewsToDisplay(previewsToDisplay));
    }
  };
};

export default compose(connect(mapStateToProps, mapDispatchToProps), graphql(ThematicQuery), withLoadingIndicator, withApollo)(DumbThemeCreationForm);