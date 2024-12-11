import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { useThemeStore } from '../../../../store/themeStore';
import { themes } from '../../../../constants/theme';
import { hexToRgb } from '../../../../utils/color';
import { PriceData } from '../../../../types';

interface BitfinexChartProps {
  data: PriceData[];
}

export const BitfinexChart: React.FC<BitfinexChartProps> = ({ data }) => {
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useThemeStore();
  const colors = themes[currentTheme];

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

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

    const series = chartRef.current.addLineSeries({
      color: colors.primary,
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 5,
        minMove: 0.00001,
      },
    });

    const chartData = data
      .filter(d => d?.lastPrice && d?.timestamp)
      .map(d => ({
        time: Math.floor(d.timestamp / 1000),
        value: d.lastPrice || 0,
      }));

    series.setData(chartData);
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