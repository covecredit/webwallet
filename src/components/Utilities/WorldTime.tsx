import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeZone {
  id: string;
  name: string;
  offset: number;
  city: string;
  region?: string;
}

const availableTimeZones: TimeZone[] = [
  { id: 'pacific', name: 'Pacific Time', offset: -8, city: 'Los Angeles', region: 'Americas' },
  { id: 'mountain', name: 'Mountain Time', offset: -7, city: 'Denver', region: 'Americas' },
  { id: 'central', name: 'Central Time', offset: -6, city: 'Chicago', region: 'Americas' },
  { id: 'eastern', name: 'Eastern Time', offset: -5, city: 'New York', region: 'Americas' },
  { id: 'london', name: 'GMT', offset: 0, city: 'London', region: 'Europe' },
  { id: 'berlin', name: 'CET', offset: 1, city: 'Berlin', region: 'Europe' },
  { id: 'paris', name: 'CET', offset: 1, city: 'Paris', region: 'Europe' },
  { id: 'zurich', name: 'CET', offset: 1, city: 'Zürich', region: 'Europe' },
  { id: 'moscow', name: 'MSK', offset: 3, city: 'Moscow', region: 'Europe' },
  { id: 'dubai', name: 'GST', offset: 4, city: 'Dubai', region: 'Middle East' },
  { id: 'mumbai', name: 'IST', offset: 5.5, city: 'Mumbai', region: 'Asia' },
  { id: 'singapore', name: 'SGT', offset: 8, city: 'Singapore', region: 'Asia' },
  { id: 'hongkong', name: 'HKT', offset: 8, city: 'Hong Kong', region: 'Asia' },
  { id: 'shanghai', name: 'CST', offset: 8, city: 'Shanghai', region: 'Asia' },
  { id: 'seoul', name: 'KST', offset: 9, city: 'Seoul', region: 'Asia' },
  { id: 'tokyo', name: 'JST', offset: 9, city: 'Tokyo', region: 'Asia' },
  { id: 'sydney', name: 'AEST', offset: 10, city: 'Sydney', region: 'Pacific' },
  { id: 'auckland', name: 'NZST', offset: 12, city: 'Auckland', region: 'Pacific' }
];

const WorldTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedZones, setSelectedZones] = useState<string[]>(['pacific', 'central', 'eastern', 'london', 'singapore', 'tokyo']);
  const [showSelector, setShowSelector] = useState(false);
  const [filterRegion, setFilterRegion] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, offset: number): string => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (3600000 * offset));
    return localTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date, offset: number): string => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (3600000 * offset));
    return localTime.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleZone = (id: string) => {
    if (selectedZones.includes(id)) {
      setSelectedZones(selectedZones.filter(z => z !== id));
    } else {
      setSelectedZones([...selectedZones, id]);
    }
  };

  const regions = Array.from(new Set(availableTimeZones.map(tz => tz.region))).sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-primary border-b border-primary border-opacity-30 pb-2">
        <Clock className="w-5 h-5" />
        <h3 className="font-medium">World Time</h3>
      </div>

      <div className="space-y-4">
        {selectedZones.map(zoneId => {
          const zone = availableTimeZones.find(z => z.id === zoneId);
          if (!zone) return null;

          return (
            <div
              key={zone.id}
              className="p-3 rounded-lg border border-primary/30 bg-background/50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-primary">{zone.city}</div>
                  <div className="text-xs text-text/70">{zone.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium text-primary">
                    {formatTime(currentTime, zone.offset)}
                  </div>
                  <div className="text-xs text-text/70">
                    {formatDate(currentTime, zone.offset)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => setShowSelector(!showSelector)}
          className="w-full p-2 text-sm hover:text-primary text-primary/70 transition-colors"
        >
          {showSelector ? 'Hide Time Zones' : 'Change Time Zones'}
        </button>

        {showSelector && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {regions.map(region => (
                <button
                  key={region}
                  onClick={() => setFilterRegion(filterRegion === region ? null : region)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filterRegion === region
                      ? 'text-primary'
                      : 'text-primary/50 hover:text-primary'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {availableTimeZones
                .filter(zone => !filterRegion || zone.region === filterRegion)
                .map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => toggleZone(zone.id)}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      selectedZones.includes(zone.id)
                        ? 'text-primary'
                        : 'text-primary/50 hover:text-primary'
                    }`}
                  >
                    {zone.city}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldTime;