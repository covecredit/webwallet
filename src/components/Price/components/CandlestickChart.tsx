import React, { useEffect, useRef, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode } from 'lightweight-charts';
import { useThemeStore } from '../../../store/themeStore';
import { themes } from '../../../constants/theme';
import { hexToRgb } from '../../../utils/color';
import { formatTimestamp } from '../../../utils/date';
import type { PriceData } from '../../../types';

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
      if (!seriesData) return;
      
      content += Array.from(seriesData.entries()).map(([series, value]) => {
        const exchange = series.options().title as string;
        return `<div style="color: ${colors.primary}">${exchange}: $${value?.value?.toFixed(4) || 'N/A'}</div>`;
      }).join('');
    } else if (exchange === 'Bitstamp') {
      const data = param.seriesData?.get(lineSeriesRefs.current.get('Bitstamp'));
      if (data?.value) {
        content += `<div>Price: $${data.value.toFixed(4)}</div>`;
      }
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
  }, [exchange, colors.primary]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
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
        mode: CrosshairMode.Normal,
        vertLine: {
          labelBackgroundColor: colors.primary,
          style: 0,
        },
        horzLine: {
          labelBackgroundColor: colors.primary,
          style: 0,
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      }
    });

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
  }, [colors, handleResize, updateTooltip]);

  useEffect(() => {
    if (!chartRef.current || !data?.length) return;

    // Clear existing series
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }
    
    lineSeriesRefs.current.forEach(series => {
      if (chartRef.current) {
        chartRef.current.removeSeries(series);
      }
    });
    lineSeriesRefs.current.clear();

    const validData = data.filter(d => {
      return d?.lastPrice !== undefined && !isNaN(d.lastPrice) &&
             d?.timestamp !== undefined && !isNaN(d.timestamp);
    });

    if (!validData.length) return;

    if (exchange === 'All') {
      const exchangeData = validData.reduce((acc, item) => {
        if (!acc[item.exchange]) acc[item.exchange] = [];
        acc[item.exchange].push({
          time: Math.floor(item.timestamp / 1000),
          value: item.lastPrice || 0
        });
        return acc;
      }, {} as Record<string, any[]>);

      Object.entries(exchangeData).forEach(([exch, prices]) => {
        if (!chartRef.current || !prices.length) return;
        
        const series = chartRef.current.addLineSeries({
          color: colors.primary,
          lineWidth: 2,
          title: exch,
          priceFormat: {
            type: 'price',
            precision: 4,
            minMove: 0.0001,
          },
          crosshairMarkerVisible: false,
        });

        const sortedData = prices
          .sort((a, b) => a.time - b.time)
          .filter((item, index, self) => 
            index === self.findIndex(t => t.time === item.time)
          );

        series.setData(sortedData);
        lineSeriesRefs.current.set(exch, series);
      });
    } else if (exchange === 'Bitstamp') {
      const lineSeries = chartRef.current.addLineSeries({
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

      const areaSeries = chartRef.current.addAreaSeries({
        topColor: `rgba(${hexToRgb(colors.primary)}, 0.4)`,
        bottomColor: `rgba(${hexToRgb(colors.primary)}, 0.0)`,
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
      lineSeriesRefs.current.set('Bitstamp', lineSeries);

      if (lineData.length > 0) {
        const highPrice = Math.max(...lineData.map(d => d.value));
        const lowPrice = Math.min(...lineData.map(d => d.value));

        lineSeries.createPriceLine({
          price: highPrice,
          color: '#26a69a',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'Last High'
        });

        lineSeries.createPriceLine({
          price: lowPrice,
          color: '#ef5350',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'Last Low'
        });
      }
    } else {
      const candleSeries = chartRef.current.addCandlestickSeries({
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
          high: d.high || d.lastPrice || 0,
          low: d.low || d.lastPrice || 0,
          close: d.close || d.lastPrice || 0
        }))
        .sort((a, b) => a.time - b.time)
        .filter((item, index, self) => 
          index === self.findIndex(t => t.time === item.time)
        );

      candleSeries.setData(candleData);
      seriesRef.current = candleSeries;

      if (candleData.length > 0) {
        const highPrice = Math.max(...candleData.map(d => d.high));
        const lowPrice = Math.min(...candleData.map(d => d.low));

        candleSeries.createPriceLine({
          price: highPrice,
          color: '#26a69a',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: '24h High'
        });

        candleSeries.createPriceLine({
          price: lowPrice,
          color: '#ef5350',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: '24h Low'
        });
      }
    }

    chartRef.current.timeScale().fitContent();
  }, [data, exchange, colors]);

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
      <div
        ref={tooltipRef}
        className="absolute hidden z-50 bg-background bg-opacity-95 border border-primary border-opacity-30 rounded-lg p-2 text-sm pointer-events-none"
      />
    </div>
  );
};

export default CandlestickChart;
