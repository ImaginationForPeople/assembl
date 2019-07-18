// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import { Translate } from 'react-redux-i18n';
import { closeModal, displayModal } from '../../../utils/utilityManager';

type Props = {
  buttonTitleTranslationKey: string,
  createModule: Function,
  disabled?: boolean
};

const AddModuleButton = ({ buttonTitleTranslationKey, createModule, disabled }: Props) => {
  const displayConfirmationModal = () => {
    const body = <Translate value="administration.landingPage.manageModules.confirmationModal" />;
    const footer = [
      <Button key="cancel" id="cancel-deleting-button" onClick={closeModal} className="button-cancel button-dark">
        <Translate value="cancel" />
      </Button>,
      <Button
        key="add"
        id="confirm-add-tm-button"
        onClick={() => {
          createModule();
          closeModal();
        }}
        className="button-submit button-dark"
      >
        <Translate value="validate" />
      </Button>
    ];
    const includeFooter = true;
    return displayModal(null, body, includeFooter, footer);
  };
  return (
    <Button className="button-submit button-dark" onClick={disabled ? () => false : displayConfirmationModal} disabled={disabled}>
      <Translate value={`administration.landingPage.manageModules.${buttonTitleTranslationKey}`} />
    </Button>
  );
};

AddModuleButton.defaultProps = {
  disabled: false
};

export default AddModuleButton;