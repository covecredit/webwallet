// Ripple epoch starts from January 1, 2000 00:00:00 UTC
export const RIPPLE_EPOCH = 946684800;

export function formatRippleTime(rippleTime: number | string): string {
  try {
    const timestamp = typeof rippleTime === 'string' ? parseInt(rippleTime, 10) : rippleTime;
    
    if (!timestamp || isNaN(timestamp)) {
      console.log('Invalid Ripple timestamp:', {
        input: rippleTime,
        type: typeof rippleTime,
        parsed: timestamp
      });
      return String(rippleTime);
    }

    return String(timestamp);
  } catch (error) {
    console.error('Ripple time formatting error:', error);
    return String(rippleTime);
  }
}

export function formatRippleTimeForCSV(rippleTime: number | string): string {
  try {
    const timestamp = typeof rippleTime === 'string' ? parseInt(rippleTime, 10) : rippleTime;
    if (!timestamp || isNaN(timestamp)) {
      return String(rippleTime);
    }
    return String(timestamp);
  } catch (error) {
    console.error('Ripple time CSV formatting error:', error);
    return String(rippleTime);
  }
}
