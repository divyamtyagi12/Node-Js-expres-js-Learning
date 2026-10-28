import https from"https";
import chalk from"chalk";
import readline from"readline";
const r1=readline.createInterface({input:process.stdin,output:process.stdout});
const url=`https://api.exchangerate-api.com/v4/latest/USD`;
const apikey="11666e43b75a41ec4e0e7096";
https.get(url,(response)=>{
  let data="";  
  response.on("data",(chunk)=>{
    data+=chunk;
  });
  response.on("end",()=>{
    const rates=JSON.parse(data).rates;
    r1.question("Enter the amount in USD: ",(amount)=>{
      r1.question("Enter the target currency (e.g., EUR, GBP, JPY): ",(currency)=>{
        if(rates[currency]){
          const convertedAmount = parseFloat(amount) * rates[currency];
          console.log(chalk.green(`Converted Amount: ${convertedAmount.toFixed(2)} ${currency}`));
        } else {
          console.log(chalk.red("Invalid currency entered."));
        }
        r1.close();
      });
    });
  });
});