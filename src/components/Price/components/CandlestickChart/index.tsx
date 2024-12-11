import React, { useEffect, useRef, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode } from 'lightweight-charts';
import { useThemeStore } from '../../../../store/themeStore';
import { themes } from '../../../../constants/theme';
import { hexToRgb } from '../../../../utils/color';
import { formatTimestamp } from '../../../../utils/date';
import { PriceData } from '../../../../types';
import { ChartTooltip } from './ChartTooltip';
import { useChartConfig } from './hooks/useChartConfig';
import { useChartData } from './hooks/useChartData';

interface CandlestickChartProps {
  data: PriceData[];
  exchange: string;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, exchange }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRefs = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const { currentTheme } = useThemeStore();
  const colors = themes[currentTheme];
  const { chartConfig } = useChartConfig(colors);
  const { processChartData } = useChartData();

  const handleResize = useCallback(() => {
    if (chartRef.current && chartContainerRef.current) {
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight
      });
    }
  }, []);

  const updateTooltip = useCallback((param: any) => {
    const tooltip = tooltipRef.current;
    if (!tooltip || !param?.point) {
      if (tooltip) {
        tooltip.style.display = 'none';
      }
      return;
    }

    if (param.point.x < 0 || param.point.y < 0) {
      tooltip.style.display = 'none';
      return;
    }

    const dateStr = param.time ? formatTimestamp(param.time * 1000) : '';
    let content = `<div class="font-medium">${dateStr}</div>`;

    if (exchange === 'All') {
      const seriesData = param.seriesData;
      if (!seriesData?.size) return;
      
      content += Array.from(seriesData.entries()).map(([series, value]) => {
        if (!series?.options) return '';
        const exchange = series.options().title as string;
        const color = series.options().color as string;
        return value?.value !== undefined ? 
          `<div style="color: ${color}">${exchange}: $${value.value.toFixed(4)}</div>` : '';
      }).filter(Boolean).join('');
    } else {
      const data = param.seriesData?.get(seriesRef.current);
      if (data) {
        content += `
          <div>Open: $${data.open?.toFixed(4) || 'N/A'}</div>
          <div>High: $${data.high?.toFixed(4) || 'N/A'}</div>
          <div>Low: $${data.low?.toFixed(4) || 'N/A'}</div>
          <div>Close: $${data.close?.toFixed(4) || 'N/A'}</div>
        `;
      }
    }

    tooltip.innerHTML = content;
    tooltip.style.display = 'block';
    
    const box = chartContainerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const left = Math.min(param.point.x + 12, box.width - tooltip.offsetWidth - 12);
    const top = Math.min(param.point.y + 12, box.height - tooltip.offsetHeight - 12);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }, [exchange]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, chartConfig);
    chartRef.current.subscribeCrosshairMove(updateTooltip);

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(chartContainerRef.current);

    return () => {
      if (resizeObserverRef.current && chartContainerRef.current) {
        resizeObserverRef.current.unobserve(chartContainerRef.current);
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
      lineSeriesRefs.current.clear();
    };
  }, [chartConfig, handleResize, updateTooltip]);

  useEffect(() => {
    if (!chartRef.current || !data?.length) return;

    const { series, lines } = processChartData({
      chart: chartRef.current,
      data,
      exchange,
      colors,
      existingSeries: seriesRef.current,
      existingLines: lineSeriesRefs.current
    });

    seriesRef.current = series;
    lineSeriesRefs.current = lines;

    chartRef.current.timeScale().fitContent();
  }, [data, exchange, colors, processChartData]);

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
      <ChartTooltip ref={tooltipRef} />
    </div>
  );
};

export default CandlestickChart;