// import config from "../config";
import TelegramBot from "node-telegram-bot-api";

const TELEGRAM_BOT_TOKEN ='5961574191:AAEh7ELA8ja-2Vi6EOEGeC8MU69Vl_c8yvg'
const TELEGRAM_CHAT_ID = '-1001611584440'

class TelegramService {
   send = async (text) => {
      try {
         if(!text) return
         const telegrambot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
            polling: true,
         });
         await telegrambot.sendMessage(
            TELEGRAM_CHAT_ID,
            text
         );
         // telegrambot.on('message',(m)=>{
         //    console.log(m.text);
         //    telegrambot.sendMessage(
         //       TELEGRAM_CHAT_ID,
               // m.text
         //    );
         // })
      } catch (error) {
         throw error;
      }
   };
}

export default new TelegramService();
