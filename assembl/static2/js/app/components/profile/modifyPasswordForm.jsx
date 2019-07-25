// @flow
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Translate, I18n } from 'react-redux-i18n';
import { Button } from 'react-bootstrap';

import { displayAlert } from '../../utils/utilityManager';
import UpdateUserMutation from '../../graphql/mutations/updateUser.graphql';
import FormControlWithLabel from '../common/formControlWithLabel';

type Props = {
  id: string,
  updateUser: Function
};

type State = {
  disabled: boolean,
  oldPassword: string,
  newPassword: string,
  newPassword2: string
};

const isEmpty = value => value.length === 0;

class ModifyPasswordForm extends React.Component<Props, State> {
  state = {
    disabled: false,
    oldPassword: '',
    newPassword: '',
    newPassword2: ''
  };

  handleOldPasswordChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState((prevState) => {
      const disabled = isEmpty(value) || isEmpty(prevState.newPassword) || isEmpty(prevState.newPassword2);
      return {
        oldPassword: value,
        disabled: disabled
      };
    });
  };

  handleNewPasswordChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState((prevState) => {
      const disabled = isEmpty(prevState.oldPassword) || isEmpty(prevState.newPassword2) || isEmpty(value);
      return {
        newPassword: value,
        disabled: disabled
      };
    });
  };

  handleNewPassword2Change = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState((prevState) => {
      const disabled = isEmpty(prevState.oldPassword) || isEmpty(prevState.newPassword) || isEmpty(value);
      return {
        newPassword2: value,
        disabled: disabled
      };
    });
  };

  handleSaveClick = () => {
    const { updateUser, id } = this.props;
    const variables = {
      id: id,
      oldPassword: this.state.oldPassword,
      newPassword: this.state.newPassword,
      newPassword2: this.state.newPassword2
    };
    const changePassword = () =>
      updateUser({ variables: variables })
        .then(() => {
          displayAlert('success', I18n.t('profile.passwordModifiedSuccess'));
          this.resetFields();
        })
        .catch((error) => {
          let message = error.message.replace('GraphQL error: ', '');
          if (message.startsWith('00')) {
            const code = message.slice(2, 3);
            message = I18n.t(`profile.updateUser.errorMessage.${code}`);
          }
          displayAlert('danger', message, false, 10000);
          this.setState({ disabled: false });
        });
    this.setState({ disabled: true }, changePassword);
  };

  resetFields = () => {
    this.setState({
      oldPassword: '',
      newPassword: '',
      newPassword2: ''
    });
  };

  render() {
    const oldPasswordLabel = I18n.t('profile.oldPassword');
    const newPasswordLabel = I18n.t('profile.newPassword');
    const newPassword2Label = I18n.t('profile.newPassword2');
    const { oldPassword, newPassword, newPassword2 } = this.state;
    return (
      <div>
        <FormControlWithLabel label={oldPasswordLabel} onChange={this.handleOldPasswordChange} type="password" required value={oldPassword} />
        <FormControlWithLabel label={newPasswordLabel} onChange={this.handleNewPasswordChange} type="password" required value={newPassword} />
        <FormControlWithLabel label={newPassword2Label} onChange={this.handleNewPassword2Change} type="password" required value={newPassword2} />
        <div>
          <span className="warning">
            <Translate value="login.oldPasswordWarning" />
          </span>
        </div>
        <Button disabled={this.state.disabled} id="save-new-password" className="button-submit button-dark margin-l" onClick={this.handleSaveClick}>
          <Translate value="profile.save" />
        </Button>
      </div>
    );
  }
}

export default compose(graphql(UpdateUserMutation, { name: 'updateUser' }))(ModifyPasswordForm);