import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import { Row, Col } from 'react-bootstrap';
import { get } from '../../../utils/routeMap';

import SliderSettings from '../navigation/sliderSettings';
import ThematicPreview from './thematicPreview';

class ThematicList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expandedThematic: undefined, displaySlider: true };// TODO: to remove by using redux state update
    this.handleSubThematics = this.handleSubThematics.bind(this);
    this.toggleSlider = this.toggleSlider.bind(this);
  }

  handleSubThematics(thematicId) {
    // TODO: export to perform a redux state update
    if (!this.state.expandedThematic) {
      this.toggleSlider();
      this.setState({ expandedThematic: thematicId });
    } else if (this.state.expandedThematic === thematicId) {
      this.toggleSlider();
      this.setState({ expandedThematic: undefined });
    } else {
      this.setState({ expandedThematic: thematicId });
    }
  }

  toggleSlider() {
    this.setState({ displaySlider: !this.state.displaySlider });
  }

  renderThematicList() {
    const { thematics, identifier, slug } = this.props;
    const resetMarginStyle = this.state.displaySlider === false ? { margin: 0 } : null;
    const colStyle = { ...resetMarginStyle, width: 310 };

    return thematics.map((thematic, index) => {
      return (
        <Col
          key={index} xs={12} sm={6} md={3} style={colStyle}
          className={index % 4 === 0 ? `theme no-padding ${(resetMarginStyle ? '' : 'clear')}` : 'theme no-padding'}
        >
          <ThematicPreview
            {...thematic}
            subThemesCount={thematic.children ? thematic.children.length : 0}
            threadLink={`${get('debate', { slug: slug, phase: identifier })}${get('theme', { themeId: thematic.id })}`}
            toggleSubThematics={this.handleSubThematics}
            rollover={this.state.expandedThematic === thematic.id && this.state.displaySlider === false}
          />
        </Col>
      );
    });
  }

  render() {
    const { thematics } = this.props;

    return (
      <Row className="no-margin">
        { thematics.length > 4 && this.state.displaySlider === false &&
          <Slider {...SliderSettings(thematics.length)}>
            { this.renderThematicList() }
          </Slider>
        }
        { thematics.length > 4 && this.state.displaySlider !== false &&
          this.renderThematicList()
        }
        { thematics.length < 5 && this.renderThematicList() }
      </Row>
    );
  }
}

ThematicList.propTypes = {
  thematics: PropTypes.array,
  identifier: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired
};

export default ThematicList;