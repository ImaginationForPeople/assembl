// @flow
import React from 'react';
import { connect } from 'react-redux';
import { type ApolloClient, graphql, compose, withApollo } from 'react-apollo';
import { I18n } from 'react-redux-i18n';
import { Field } from 'react-final-form';
import setFieldTouched from 'final-form-set-field-touched';
import SectionTitle from '../../../administration/sectionTitle';
import Helper from '../../../common/helper';
import { load, postLoadFormat } from './load';
import { save, createMutationsPromises } from './save';
import LoadSaveReinitializeForm from '../../../form/LoadSaveReinitializeForm';
import FileUploaderFieldAdapter from '../../../form/fileUploaderFieldAdapter';
import DatePickerFieldAdapter from '../../../form/datePickerFieldAdapter';
import MultilingualTextFieldAdapter from '../../../form/multilingualTextFieldAdapter';
import MultilingualRichTextFieldAdapter from '../../../form/multilingualRichTextFieldAdapter';
import AdminForm from '../../../form/adminForm';
import Loader from '../../../common/loader';
import { validStartDate, validEndDate, validateDatePicker } from './validate';
import DiscussionQuery from '../../../../graphql/DiscussionQuery.graphql';
import { convertISO8601StringToDate } from '../../../../utils/globalFunctions';
import manageErrorAndLoading from '../../../common/manageErrorAndLoading';

type Props = {
  client: ApolloClient,
  editLocale: string,
  data: {
    discussion: {
      startDate: string,
      endDate: string
    }
  }
};

type State = {
  startDate: moment$Moment | null,
  endDate: moment$Moment | null,
  startDateConflict: boolean,
  endDateConflict: boolean
};

const loading = <Loader />;

export class DumbCustomizeHeader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { startDate, endDate } = props.data.discussion;
    this.state = {
      startDate: startDate ? convertISO8601StringToDate(startDate) : null,
      endDate: endDate ? convertISO8601StringToDate(endDate) : null,
      startDateConflict: false,
      endDateConflict: false
    };
  }

  onStartChange = (e: moment$Moment) => {
    const { endDate } = this.state;
    let startDateConflict = false;
    if (!validStartDate(e, endDate)) {
      startDateConflict = true;
    } else {
      startDateConflict = false;
    }
    this.setState(() => ({
      startDate: e,
      startDateConflict: startDateConflict
    }));
  };

  onEndChange = (e: moment$Moment) => {
    const { startDate } = this.state;
    let endDateConflict = false;
    if (!validEndDate(startDate, e)) {
      endDateConflict = true;
    } else {
      endDateConflict = false;
    }
    this.setState(() => ({
      endDate: e,
      endDateConflict: endDateConflict
    }));
  };

  render() {
    const { client, editLocale } = this.props;
    const { startDateConflict, endDateConflict } = this.state;
    return (
      <div className="admin-box">
        <SectionTitle
          title={I18n.t('administration.landingPage.header.title')}
          annotation={I18n.t('administration.annotation')}
        />
        <LoadSaveReinitializeForm
          load={fetchPolicy => load(client, editLocale, fetchPolicy)}
          loading={loading}
          postLoadFormat={postLoadFormat}
          createMutationsPromises={createMutationsPromises(client)}
          save={save}
          mutators={{ setFieldTouched: setFieldTouched }}
          validate={validateDatePicker}
          render={({ handleSubmit, pristine, submitting, form }) => (
            <div className="admin-content">
              <AdminForm
                handleSubmit={handleSubmit}
                pristine={pristine || startDateConflict || endDateConflict}
                submitting={submitting}
              >
                <div className="form-container">
                  <Helper
                    classname="admin-paragraph"
                    label={I18n.t('administration.landingPage.header.helper')}
                    helperUrl={'/static2/img/helpers/landing_page_admin/header.png'}
                    helperText={I18n.t('administration.helpers.landingPage.header')}
                  />
                  <Field
                    editLocale={editLocale}
                    name="headerTitle"
                    component={MultilingualTextFieldAdapter}
                    label={I18n.t('administration.landingPage.header.titleLabel')}
                    required
                  />
                  <Field
                    editLocale={editLocale}
                    withAttachmentButton={false}
                    name="headerSubtitle"
                    component={MultilingualRichTextFieldAdapter}
                    label={I18n.t('administration.landingPage.header.subtitleLabel')}
                    required
                  />
                  <Field
                    editLocale={editLocale}
                    name="headerButtonLabel"
                    component={MultilingualTextFieldAdapter}
                    label={I18n.t('administration.landingPage.header.buttonLabel')}
                    required={false}
                  />
                  <Field
                    name="headerImage"
                    component={FileUploaderFieldAdapter}
                    label={I18n.t('administration.landingPage.header.headerImage')}
                  />
                  <div className="flex">
                    <Field
                      name="headerLogoImage"
                      component={FileUploaderFieldAdapter}
                      label={I18n.t('administration.landingPage.header.logoDescription')}
                    />
                    {/* Passing an empty class to the popOver cancels the default styling */}
                    <Helper helperText={I18n.t('administration.landingPage.header.logoHelper')} popOverClass=" " />
                  </div>
                  <div className="section-description">{I18n.t('administration.landingPage.header.dateDescription')}</div>
                  <Field
                    name="headerStartDate"
                    component={DatePickerFieldAdapter}
                    picker={{ pickerType: I18n.t('administration.landingPage.header.startDate') }}
                    editLocale={editLocale}
                    placeHolder={I18n.t('administration.landingPage.header.timePlaceholder')}
                    showTime={false}
                    hasConflictingDate={this.state.startDateConflict}
                    onDateChange={this.onStartChange}
                    form={form}
                    dateFormat="LL"
                  />
                  <Field
                    name="headerEndDate"
                    component={DatePickerFieldAdapter}
                    picker={{ pickerType: I18n.t('administration.landingPage.header.endDate') }}
                    editLocale={editLocale}
                    placeHolder={I18n.t('administration.landingPage.header.timePlaceholder')}
                    showTime={false}
                    hasConflictingDate={this.state.endDateConflict}
                    onDateChange={this.onEndChange}
                    form={form}
                    dateFormat="LL"
                  />
                </div>
              </AdminForm>
            </div>
          )}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ admin: { editLocale } }) => ({
  editLocale: editLocale
});

export default compose(
  connect(mapStateToProps),
  graphql(DiscussionQuery, {
    options: ({ editLocale }) => ({
      variables: {
        lang: editLocale,
        nextView: null
      }
    })
  }),
  manageErrorAndLoading({ displayLoader: true }),
  withApollo
)(DumbCustomizeHeader);