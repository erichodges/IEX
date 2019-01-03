import React from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
  BarSeries,
  CandlestickSeries,
  LineSeries
} from "react-stockcharts/lib/series";

import { XAxis, YAxis } from "react-stockcharts/lib/axes";

import {
  CrossHairCursor,
  CurrentCoordinate,
  MouseCoordinateX,
  MouseCoordinateY
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";

import {
  OHLCTooltip,
  MovingAverageTooltip
} from "react-stockcharts/lib/tooltip";

import { ema, wma, sma } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

// want to have sma 5, 50, 200 and ema 13, 21
class CandleStickChartWithMA extends React.Component {
  render() {
    const ema20 = ema()
      .options({
        windowSize: 20, // optional will default to 10
        sourcePath: "close" // optional will default to close as the source
      })
      .skipUndefined(true) // defaults to true
      .merge((d, c) => {
        d.ema20 = c;
      }) // Required, if not provided, log a error
      .accessor(d => d.ema20) // Required, if not provided, log an error during calculation
      .stroke("blue"); // Optional

    const sma20 = sma()
      .options({ windowSize: 20 })
      .merge((d, c) => {
        d.sma20 = c;
      })
      .accessor(d => d.sma20);

    const wma20 = wma()
      .options({ windowSize: 20 })
      .merge((d, c) => {
        d.wma20 = c;
      })
      .accessor(d => d.wma20);

    // const tma20 = tma()
    //   .options({ windowSize: 20 })
    //   .merge((d, c) => {
    //     d.tma20 = c;
    //   })
    //   .accessor(d => d.tma20);

    const ema50 = ema()
      .options({ windowSize: 50 })
      .merge((d, c) => {
        d.ema50 = c;
      })
      .accessor(d => d.ema50);
    const { type, data: initialData, width, ratio } = this.props;

    const candlesAppearance = {
      wickStroke: function stroke(d) {
        return d.close > d.open ? "#18A81B" : "#FC0D1B";
      },
      fill: function fill(d) {
        return d.close > d.open ? "#18A81B" : "#FC0D1B";
      },
      stroke: function stroke(d) {
        return d.close > d.open ? "#18A81B" : "#FC0D1B";
      },
      candleStrokeWidth: 1,
      widthRatio: 0.8,
      opacity: 1
    };

    const calculatedData = ema20(sma20(wma20(ema50(initialData))));
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      d => d.date
    );
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
      calculatedData
    );

    const start = xAccessor(last(data));
    const end = xAccessor(data[Math.max(0, data.length - 150)]);
    const xExtents = [start, end];

    return (
      <ChartCanvas
        height={600}
        width={width}
        ratio={ratio}
        margin={{ left: 70, right: 70, top: 10, bottom: 30 }}
        type={type}
        seriesName=""
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
      >
        <Chart
          id={2}
          yExtents={[d => d.volume]}
          height={150}
          origin={(w, h) => [0, h - 150]}
        >
          <YAxis
            axisAt="left"
            orient="left"
            ticks={5}
            tickFormat={format(".2s")}
          />
          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat("%Y-%m-%d")}
          />
          <MouseCoordinateY
            at="left"
            orient="left"
            displayFormat={format(".4s")}
          />
          <BarSeries
            yAccessor={d => d.volume}
            fill={d => (d.close > d.open ? "#555555" : "#555555")}
          />
          <CurrentCoordinate yAccessor={d => d.volume} fill="#9B0A47" />
        </Chart>
        <Chart
          id={1}
          yExtents={[
            d => [d.high, d.low],
            sma20.accessor(),
            wma20.accessor(),
            ema20.accessor(),
            ema50.accessor()
          ]}
          padding={{ top: 10, bottom: 20 }}
        >
          <XAxis axisAt="bottom" orient="bottom" />
          <YAxis axisAt="right" orient="right" ticks={5} />

          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".2f")}
          />

          <CandlestickSeries {...candlesAppearance} clip={false} />
          <LineSeries yAccessor={sma20.accessor()} stroke={sma20.stroke()} />
          <LineSeries yAccessor={wma20.accessor()} stroke={wma20.stroke()} />
          <LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()} />
          <LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()} />
          <CurrentCoordinate
            yAccessor={sma20.accessor()}
            fill={sma20.stroke()}
          />
          <CurrentCoordinate
            yAccessor={wma20.accessor()}
            fill={wma20.stroke()}
          />
          <CurrentCoordinate
            yAccessor={ema20.accessor()}
            fill={ema20.stroke()}
          />
          <CurrentCoordinate
            yAccessor={ema50.accessor()}
            fill={ema50.stroke()}
          />

          <OHLCTooltip origin={[-40, 0]} />
          <MovingAverageTooltip
            onClick={e => console.log(e)}
            origin={[-38, 15]}
            options={[
              {
                yAccessor: sma20.accessor(),
                type: "SMA",
                stroke: sma20.stroke(),
                windowSize: sma20.options().windowSize,
                echo: "some echo here"
              },
              {
                yAccessor: wma20.accessor(),
                type: "WMA",
                stroke: wma20.stroke(),
                windowSize: wma20.options().windowSize,
                echo: "some echo here"
              },
              {
                yAccessor: ema20.accessor(),
                type: "EMA",
                stroke: ema20.stroke(),
                windowSize: ema20.options().windowSize,
                echo: "some echo here"
              },
              {
                yAccessor: ema50.accessor(),
                type: "EMA",
                stroke: ema50.stroke(),
                windowSize: ema50.options().windowSize,
                echo: "some echo here"
              }
            ]}
          />
        </Chart>

        <CrossHairCursor />
      </ChartCanvas>
    );
  }
}

CandleStickChartWithMA.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};

CandleStickChartWithMA.defaultProps = {
  type: "svg"
};
CandleStickChartWithMA = fitWidth(CandleStickChartWithMA);

export default CandleStickChartWithMA;
