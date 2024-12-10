import { useCallback, useMemo } from 'react';
import { IChartApi, ISeriesApi } from 'lightweight-charts';
import { ThemeColors } from '../../../../types/theme';
import { PriceData } from '../../../../types';

interface ProcessChartDataParams {
  chart: IChartApi;
  data: PriceData[];
  exchange: string;
  colors: ThemeColors;
  existingSeries: ISeriesApi<"Candlestick"> | null;
  existingLines: Map<string, ISeriesApi<"Line">>;
}

// Generate random colors for exchanges
function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.random() * 20;
  const lightness = 45 + Math.random() * 10;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export const useChartData = () => {
  const exchangeColors = useMemo(() => {
    const colors = new Map<string, string>();
    ['Bitfinex', 'Bitstamp', 'Kraken'].forEach(exchange => {
      colors.set(exchange, generateRandomColor());
    });
    return colors;
  }, []);

  const processChartData = useCallback(({
    chart,
    data,
    exchange,
    colors,
    existingSeries,
    existingLines
  }: ProcessChartDataParams) => {
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

    if (!validData.length) return { series: null, lines: new Map() };

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
          color: exchangeColors.get(exch) || generateRandomColor(),
          lineWidth: 2,
          title: exch,
          priceFormat: {
            type: 'price',
            precision: 4,
            minMove: 0.0001,
          },
          crosshairMarkerVisible: true,
          lineType: 0,
          priceLineVisible: false,
          lastValueVisible: true,
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
    } else if (exchange === 'Bitstamp') {
      const lineSeries = chart.addLineSeries({
        color: colors.primary,
        lineWidth: 2,
        title: 'Bitstamp',
        priceFormat: {
          type: 'price',
          precision: 4,
          minMove: 0.0001,
        },
        crosshairMarkerVisible: false,
      });

      const areaSeries = chart.addAreaSeries({
        topColor: `rgba(${colors.primary}, 0.4)`,
        bottomColor: `rgba(${colors.primary}, 0.0)`,
        lineColor: 'transparent',
        priceFormat: {
          type: 'price',
          precision: 4,
          minMove: 0.0001,
        },
        crosshairMarkerVisible: false,
      });

      const lineData = validData
        .map(d => ({
          time: Math.floor(d.timestamp / 1000),
          value: d.lastPrice || 0
        }))
        .sort((a, b) => a.time - b.time)
        .filter((item, index, self) => 
          index === self.findIndex(t => t.time === item.time)
        );

      lineSeries.setData(lineData);
      areaSeries.setData(lineData);
      
      const lines = new Map([['Bitstamp', lineSeries]]);

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
          open: d.lastPrice || 0,
          high: d.ask || d.high || d.lastPrice || 0,
          low: d.bid || d.low || d.lastPrice || 0,
          close: d.ask || d.lastPrice || 0
        }))
        .sort((a, b) => a.time - b.time)
        .filter((item, index, self) => 
          index === self.findIndex(t => t.time === item.time)
        );

      candleSeries.setData(candleData);
      return { series: candleSeries, lines: new Map() };
    }
  }, [exchangeColors]);

  return { processChartData };
};
