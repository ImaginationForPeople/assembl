import React from 'react';
import PropTypes from 'prop-types';

const SliderNextArrow = (props) => {
  const { className, style, onClick, active } = props;
  return (
    <div
      className={className}
      style={{ ...style, background: 'black', opacity: 0.8, display: active }}
      onClick={onClick}
    />
  );
};

SliderNextArrow.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func
};

export default SliderNextArrow;