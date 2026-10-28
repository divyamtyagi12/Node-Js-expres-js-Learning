import https from 'https';
import chalk from 'chalk';
const url = 'https://official-joke-api.appspot.com/random_joke';
https.get(url,(response)=>{
  let data="";
  response.on('data',(chunk)=>{
    data+=chunk;
  });
  response.on('end',()=>{
    const joke = JSON.parse(data);
    console.log(chalk.green(joke.setup));
    console.log(chalk.yellow(joke.punchline));
  });
});