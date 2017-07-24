import React from 'react';

import SliderPrevArrow from './sliderPrevArrow';
import SliderNextArrow from './sliderNextArrow';

const responsiveSettings = [{
  breakpoint: 1024,
  settings: {
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 0
  }
}, {
  breakpoint: 600,
  settings: {
    slidesToShow: 2,
    slidesToScroll: 1,
    initialSlide: 0
  }
}, {
  breakpoint: 480,
  settings: {
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0
  }
}];

const SliderSettings = (slidesCount, showPrevArrow = true, showNextArrow = true) => {
  /*
    To use with centermode = true;
    const initialSlide = slidesCount % 2 === 0 ? (slidesCount / 2) + 1 : Math.round(slidesCount / 2);
    */

  return {
    dots: false,
    infinite: false,
    accessibility: true,
    speed: 450,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    centerMode: false,
    variableWidth: true,
    responsive: responsiveSettings,
    prevArrow: <SliderPrevArrow active={showPrevArrow} />,
    nextArrow: <SliderNextArrow active={showNextArrow} />
  };
};

export default SliderSettings;