// XRPL epoch starts from January 1, 2000 00:00:00 UTC
const RIPPLE_EPOCH = 946684800;

function padNumber(num: number): string {
  return num.toString().padStart(2, '0');
}

export function formatRippleDate(timestamp: number): string {
  try {
    console.log('Formatting Ripple date:', {
      input: timestamp,
      type: typeof timestamp
    });
    
    if (!timestamp || typeof timestamp !== 'number') {
      console.warn('Invalid timestamp:', timestamp);
      return 'N/A';
    }
    
    // Convert Ripple timestamp to Unix timestamp (milliseconds)
    const unixTimestamp = (timestamp + RIPPLE_EPOCH) * 1000;
    console.log('Converted timestamp:', {
      rippleEpoch: RIPPLE_EPOCH,
      unixTimestamp,
      date: new Date(unixTimestamp).toISOString()
    });
    
    const date = new Date(unixTimestamp);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date object:', date);
      return 'N/A';
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = padNumber(date.getDate());
    const year = date.getFullYear();
    const hours = padNumber(date.getHours());
    const minutes = padNumber(date.getMinutes());
    const seconds = padNumber(date.getSeconds());
    
    const formatted = `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
    console.log('Formatted date:', formatted);
    
    return formatted;
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
}

export function formatTimestamp(timestamp: number): string {
  try {
    console.log('Formatting timestamp:', {
      input: timestamp,
      type: typeof timestamp
    });

    if (!timestamp || typeof timestamp !== 'number') {
      console.warn('Invalid timestamp:', timestamp);
      return 'N/A';
    }

    const date = new Date(timestamp);
    console.log('Created date object:', {
      date: date.toISOString(),
      valid: !isNaN(date.getTime())
    });

    if (isNaN(date.getTime())) {
      console.warn('Invalid date object:', date);
      return 'N/A';
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = padNumber(date.getDate());
    const year = date.getFullYear();
    const hours = padNumber(date.getHours());
    const minutes = padNumber(date.getMinutes());
    const seconds = padNumber(date.getSeconds());
    
    const formatted = `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
    console.log('Formatted date:', formatted);
    
    return formatted;
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
}