//Libs
import { Telegraf } from "telegraf";
import { code } from "telegraf/format";
import config from "config";

//helpers
import pool from "./db/db.js";
import { useOpenAi } from "./openai.js";
import { formatMeals } from "./shared/formatMeals.js";
import { getCalcMessage } from "./shared/getCalcMessage.js";
import { generateExcelFromSQL } from "./shared/generateExcelFromSQL.js";

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

// Команда /start
bot.command("start", async (ctx) => {
  const userId = ctx.from.id;
  const login = ctx.from.username || null; // Username может быть пустым
  const firstName = ctx.from.first_name || null;
  // const lastName = ctx.from.last_name || null;

  try {
    const result = await pool.query(
      `INSERT INTO users (user_id, first_name, login)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO NOTHING`, // Если пользователь уже существует, ничего не делаем
      [userId, firstName, login]
    );
  } catch (error) {
    ctx.reply(error.message);
  }

  await ctx.reply(config.get("START_MESSAGE"));
});

// Получаем инфу по всем съеденным продуктам за день
bot.command("day", async (ctx) => {
  const userId = ctx.from.id;
  try {
    const result = await pool.query(
      `SELECT * from products where user_id=$1 and date >= current_date`,
      [userId]
    );

    const formattedResponse = formatMeals(result.rows);

    await ctx.reply(formattedResponse);
  } catch (error) {
    ctx.reply(error.message);
  }
});

// Создаем xlxs файл со всеми съеденными продуктами
bot.command("all", async (ctx) => {
  const userId = ctx.from.id;

  try {
    const table = await pool.query(`select * from products where user_id=$1`, [
      userId,
    ]);

    const filePath = await generateExcelFromSQL(table);

    await ctx.replyWithDocument({ source: filePath });
  } catch (error) {
    ctx.reply(error.message);
  }
});

// Запрещаем голосовые сообщения
bot.on("voice", async (ctx) => {
  await ctx.reply(config.get("SORRY_VOICE_MESSAGE"));
});

// Можно также запретить отправку аудио-файлов
bot.on("audio", async (ctx) => {
  await ctx.reply(config.get("SORRY_AUDIO_MESSAGE"));
});

// Команда /help для вывода доступных команд
bot.command("help", async (ctx) => {
  await ctx.reply(`
Доступные команды:
/start - Запустить бота
/help - Показать список команд
/calories [продукт/граммы] - Рассчитать калории продукта
  `);
});

// Основная логика для расчета калорий
bot.on("text", async (ctx) => {
  await ctx.reply(code(config.get("WAIT_SERVER_MESSAGE")));

  const userMessage = ctx.message.text;

  // Формируем сообщения для OpenAI
  const messages = [
    {
      role: "system",
      content: config.get("OPEN_AI_CONTENT"),
    },
    { role: "user", content: userMessage },
  ];

  try {
    // Отправляем сообщение в OpenAI и получаем ответ
    const gptResponse = await useOpenAi(messages);

    if (gptResponse.content !== "null") {
      const calculatedProduct = JSON.parse(gptResponse.content);

      const { product, grams, calories, proteins, fats, carbohydrates } =
        calculatedProduct;

      const userId = ctx.from.id;

      const date = new Date();

      await pool.query(
        `INSERT INTO products (user_id, product, grams, calories, proteins, fats, carbohydrates, "date")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, product, grams, calories, proteins, fats, carbohydrates, date]
      );

      // Отправляем ответ обратно пользователю в Telegram
      await ctx.reply(getCalcMessage(calculatedProduct));
    } else {
      await ctx.reply(config.get("SORRY_AI_MESSAGE"));
    }
  } catch (error) {
    // В случае ошибки отправляем сообщение об ошибке
    await ctx.reply(error.message);
  }
});

// Запуск бота
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
