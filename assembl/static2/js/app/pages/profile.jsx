// @flow
import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import { Translate, I18n } from 'react-redux-i18n';
import { Grid, Col, Button } from 'react-bootstrap';
import FormControlWithLabel from '../components/common/formControlWithLabel';
import ModifyPasswordForm from '../components/common/modifyPasswordForm';
import { get, getContextual } from '../utils/routeMap';
import { displayAlert } from '../utils/utilityManager';
import withLoadingIndicator from '../components/common/withLoadingIndicator';
import UserQuery from '../graphql/userQuery.graphql';
import UpdateUserMutation from '../graphql/mutations/updateUser.graphql';

type ProfileProps = {
  username: string,
  name: string,
  email: string,
  connectedUserId: string,
  creationDate: ?string,
  lang: string,
  slug: string,
  userId: string,
  id: string,
  params: Object,
  location: Object,
  updateUser: Function
};

type ProfileState = {
  username: string,
  name: string,
  email: string,
  passwordEditionOpen: boolean
};

class Profile extends React.PureComponent<*, ProfileProps, ProfileState> {
  props: ProfileProps;

  state: ProfileState;

  defaultProps: {
    creationDate: null
  };

  constructor(props) {
    super(props);
    const { username, name, email } = this.props;
    this.state = {
      username: username,
      name: name,
      email: email,
      passwordEditionOpen: false
    };
  }

  componentWillMount() {
    const { connectedUserId, slug } = this.props;
    const { userId } = this.props.params;
    const { location } = this.props;
    if (!connectedUserId) {
      browserHistory.push(`${getContextual('login', { slug: slug })}?next=${location.pathname}`);
    } else if (connectedUserId !== userId) {
      browserHistory.push(get('home', { slug: slug }));
    }
  }

  handleUsernameChange = (e) => {
    this.setState({ username: e.target.value });
  };

  handleFullnameChange = (e) => {
    this.setState({ name: e.target.value });
  };

  handleEmailChange = (e) => {
    this.setState({ email: e.target.value });
  };

  handleSaveClick = () => {
    const { updateUser, id } = this.props;
    const { name, username } = this.state;
    const variables = {
      id: id,
      name: name,
      username: username
    };
    updateUser({ variables: variables })
      .then(() => {
        displayAlert('success', I18n.t('profile.saveSuccess'));
      })
      .catch((error) => {
        displayAlert('danger', error.message.replace('GraphQL error: ', ''));
      });
  };

  handlePasswordClick = () => {
    this.setState({ passwordEditionOpen: true });
  };

  render() {
    const { username, name, email } = this.state;
    const { creationDate, lang, id } = this.props;
    const fullNameLabel = I18n.t('profile.fullname');
    const emailLabel = I18n.t('profile.email');
    return (
      <div className="profile background-dark-grey">
        <div className="content-section">
          <Grid fluid>
            <div className="max-container">
              <Col xs={12} sm={3}>
                <div className="center">
                  <span className="assembl-icon-profil" />
                </div>
                <h2 className="dark-title-2 capitalized center">{this.props.name}</h2>
                {creationDate && (
                  <div className={`center member-since lang-${lang}`}>
                    <Translate value="profile.memberSince" date={I18n.l(creationDate, { dateFormat: 'date.format2' })} />
                  </div>
                )}
              </Col>
              <Col xs={12} sm={9}>
                <div className="border-left">
                  <h1 className="dark-title-1">
                    <Translate value="profile.panelTitle" />
                  </h1>
                  <h2 className="dark-title-2 margin-l">
                    <Translate value="profile.personalInfos" />
                  </h2>
                  <div className="profile-form center">
                    <FormControlWithLabel
                      label={I18n.t('profile.userName')}
                      onChange={this.handleUsernameChange}
                      type="text"
                      value={username}
                    />
                    <FormControlWithLabel
                      label={`${fullNameLabel}*`}
                      onChange={this.handleFullnameChange}
                      type="text"
                      value={name}
                      required
                    />
                    <FormControlWithLabel
                      label={`${emailLabel}*`}
                      onChange={this.handleEmailChange}
                      type="email"
                      value={email}
                      disabled
                    />
                    <Button disabled={!name} className="button-submit button-dark margin-l" onClick={this.handleSaveClick}>
                      <Translate value="profile.save" />
                    </Button>
                  </div>
                  <h2 className="dark-title-2 margin-l">
                    <Translate value="profile.password" />
                  </h2>
                  <div className="profile-form center">
                    {this.state.passwordEditionOpen ? (
                      <ModifyPasswordForm id={id} successCallback={() => this.setState({ passwordEditionOpen: false })} />
                    ) : (
                      <Button className="button-submit button-dark" onClick={this.handlePasswordClick}>
                        <Translate value="profile.changePassword" />
                      </Button>
                    )}
                  </div>
                </div>
              </Col>
            </div>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ context, debate, i18n }, ownProps) => {
  const userId = ownProps.params.userId;
  return {
    slug: debate.debateData.slug,
    connectedUserId: context.connectedUserId,
    id: btoa(`AgentProfile:${userId}`),
    lang: i18n.locale
  };
};

export default compose(
  connect(mapStateToProps),
  graphql(UserQuery, {
    props: ({ data }) => {
      if (data.loading) {
        return { loading: true };
      }
      if (data.error) {
        // this is needed to properly redirect to home page in case of error
        return { error: data.error };
      }
      return {
        username: data.user.username,
        name: data.user.name,
        email: data.user.email,
        creationDate: data.user.creationDate
      };
    }
  }),
  graphql(UpdateUserMutation, { name: 'updateUser' }),
  withLoadingIndicator()
)(Profile);