// @flow
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { connect } from 'react-redux';
import { Translate, I18n } from 'react-redux-i18n';
import { updateStartDate, updateEndDate } from '../../../actions/adminActions/timeline';

type PhaseFormProps = {
  phaseNumber: number,
  start: moment$Moment,
  end: moment$Moment,
  handleStartDateChange: Function,
  handleEndDateChange: Function,
  locale: string,
  hasConflictingDates: boolean
};

export const DumbPhaseForm = ({
  phaseNumber,
  handleStartDateChange,
  handleEndDateChange,
  start,
  end,
  hasConflictingDates,
  locale
}: PhaseFormProps) => {
  const startDatePickerPlaceholder = I18n.t('administration.timelineAdmin.selectStart', { count: phaseNumber });
  const endDatePickerPlaceholder = I18n.t('administration.timelineAdmin.selectEnd', { count: phaseNumber });

  return (
    <div className="phase-form">
      <div className="date-picker-field">
        <div className="date-picker-type">
          <Translate value="search.datefilter.from" />
        </div>
        <label htmlFor="start-datepicker" className="datepicker-label">
          <DatePicker
            placeholderText={startDatePickerPlaceholder}
            selected={start}
            id="start-datepicker"
            onChange={handleStartDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            dateFormat="LLL"
            locale={locale}
            shouldCloseOnSelect
            className={hasConflictingDates ? 'warning' : ''}
          />
          <div className="icon-schedule-container">
            <span className="assembl-icon-schedule grey" />
          </div>
        </label>
        {hasConflictingDates && (
          <div className="warning-label">
            <Translate value="administration.timelineAdmin.warningLabel" />
          </div>
        )}
      </div>
      <div className="date-picker-field">
        <div className="date-picker-type">
          <Translate value="search.datefilter.to" />
        </div>
        <label htmlFor="end-datepicker" className="datepicker-label">
          <DatePicker
            placeholderText={endDatePickerPlaceholder}
            id="end-datepicker"
            selected={end}
            onChange={handleEndDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            dateFormat="LLL"
            locale={locale}
            shouldCloseOnSelect
            className={hasConflictingDates ? 'warning' : ''}
          />
          <div className="icon-schedule-container">
            <span className="assembl-icon-schedule grey" />
          </div>
        </label>
        {hasConflictingDates && (
          <div className="warning-label">
            <Translate value="administration.timelineAdmin.warningLabel" />
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state, { phaseId }) => {
  const phase = state.admin.timeline.phasesById.get(phaseId);
  return {
    identifier: phase && phase.get('identifier'),
    start: phase ? phase.get('start') : null,
    end: phase ? phase.get('end') : null,
    hasConflictingDates: phase ? phase.get('hasConflictingDates') : null,
    locale: state.i18n.locale
  };
};

const mapDispatchToProps = (dispatch, { phaseId }) => ({
  handleStartDateChange: date => dispatch(updateStartDate(phaseId, date)),
  handleEndDateChange: date => dispatch(updateEndDate(phaseId, date))
});

export default connect(mapStateToProps, mapDispatchToProps)(DumbPhaseForm);