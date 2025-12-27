import 'dotenv/config';
import { Telegraf } from 'telegraf';

const token = process.env.TELEGRAM_BOT_TOKEN;

console.log('Testing Telegram Bot Connection...');
console.log('Token:', token ? `${token.substring(0, 10)}...` : 'MISSING');

const bot = new Telegraf(token);

// Test getting bot info
bot.telegram.getMe()
  .then((botInfo) => {
    console.log('✅ Bot connection successful!');
    console.log('Bot Info:');
    console.log('  - Username:', botInfo.username);
    console.log('  - Name:', botInfo.first_name);
    console.log('  - ID:', botInfo.id);
    console.log('\n🎉 Your bot is working! You can now start the full bot with: npm run bot');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Bot connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('401')) {
      console.error('\n💡 The bot token is invalid or expired.');
      console.error('   Please check your TELEGRAM_BOT_TOKEN in .env file');
      console.error('   Get a new token from @BotFather in Telegram');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.error('\n💡 Network connection issue.');
      console.error('   Please check your internet connection');
    } else {
      console.error('\n💡 Unknown error. Full details:');
      console.error(error);
    }
    
    process.exit(1);
  });
