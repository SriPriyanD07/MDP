import httpx
import unicodedata
from typing import Optional, List, Dict, Tuple, Any
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from app.models import WeatherData, ForecastData

load_dotenv()

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        # Check for placeholder or empty key
        if self.api_key == "your-openweathermap-api-key-here" or not self.api_key:
            self.api_key = None
            
        self.base_url = "https://api.openweathermap.org/data/2.5"
        # Cache structure: location_key -> (timestamp_utc, data)
        self.cache: Dict[str, Tuple[datetime, Any]] = {} 
        self.cache_duration = 5  # minutes

    async def get_current_weather(self, city: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> WeatherData:
        """
        Get current weather data with caching and mock fallback.
        Fully async implementation using httpx.
        """
        # 1. Normalize Cache Key
        if city and city.strip():
            location = city.strip().lower()
        elif lat is not None and lon is not None:
            location = f"{lat},{lon}"
        else:
            location = "london" # Default fallback
            
        print(f"🌍 Weather Request - City: '{city}' -> Key: '{location}'")

        # 2. Check Cache
        if location in self.cache:
            timestamp, data = self.cache[location]
            if datetime.utcnow() - timestamp < timedelta(minutes=self.cache_duration):
                print(f"ℹ️ Returning Cached Data for '{location}'")
                return data

        # 3. Prepare Mock Data (Fallback)
        # Generate semi-realistic data based on city name hash
        # This ensures "Paris" always returns same 'random' data, but different from "London"
        seed_val = sum(ord(c) for c in location) 
        mock_temp = 15.0 + (seed_val % 20)  # Range: 15°C to 34°C
        mock_feels_like = mock_temp + 2.0
        mock_humidity = 40.0 + (seed_val % 40) # Range: 40% to 79%
        mock_rain = 0.0 if (seed_val % 3 > 0) else (seed_val % 80) # 1/3 change of rain logic
        
        conditions = ["Clear Sky", "Cloudy", "Partly Cloudy", "Light Rain"]
        mock_desc = conditions[seed_val % len(conditions)] + " (Mock)"

        # Normalize logic for mock
        if city:
            display_loc = city.title()
        else:
             display_loc = "Unknown Location"

        mock_data = WeatherData(
            temperature=round(mock_temp, 1),
            feels_like=round(mock_feels_like, 1),
            humidity=round(mock_humidity, 1),
            rain_probability=round(mock_rain, 1),
            description=mock_desc,
            location=display_loc, 
            timestamp=datetime.utcnow()
        )

        if not self.api_key:
            print(f"⚠️ API Key missing. Returning dynamic mock weather for {location}: {mock_temp}°C")
            return mock_data

        # 4. Try Real API (Async)
        try:
            url = f"{self.base_url}/weather"
            params = {
                "appid": self.api_key,
                "units": "metric"
            }
            
            # Robust Logic: Only add 'q' if valid city string
            if city and city.strip():
                params["q"] = city.strip()
            elif lat is not None and lon is not None:
                params["lat"] = str(lat)
                params["lon"] = str(lon)
            else:
                params["q"] = "London"

            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract rain probability approximations
                rain_prob = 0.0
                if "rain" in data:
                    rain_prob = 80.0
                elif "clouds" in data:
                    rain_prob = min(data["clouds"].get("all", 0) * 0.8, 100.0)

                # Clean header logic
                raw_name = data.get("name", location)
                try:
                    # Normalize diacritics (e.g. Tiruvānmiyūr -> Tiruvanmiyur)
                    normalized_name = unicodedata.normalize('NFKD', raw_name).encode('ASCII', 'ignore').decode('utf-8')
                except:
                    normalized_name = raw_name

                weather_data = WeatherData(
                    temperature=data["main"]["temp"],
                    feels_like=data["main"].get("feels_like", data["main"]["temp"]),
                    humidity=data["main"]["humidity"],
                    rain_probability=rain_prob,
                    description=data["weather"][0]["description"],
                    location=normalized_name,
                    timestamp=datetime.utcnow()
                )
                
                # Update Cache
                self.cache[location] = (datetime.utcnow(), weather_data)
                print(f"✅ Cached new data for '{location}'")
                return weather_data
            
            elif response.status_code == 401:
                print(f"⚠️ API Key Invalid or Not Active code 401. (Keys make take 10-20 min to activate). Using mock.")
                return mock_data
            else:
                print(f"❌ Weather API received status {response.status_code}. Using mock.")
                return mock_data

        except httpx.RequestError as e:
            print(f"❌ Weather API connection failed: {e}. Using mock.")
            return mock_data
        except Exception as e:
            print(f"❌ Unexpected error in weather service: {e}. Using mock.")
            return mock_data

    async def get_forecast(self, city: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> List[ForecastData]:
        """
        Get forecast data with mock fallback.
        Fully async implementation using httpx.
        """
        # Prepare Mock Forecast with Dynamic Data
        location = city.strip().lower() if city and city.strip() else "london"
        seed_val = sum(ord(c) for c in location)
        
        mock_forecast = []
        base_time = datetime.utcnow()
        for i in range(5):
            # Vary temp slightly over time
            f_temp = 15.0 + (seed_val % 20) + (i * 0.5) if i % 2 == 0 else 15.0 + (seed_val % 20) - 0.5
            mock_forecast.append(ForecastData(
                time=base_time + timedelta(hours=3 * (i + 1)),
                temperature=round(f_temp, 1),
                rain_probability=round((seed_val * i) % 100, 1),
                description="Partly Cloudy (Mock)"
            ))

        if not self.api_key:
            return mock_forecast

        try:
            url = f"{self.base_url}/forecast"
            params = {
                "appid": self.api_key,
                "units": "metric",
                "cnt": 5  # Limits response size
            }
            if city and city.strip():
                params["q"] = city.strip()
            elif lat is not None and lon is not None:
                params["lat"] = str(lat)
                params["lon"] = str(lon)
            else:
                params["q"] = "London"

            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url, params=params)

            if response.status_code == 200:
                data = response.json()
                forecast_list = []
                
                for item in data.get("list", [])[:5]:
                    forecast_list.append(ForecastData(
                        # Use utcfromtimestamp for correct parsing
                        time=datetime.utcfromtimestamp(item["dt"]),
                        temperature=item["main"]["temp"],
                        rain_probability=item.get("pop", 0) * 100,
                        description=item["weather"][0]["description"]
                    ))
                return forecast_list
            else:
                print(f"❌ Forecast API error {response.status_code}. Using mock.")
                return mock_forecast

        except httpx.RequestError as e:
            print(f"❌ Forecast API connection failed: {e}. Using mock.")
            return mock_forecast
        except Exception as e:
            print(f"❌ Unexpected error in forecast service: {e}. Using mock.")
            return mock_forecast

# Global instance
weather_service = WeatherService()
