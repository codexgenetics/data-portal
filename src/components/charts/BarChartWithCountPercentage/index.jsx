import PropTypes from 'prop-types';
import React from 'react';
import LockedContent from '@gen3/ui-component/dist/components/charts/LockedContent';
import EmptyContent from '@gen3/ui-component/dist/components/charts/EmptyContent';
import { getCategoryColor } from '../helper';
import './BarChartWithCountPercentage.css';

/**
 * Calculate percentage (based on the sum of all values) and the relative
 * bar width (based on the max value) for each chart item.
 */
const calculateChartData = (data, percentageFixedPoint) => {
  const sum = data.reduce((accumulator, entry) => accumulator + entry.value, 0);
  const max = data.reduce((accumulator, entry) => Math.max(accumulator, entry.value), -Infinity);
  return data.map((entry) => {
    let percentage = sum > 0 ? (entry.value * 100) / sum : 0;
    percentage = Number(Number(percentage).toFixed(percentageFixedPoint));
    const widthPercentage = max > 0 ? (entry.value * 100) / max : 0;
    return { percentage, widthPercentage, ...entry };
  });
};

/**
 * A horizontal bar chart that displays both the count and the percentage
 * for each item, e.g. `1,234 (12.34%)`.
 *
 * This replicates the layout of `@gen3/ui-component`'s
 * SummaryHorizontalBarChart (label column, bar block, show more/less
 * toggling, locked/empty states), because the library component can only
 * display either the count or the percentage, but not both.
 */
class BarChartWithCountPercentage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  getItemColor(index) {
    if (this.props.useCustomizedColorMap) {
      return this.props.customizedColorMap[index % this.props.customizedColorMap.length];
    }
    if (this.props.color) {
      return this.props.color;
    }
    return getCategoryColor(index);
  }

  shouldHideChart() {
    return this.props.data.find((item) => item.value === this.props.lockValue);
  }

  toggle() {
    this.setState((prevState) => ({ showMore: !prevState.showMore }));
  }

  renderItemValue(item) {
    const count = Number(item.value).toLocaleString();
    return `${count} (${item.percentage}%)`;
  }

  render() {
    const barChartData = calculateChartData(this.props.data, this.props.percentageFixedPoint);
    let chart = null;
    if (this.props.data.length === 0) {
      chart = (<EmptyContent message={this.props.chartEmptyMessage} />);
    } else if (this.shouldHideChart()) {
      chart = (<LockedContent lockMessage={this.props.lockMessage} />);
    } else {
      chart = (
        <div>
          {
            barChartData.map((item, index) => {
              if (this.state.showMore || index < this.props.maximumDisplayItem) {
                return (
                  <div key={item.name} className='bar-chart-with-count-percentage__item'>
                    <div className='bar-chart-with-count-percentage__item-label'>{item.name}</div>
                    <div className='bar-chart-with-count-percentage__item-block-wrapper'>
                      <div
                        className='bar-chart-with-count-percentage__item-block'
                        style={{
                          width: `${item.widthPercentage}%`,
                          backgroundColor: this.getItemColor(index),
                        }}
                      />
                      <div className='bar-chart-with-count-percentage__item-value'>
                        { this.renderItemValue(item) }
                      </div>
                    </div>
                  </div>
                );
              }
              return (<React.Fragment key={item.name} />);
            })
          }
          {
            barChartData.length > this.props.maximumDisplayItem ? (
              <div
                className='bar-chart-with-count-percentage__toggle g3-link'
                onClick={() => this.toggle()}
                onKeyPress={() => this.toggle()}
                role='button'
                tabIndex={0}
              >
                {
                  this.state.showMore
                    ? <span>Show less</span>
                    : (
                      <span>
                        {`And ${(barChartData.length - this.props.maximumDisplayItem).toLocaleString()} more`}
                      </span>
                    )
                }
              </div>
            ) : (<></>)
          }
        </div>
      );
    }
    return (
      <div className='bar-chart-with-count-percentage'>
        <div className='bar-chart-with-count-percentage__title-box'>
          <p className='bar-chart-with-count-percentage__title h4-typo'>
            {this.props.title}
          </p>
        </div>
        {chart}
      </div>
    );
  }
}

const ChartDataShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
});

BarChartWithCountPercentage.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(ChartDataShape).isRequired,
  color: PropTypes.string,
  useCustomizedColorMap: PropTypes.bool,
  customizedColorMap: PropTypes.arrayOf(PropTypes.string),
  percentageFixedPoint: PropTypes.number,
  lockValue: PropTypes.number, // if one of the value is equal to `lockValue`, lock the chart
  lockMessage: PropTypes.string,
  maximumDisplayItem: PropTypes.number,
  chartEmptyMessage: PropTypes.string,
};

BarChartWithCountPercentage.defaultProps = {
  color: undefined,
  useCustomizedColorMap: false,
  customizedColorMap: ['#3283c8'],
  percentageFixedPoint: 2,
  lockValue: -1,
  lockMessage: 'This chart is hidden because it contains restricted access data',
  maximumDisplayItem: 15,
  chartEmptyMessage: 'This chart is empty',
};

export default BarChartWithCountPercentage;
