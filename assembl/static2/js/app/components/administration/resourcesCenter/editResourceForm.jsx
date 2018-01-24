// @flow
import classnames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { I18n, Translate } from 'react-redux-i18n';
import { Button, FormGroup, OverlayTrigger } from 'react-bootstrap';

import {
  deleteResource,
  updateResourceDocument,
  updateResourceEmbedCode,
  updateResourceImage,
  updateResourceText,
  updateResourceTitle
} from '../../../actions/adminActions/resourcesCenter';
import FileUploader from '../../common/fileUploader';
import FormControlWithLabel from '../../common/formControlWithLabel';
import { deleteResourceTooltip } from '../../common/tooltips';
import { getEntryValueForLocale } from '../../../utils/i18n';

type EditResourceFormProps = {
  documentFilename: string,
  documentUrl: string | File,
  embedCode: string,
  handleDocumentChange: Function,
  handleEmbedCodeChange: Function,
  handleImageChange: Function,
  handleTextChange: Function,
  handleTitleChange: Function,
  id: string,
  imgMimeType: string,
  imgUrl: string | File,
  markAsToDelete: Function,
  order: number,
  text: string,
  title: string
};

const EditResourceForm = ({
  documentFilename,
  documentUrl,
  embedCode,
  handleDocumentChange,
  handleEmbedCodeChange,
  handleImageChange,
  handleTextChange,
  handleTitleChange,
  id,
  imgMimeType,
  imgUrl,
  markAsToDelete,
  order,
  text,
  title
}: EditResourceFormProps) => {
  const divClassname = classnames('form-container', `edit-${id}`);
  const textLabel = I18n.t('administration.resourcesCenter.textLabel');
  const titleLabel = I18n.t('administration.resourcesCenter.titleLabel');
  const embedCodeLabel = I18n.t('administration.resourcesCenter.embedCodeLabel');
  const imageFieldName = `image-${id}`;
  const documentFieldName = `document-${id}`;
  return (
    <div className={divClassname}>
      <div className="title left">
        <Translate value="administration.resourcesCenter.editResourceFormTitle" num={order} />
      </div>
      <div className="pointer right">
        <OverlayTrigger placement="top" overlay={deleteResourceTooltip}>
          <Button onClick={markAsToDelete} className="admin-icons">
            <span className="assembl-icon-delete grey" />
          </Button>
        </OverlayTrigger>
      </div>
      <div className="clear" />
      <FormControlWithLabel label={titleLabel} onChange={handleTitleChange} required type="text" value={title} />
      <FormControlWithLabel label={textLabel} onChange={handleTextChange} required type="rich-text" value={text} />
      <FormControlWithLabel
        componentClass="textarea"
        label={embedCodeLabel}
        onChange={handleEmbedCodeChange}
        required={false}
        type="text"
        value={embedCode}
      />
      <FormGroup>
        <label htmlFor={imageFieldName}>
          <Translate value="administration.resourcesCenter.imageLabel" />
        </label>
        <FileUploader name={imageFieldName} fileOrUrl={imgUrl} handleChange={handleImageChange} mimeType={imgMimeType} />
      </FormGroup>
      <FormGroup>
        <label htmlFor={documentFieldName}>
          <Translate value="administration.resourcesCenter.documentLabel" />
        </label>
        <FileUploader
          name={documentFieldName}
          filename={documentFilename}
          fileOrUrl={documentUrl}
          handleChange={handleDocumentChange}
          withPreview={false}
        />
      </FormGroup>
      <div className="separator" />
    </div>
  );
};

const mapStateToProps = (state, { id, editLocale }) => {
  const resource = state.admin.resourcesCenter.resourcesById.get(id);
  const text = getEntryValueForLocale(resource.get('textEntries'), editLocale);
  return {
    documentFilename: resource.getIn(['doc', 'title']),
    documentUrl: resource.getIn(['doc', 'externalUrl']),
    embedCode: resource.get('embedCode'),
    imgMimeType: resource.getIn(['img', 'mimeType']),
    imgUrl: resource.getIn(['img', 'externalUrl']),
    locale: state.i18n.locale, // for I18n.t()
    order: resource.get('order'),
    text: text ? text.toJS() : null,
    title: getEntryValueForLocale(resource.get('titleEntries'), editLocale, '')
  };
};

const mapDispatchToProps = (dispatch, { id, editLocale }) => ({
  handleDocumentChange: value => dispatch(updateResourceDocument(id, value)),
  handleEmbedCodeChange: e => dispatch(updateResourceEmbedCode(id, e.target.value)),
  handleImageChange: (value) => {
    dispatch(updateResourceImage(id, value));
  },
  handleTextChange: value => dispatch(updateResourceText(id, editLocale, value)),
  handleTitleChange: e => dispatch(updateResourceTitle(id, editLocale, e.target.value)),
  markAsToDelete: () => dispatch(deleteResource(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(EditResourceForm);