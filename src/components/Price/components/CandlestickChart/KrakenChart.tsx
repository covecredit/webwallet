import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeriesOptions } from 'lightweight-charts';
import { useThemeStore } from '../../../../store/themeStore';
import { themes } from '../../../../constants/theme';
import { hexToRgb } from '../../../../utils/color';
import { KrakenPriceData } from '../../../../services/exchanges/kraken/types';

interface KrakenChartProps {
  data: KrakenPriceData[];
}

export const KrakenChart: React.FC<KrakenChartProps> = ({ data }) => {
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useThemeStore();
  const colors = themes[currentTheme];

  useEffect(() => {
    if (!containerRef.current) return;

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: colors.text,
        fontSize: 12,
      },
      grid: {
        vertLines: { color: `rgba(${hexToRgb(colors.text)}, 0.1)` },
        horzLines: { color: `rgba(${hexToRgb(colors.text)}, 0.1)` },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: `rgba(${hexToRgb(colors.text)}, 0.1)`,
      },
      rightPriceScale: {
        borderColor: `rgba(${hexToRgb(colors.text)}, 0.1)`,
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      crosshair: {
        vertLine: {
          color: `rgba(${hexToRgb(colors.primary)}, 0.5)`,
          width: 1,
          style: 2,
        },
        horzLine: {
          color: `rgba(${hexToRgb(colors.primary)}, 0.5)`,
          width: 1,
          style: 2,
        },
      },
    };

    chartRef.current = createChart(containerRef.current, chartOptions);

    const candlestickOptions: CandlestickSeriesOptions = {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceFormat: {
        type: 'price',
        precision: 5,
        minMove: 0.00001,
      },
    };

    const candlestickSeries = chartRef.current.addCandlestickSeries(candlestickOptions);

    const volumeSeries = chartRef.current.addHistogramSeries({
      color: `rgba(${hexToRgb(colors.primary)}, 0.5)`,
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Ensure data is properly sorted by timestamp
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

    const candleData = sortedData.map(d => ({
      time: d.timestamp / 1000,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumeData = sortedData.map(d => ({
      time: d.timestamp / 1000,
      value: d.volume,
      color: d.close >= d.open ? '#26a69a80' : '#ef535080',
    }));

    candlestickSeries.setData(candleData);
    volumeSeries.setData(volumeData);

    // Add price line for last price
    candlestickSeries.createPriceLine({
      price: sortedData[sortedData.length - 1]?.lastPrice || 0,
      color: colors.primary,
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
    });

    chartRef.current.timeScale().fitContent();

    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [data, colors]);

  return <div ref={containerRef} className="w-full h-full" />;
};