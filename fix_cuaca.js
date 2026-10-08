const fs = require('fs');

let content = fs.readFileSync('app/cuaca.tsx', 'utf8');

content = content.replace(/WEATHER_DATA\.city/g, 'weatherData.city');
content = content.replace(/WEATHER_DATA\.temp/g, 'weatherData.suhu');
content = content.replace(/WEATHER_DATA\.condition/g, 'weatherData.kondisi');
content = content.replace(/WEATHER_DATA\.pop/g, 'weatherData.pop');
content = content.replace(/WEATHER_DATA\.humidity/g, 'weatherData.humidity');
content = content.replace(/WEATHER_DATA\.windSpeed/g, 'weatherData.windSpeed');
content = content.replace(/WEATHER_DATA\.uvi/g, 'weatherData.uvi');
content = content.replace(/FORECAST_DATA/g, '(weatherData.forecast3Days || [])');

// We also need to add a loading check in the return statement because weatherData might be null!
if (!content.includes('if (isLoading)')) {
  content = content.replace(
    'return (',
    `if (isLoading || !weatherData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.neutral }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (`
  );
}

fs.writeFileSync('app/cuaca.tsx', content);
console.log('Fixed app/cuaca.tsx');
