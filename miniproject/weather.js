import readline from"readline/promises";
import https from"https";
import chalk from"chalk";
const r1=readline.createInterface({input:process.stdin,output:process.stdout});
const getWeather=async (city)=>{
  const url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY&units=metric`;
try{
  const response=await fetch(url);
  if(!response.ok){
    throw new Error("City not found");
  } 
  const weatherData=await response.json();
  const temperature=weatherData.main.temp;
  const description=weatherData.weather[0].description;
  console.log(chalk.green(`Temperature in ${city}: ${temperature}°C`));
  console.log(chalk.yellow(`Weather description: ${description}`));
}
catch(error){
  console.error(chalk.red(error.message));
}
}

const city=await r1.question("Enter the city name: ");
getWeather(city);
r1.close();