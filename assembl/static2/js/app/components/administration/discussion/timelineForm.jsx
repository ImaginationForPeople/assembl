// @flow
import React from 'react';
import { I18n, Translate } from 'react-redux-i18n';
import { OverlayTrigger } from 'react-bootstrap';
import { connect } from 'react-redux';

import { addPhaseTooltip, phaseTooltip } from '../../common/tooltips';
import TabbedContent from '../../common/tabbedContent';
import SectionTitle from '../sectionTitle';
import PhaseForm from './phaseForm';
import ManageTimeline from '../landingPage/manageTimeline';
import { createRandomId } from '../../../utils/globalFunctions';
import { createPhase } from '../../../actions/adminActions/timeline';
import PhaseTitleForm from './phaseTitleForm';

type TimelineFormProps = {
  editLocale: string,
  phases: Array<string>,
  handleCreatePhase: Function
};

type TimelineFormState = {
  selectedPhaseId: string
};

export class DumbTimelineForm extends React.Component<TimelineFormProps, TimelineFormState> {
  componentDidMount() {
    const { length } = this.props.phases;
    if (length === 0) {
      this.props.handleCreatePhase(1);
    }
  }

  getPhaseNumberById = (id: string) => this.props.phases.indexOf(id) + 1;

  render() {
    const { editLocale, phases, handleCreatePhase } = this.props;
    return (
      <div className="admin-box timeline-admin">
        <SectionTitle
          title={I18n.t('administration.discussion.5')}
          annotation={I18n.t('administration.timelineAdmin.annotation')}
        />
        <Translate value="administration.timelineAdmin.instruction1" className="admin-instruction" />
        <div className="admin-content">
          <div className="form-container">
            <form>
              {phases &&
                phases.map((id, index) => (
                  <PhaseTitleForm
                    key={`phase-title-form-${id}`}
                    id={id}
                    editLocale={editLocale}
                    phaseIndex={index + 1}
                    numberOfPhases={phases.length}
                  />
                ))}
              <OverlayTrigger placement="top" overlay={addPhaseTooltip}>
                <div
                  onClick={() => {
                    handleCreatePhase(phases.length);
                  }}
                  className="plus margin-s"
                >
                  +
                </div>
              </OverlayTrigger>
            </form>
          </div>
        </div>
        <Translate value="administration.timelineAdmin.instruction2" className="admin-instruction" />

        {phases && (
          <TabbedContent
            type="phase"
            divClassName="admin-content"
            tabTitleMsgId="administration.timelineAdmin.phase"
            tabs={phases.map((id, index) => {
              const tabTitle = `${I18n.t('administration.timelineAdmin.phase', { count: index + 1 })}`;
              return {
                id: id,
                title: tabTitle
              };
            })}
            renderTooltip={phaseTooltip}
            renderBody={tab => (
              <PhaseForm
                key={`phase-form-${tab.id}-${editLocale}`}
                phaseId={tab.id}
                phaseNumber={this.getPhaseNumberById(tab.id)}
              />
            )}
          />
        )}
        <ManageTimeline />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { phasesById } = state.admin.timeline;
  const filteredPhases = phasesById.sortBy(phase => phase.get('order')).filter(phase => !phase.get('_toDelete'));
  const filteredPhasesId = filteredPhases.keySeq().toJS();
  return {
    editLocale: state.admin.editLocale,
    lang: state.i18n.locale,
    phases: filteredPhasesId
  };
};

const mapDispatchToProps = dispatch => ({
  handleCreatePhase: (nextOrder) => {
    const newId = createRandomId();
    return dispatch(createPhase(newId, nextOrder));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(DumbTimelineForm);