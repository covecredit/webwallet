import { useMemo } from 'react';
import { ColorType, CrosshairMode } from 'lightweight-charts';
import { ThemeColors } from '../../../../../types/theme';
import { hexToRgb } from '../../../../../utils/color';

export const useChartConfig = (colors: ThemeColors) => {
  const chartConfig = useMemo(() => ({
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
  }), [colors]);

  return { chartConfig };
};