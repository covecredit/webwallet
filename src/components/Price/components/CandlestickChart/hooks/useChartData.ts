import { useCallback } from 'react';
import { IChartApi, ISeriesApi } from 'lightweight-charts';
import { ThemeColors } from '../../../../../types/theme';
import { PriceData } from '../../../../../types';

interface ProcessChartDataParams {
  chart: IChartApi;
  data: PriceData[];
  exchange: string;
  colors: ThemeColors;
  existingSeries: ISeriesApi<"Candlestick"> | null;
  existingLines: Map<string, ISeriesApi<"Line">>;
}

const EXCHANGE_COLORS = {
  Bitfinex: '#FF6B6B',
  Bitstamp: '#4ECB71',
  Kraken: '#6B8AFF'
};

export const useChartData = () => {
  const processChartData = useCallback((params: ProcessChartDataParams) => {
    const { chart, data, exchange, colors, existingSeries, existingLines } = params;

    // Clear existing series
    if (existingSeries) {
      chart.removeSeries(existingSeries);
    }
    
    existingLines.forEach(series => {
      chart.removeSeries(series);
    });
    existingLines.clear();

    const validData = data.filter(d => {
      return d?.lastPrice !== undefined && !isNaN(d.lastPrice) &&
             d?.timestamp !== undefined && !isNaN(d.timestamp);
    });

    if (!validData.length) {
      return { series: null, lines: new Map() };
    }

    if (exchange === 'All') {
      const exchangeData = validData.reduce((acc, item) => {
        if (!acc[item.exchange]) acc[item.exchange] = [];
        acc[item.exchange].push({
          time: Math.floor(item.timestamp / 1000),
          value: item.lastPrice || 0
        });
        return acc;
      }, {} as Record<string, any[]>);

      const lines = new Map();
      Object.entries(exchangeData).forEach(([exch, prices]) => {
        if (!prices.length) return;
        
        const series = chart.addLineSeries({
          color: EXCHANGE_COLORS[exch as keyof typeof EXCHANGE_COLORS] || colors.primary,
          lineWidth: 2,
          title: exch,
          priceFormat: {
            type: 'price',
            precision: 4,
            minMove: 0.0001,
          },
          crosshairMarkerVisible: true,
          lastValueVisible: true,
          priceLineVisible: false,
        });

        const sortedData = prices
          .sort((a, b) => a.time - b.time)
          .filter((item, index, self) => 
            index === self.findIndex(t => t.time === item.time)
          );

        series.setData(sortedData);
        lines.set(exch, series);
      });

      return { series: null, lines };
    } else {
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        priceFormat: {
          type: 'price',
          precision: 4,
          minMove: 0.0001,
        }
      });

      const candleData = validData
        .map(d => ({
          time: Math.floor(d.timestamp / 1000),
          open: d.open || d.lastPrice || 0,
          high: d.high || d.ask || d.lastPrice || 0,
          low: d.low || d.bid || d.lastPrice || 0,
          close: d.close || d.lastPrice || 0
        }))
        .sort((a, b) => a.time - b.time)
        .filter((item, index, self) => 
          index === self.findIndex(t => t.time === item.time)
        );

      candleSeries.setData(candleData);
      return { series: candleSeries, lines: new Map() };
    }
  }, []);

  return { processChartData };
};