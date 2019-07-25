import React from 'react';

class Pointer extends React.Component {
  render() {
    const position = this.props.position;
    const marginLeft = position ? `calc(${position}% - 15px)` : 'initial';
    const width = this.props.width ? this.props.width : '31px';
    const height = this.props.height ? this.props.height : '46px';
    const style = { marginLeft: marginLeft, ...this.props.style };
    return (
      <svg style={style} className="pointer" width={width} height={height} viewBox="0 0 31 46" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(-772.000000, -4682.000000)">
          <g transform="translate(-2.000000, 689.000000)">
            <g transform="translate(2.000000, 2971.000000)">
              <g transform="translate(101.000000, 1022.000000)">
                <g transform="translate(671.000000, 0.000000)">
                  <path
                    d="M15.2198519,
                    0 C6.81196296,
                    0 0,6.81196296 0,
                    15.2198519 C0,
                    21.7436296 4.12185185,
                    27.2593333 9.88383333,
                    29.4293333 L11.4148889,
                    34.0787593 L15.2192778,
                    45.6601296 L19.0248148,
                    34.0787593 L20.5552963,
                    29.4293333 C26.3195741,
                    27.2593333 30.4397037,
                    21.7436296 30.4397037,
                    15.2198519 C30.4397037,
                    6.81196296 23.6202778,
                    0 15.2198519,
                    0 Z M14.9672593,
                    19.786037 C12.4459259,
                    19.786037 10.4010741,
                    17.7411852 10.4010741,
                    15.2198519 C10.4010741,
                    12.6990926 12.4459259,
                    10.6542407 14.9672593,
                    10.6542407 C17.4880185,
                    10.6542407 19.5328704,
                    12.6990926 19.5328704,
                    15.2198519 C19.5328704,
                    17.7406111 17.4880185,
                    19.786037 14.9672593,
                    19.786037 Z"
                    id="Shape"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    );
  }
}

export default Pointer;