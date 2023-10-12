// 6425608276:AAERcRUMVXD5UqV9LoC1aWDOz_qB_7P7M5c 446415034

const TelegramBot = require('node-telegram-bot-api');

const token = '6425608276:AAERcRUMVXD5UqV9LoC1aWDOz_qB_7P7M5c';
const adminChatId = '446415034'; // Замените на ID чата администратора

const bot = new TelegramBot(token, { polling: true });

let currentRequestId = 1;

const steps = {
  1: 'name',
  2: 'portions',
  3: 'addressType',
  4: 'address',
  5: 'phoneNumber',
};

const userData = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  userData[userId] = { step: 1, requestId: currentRequestId++ };
  bot.sendMessage(chatId, 'Привет! Пожалуйста, введите ваше имя:');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (userData[userId]) {
    const currentStep = steps[userData[userId].step];
    userData[userId][currentStep] = text;

    if (userData[userId].step === 3 && text === 'Другой') {
      userData[userId].step = 4;
      bot.sendMessage(chatId, 'Введите адрес:');
    } else if (userData[userId].step === 3 && text === 'Fido-Biznes') {
      userData[userId].step = 5;
      bot.sendMessage(chatId, 'Введите номер телефона:');
    } else if (userData[userId].step === 4) {
      userData[userId].step = 5;
      bot.sendMessage(chatId, 'Введите номер телефона:');
    } else if (userData[userId].step === 5) {
      const username = msg.from.username || 'N/A'; // Имя аккаунта клиента

      // Создаем клавиатуру с кнопкой "Новый заказ"
      const markup = {
        inline_keyboard: [
          [{ text: 'Новый заказ', callback_data: 'new_order' }],
        ],
      };

      bot.sendMessage(chatId, 'Заявка успешно отправлена. Ожидайте ответа администратора.', {
        reply_markup: markup,
      });

      // Отправляем данные администратору
      bot.sendMessage(adminChatId, `Новая заявка № ${userData[userId].requestId}:
Имя: ${userData[userId].name}
Количество порций: ${userData[userId].portions}
Компания: ${userData[userId].addressType}
Адрес: ${userData[userId].address}
Номер телефона: ${userData[userId].phoneNumber}
Аккаунт клиента: @${username}`);
      delete userData[userId];
    } else {
      userData[userId].step += 1;
      let message = '';
      switch (userData[userId].step) {
        case 2:
          message = 'Отлично! Теперь введите количество порций:';
          break;
        case 3:
          message = 'Отлично! Теперь выберите адрес:';
          const replyMarkup = {
            keyboard: [['Fido-Biznes', 'Другой']],
            resize_keyboard: true,
            one_time_keyboard: true,
          };
          bot.sendMessage(chatId, message, { reply_markup: replyMarkup });
          return;
        case 4:
          message = 'Отлично! Теперь введите адрес:';
          break;
      }
      bot.sendMessage(chatId, message);
    }
  }
});

bot.on('callback_query', (callbackQuery) => {
  if (callbackQuery.data === 'new_order') {
    const chatId = callbackQuery.message.chat.id;
    userData[chatId] = { step: 1, requestId: currentRequestId++ };
    bot.sendMessage(chatId, 'Привет! Пожалуйста, введите ваше имя:');
  }
});

console.log('Бот запущен.');


