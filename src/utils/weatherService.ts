export interface WeatherInfo {
  temp: string;
  condition: string;
  icon: string;
  advisory: string;
  isOutdoorSuspended: boolean;
}

export interface ForecastDayReport {
  time: string; // "Morning (06:00 - 10:00)" or "Evening (16:00 - 21:00)"
  temp: string;
  condition: string;
  icon: string;
  advisory: string;
  isBadWeather: boolean;
}

export interface HourlyForecast {
  date: string; // "YYYY-MM-DD"
  hour: number; // 0-23
  temp: number;
  precipitation: number;
  weathercode: number;
}

export interface FullWeatherState {
  current: WeatherInfo;
  hourlyList: HourlyForecast[];
}

// Map WMO Weather Interpretation Codes (weathercode) to user-friendly conditions & emojis
export const mapWeatherCode = (code: number): { condition: string; icon: string; advisory: string; isBadWeather: boolean } => {
  if (code === 0) {
    return { condition: 'Sunny', icon: '☀️', advisory: 'Clear skies. Perfect for outdoor sports!', isBadWeather: false };
  } else if (code >= 1 && code <= 3) {
    return { condition: 'Cloudy', icon: '☁️', advisory: 'Overcast skies. Pleasant weather for play.', isBadWeather: false };
  } else if (code === 45 || code === 48) {
    return { condition: 'Foggy', icon: '🌫️', advisory: 'Reduced visibility. Play with caution under floodlights.', isBadWeather: false };
  } else if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { condition: 'Rainy', icon: '🌧️', advisory: '⚠️ Rain expected — outdoor courts may close or be suspended.', isBadWeather: true };
  } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { condition: 'Snowy', icon: '❄️', advisory: 'Snowy conditions.', isBadWeather: true };
  } else if (code >= 95 && code <= 99) {
    return { condition: 'Thunderstorm', icon: '⛈️', advisory: '🚨 Thunderstorm alert! Outdoor activities suspended immediately.', isBadWeather: true };
  }
  return { condition: 'Clear', icon: '☀️', advisory: 'Perfect weather for play!', isBadWeather: false };
};

// Fetch full current and 7-day hourly forecast from Open-Meteo for VIT Chennai (Kovilancheri)
export const fetchLiveWeather = async (): Promise<FullWeatherState> => {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=12.8406&longitude=80.1534&hourly=temperature_2m,precipitation,weathercode&current_weather=true&timezone=Asia/Kolkata&forecast_days=7';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Parse current weather
    const currentTemp = Math.round(data.current_weather.temperature);
    const currentCode = data.current_weather.weathercode;
    const currentMapping = mapWeatherCode(currentCode);

    const currentInfo: WeatherInfo = {
      temp: `${currentTemp}°C`,
      condition: currentMapping.condition,
      icon: currentMapping.icon,
      advisory: currentMapping.advisory,
      isOutdoorSuspended: currentMapping.isBadWeather
    };

    // Parse hourly forecast list
    const hourlyList: HourlyForecast[] = [];
    const times: string[] = data.hourly.time;
    const temps: number[] = data.hourly.temperature_2m;
    const precips: number[] = data.hourly.precipitation;
    const codes: number[] = data.hourly.weathercode;

    for (let i = 0; i < times.length; i++) {
      // time format: "2026-08-02T00:00"
      const parts = times[i].split('T');
      const date = parts[0];
      const hour = parseInt(parts[1].split(':')[0]);
      hourlyList.push({
        date,
        hour,
        temp: temps[i],
        precipitation: precips[i],
        weathercode: codes[i]
      });
    }

    return {
      current: currentInfo,
      hourlyList
    };
  } catch (error) {
    console.warn('Weather API failed, falling back to simulated data:', error);
    // Dynamic fallback with correct fields
    return {
      current: {
        temp: '29°C',
        condition: 'Sunny',
        icon: '☀️',
        advisory: 'Clear skies. Perfect for outdoor sports!',
        isOutdoorSuspended: false
      },
      hourlyList: []
    };
  }
};

// Compute dynamic forecast for a given date (Morning vs Evening)
export const getForecastForDate = (state: FullWeatherState | null, dateStr: string): ForecastDayReport[] => {
  const fallbackReports = [
    { time: 'Morning (06:00 - 10:00)', temp: '28°C', condition: 'Sunny', icon: '☀️', advisory: 'Clear skies. Perfect for outdoor sports!', isBadWeather: false },
    { time: 'Evening (16:00 - 21:00)', temp: '26°C', condition: 'Clear', icon: '☀️', advisory: 'Clear night sky.', isBadWeather: false },
  ];

  if (!state || !state.hourlyList || state.hourlyList.length === 0) {
    return fallbackReports;
  }

  // Filter for selected date
  const dayHours = state.hourlyList.filter(h => h.date === dateStr);
  if (dayHours.length === 0) {
    return fallbackReports;
  }

  // Morning hours: 6, 7, 8, 9
  const morningHours = dayHours.filter(h => h.hour >= 6 && h.hour <= 9);
  // Evening hours: 16, 17, 18, 19, 20
  const eveningHours = dayHours.filter(h => h.hour >= 16 && h.hour <= 20);

  const getReportForPeriod = (hours: typeof dayHours, label: string): ForecastDayReport => {
    if (hours.length === 0) {
      return { time: label, temp: '--°C', condition: 'Unknown', icon: '☀️', advisory: 'No forecast data available.', isBadWeather: false };
    }
    const avgTemp = Math.round(hours.reduce((acc, h) => acc + h.temp, 0) / hours.length);
    const hasRain = hours.some(h => h.precipitation > 0.1 || [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(h.weathercode));
    
    // Get max code
    const maxCode = hours.reduce((max, h) => h.weathercode > max ? h.weathercode : max, 0);
    const codeMapping = mapWeatherCode(hasRain ? 61 : maxCode);

    return {
      time: label,
      temp: `${avgTemp}°C`,
      condition: codeMapping.condition,
      icon: codeMapping.icon,
      advisory: codeMapping.advisory,
      isBadWeather: codeMapping.isBadWeather
    };
  };

  return [
    getReportForPeriod(morningHours, 'Morning (06:00 - 10:00)'),
    getReportForPeriod(eveningHours, 'Evening (16:00 - 21:00)')
  ];
};
