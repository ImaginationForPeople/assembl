// @flow

import * as React from 'react';

class DontUnderstand extends React.Component<{ size: number, color: string, backgroundColor: string }> {
  static defaultProps = {
    color: '#faaf3f',
    backgroundColor: '#ffffff'
  };

  render() {
    const { size, color, backgroundColor } = this.props;
    return (
      <svg width={`${size}px`} height={`${size}px`} viewBox="0 0 28 28">
        <g>
          <path
            d="M13.9072848,
                1.48344371 C6.99072848,
                1.48344371 1.39072848,
                7.08344371 1.39072848,
                14 C1.39072848,
                20.9165563 6.99072848,
                26.5165563 13.9072848,
                26.5165563 C20.8238411,
                26.5165563 26.4238411,
                20.9165563 26.4238411,
                14 C26.4238411,
                7.08344371 20.8238411,
                1.48344371 13.9072848,
                1.48344371 L13.9072848,
                1.48344371 Z"
            stroke={color}
            fill={backgroundColor}
          />
          <g transform="translate(4.821192, 7.231788)" fill={color}>
            <g transform="translate(1.298013, 2.966887)">
              <path
                d="M1.90993377,
                    0.0556291391 C0.945695364,
                    0.0556291391 0.166887417,
                    0.834437086 0.166887417,
                    1.7986755 C0.166887417,
                    2.76291391 0.945695364,
                    3.54172185 1.90993377,
                    3.54172185 C2.87417219,
                    3.54172185 3.65298013,
                    2.76291391 3.65298013,
                    1.7986755 C3.63443709,
                    0.834437086 2.85562914,
                    0.0556291391 1.90993377,
                    0.0556291391 L1.90993377,
                    0.0556291391 Z"
              />
              <ellipse cx="13.6662252" cy="1.78013245" rx="1.74304636" ry="1.74304636" />
            </g>
            <g>
              <rect
                transform="translate(15.209636, 1.684541) rotate(-69.910674) translate(-15.209636, -1.684541) "
                x="14.514241"
                y="-1.09703938"
                width="1.39072848"
                height="5.56291391"
              />
              <rect
                transform="translate(2.964735, 1.694145) rotate(-20.078564) translate(-2.964735, -1.694145) "
                x="0.183345952"
                y="0.99879725"
                width="5.56291391"
                height="1.39072848"
              />
            </g>
            <path
              d="M12.2569536,
                  10.4397351 L10.0317881,
                  12.1456954 C9.58675497,
                  12.4980132 9.4013245,
                  13.0172185 9.64238411,
                  13.3139073 C9.86490066,
                  13.6291391 10.4211921,
                  13.592053 10.8847682,
                  13.2397351 L13.1099338,
                  11.5337748 C13.5735099,
                  11.181457 13.7403974,
                  10.6622517 13.5178808,
                  10.3655629 C13.2768212,
                  10.0688742 12.7205298,
                  10.0874172 12.2569536,
                  10.4397351 L12.2569536,
                  10.4397351 Z"
            />
          </g>
        </g>
      </svg>
    );
  }
}

export default DontUnderstand;