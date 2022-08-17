require('dotenv').config()
console.log(process.env.BOT_ID)

'use-strict';

// @ts-ignore
import notifier from 'mail-notifier';
import { Markup, Telegraf } from 'telegraf';
import fs from 'fs';
import chalk from 'chalk';
import { dirname } from 'path';

const bot_id:string = process.env.BOT_ID as string
const bot = new Telegraf(bot_id);

const chatid = process.env.CHAT_ID;

const imap = {
  user: process.env.EMAIL,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.PORT,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

// The Mail Server Object
const mailServer = notifier(imap);

// @ts-ignore
mailServer.on('mail', (mail) => {
  bot.telegram.sendMessage(
    String(chatid),
    `New Mail Recieved\n` +
    `From Name • \`${mail.from[0].name}\`\n` +
    `From Mail • \`${mail.from[0].address}\`\n` +
    `Subject • \`${mail.subject}\`\n` +
    `Date • \`${mail.date}\`\n` +
    `Priority • \`${mail.priority}\`\n` +
    `Text • \`${(mail.text != undefined || mail.text != '') ? mail.text?.length >= 176 ? mail.text.slice(0, 175) + '...+' : mail.text : "\`Couldn't Get That!\`"}\``
  ).catch((err) => {
    console.error(
      chalk.magentaBright(
        `[ ${chalk.greenBright(new Date().toLocaleTimeString())} ] Error: Couldn't Send Message\nErrorMessage: ${err.message}`
      ),
    );
  });
});

bot.command('start', async (ctx) => {
  const masterUser = await bot.telegram.getChatMember(String(chatid), Number(chatid));
  ctx.reply(
    'Привет я бот EmailKBAisBot\n'
  );
});

bot.command(['help', 'commands'], async (ctx) => {
  ctx.reply(
    '*These Are My Following Commands ->*\n\n' +
    '/start • Start The Bot\n' +
    '/commands • See This Message\n' +
    '/uptime • To See My Uptime\n',
    {
      parse_mode: 'Markdown',
    }
  );
});

bot.command('uptime', async (ctx) => {
  const masterUser = await bot.telegram.getChatMember(String(chatid), Number(chatid));
  const hours = Math.floor(process.uptime() / 3600);
  const minutes = Math.floor((process.uptime() - hours * 3600) / 60);
  const seconds = Math.floor(process.uptime() - hours * 3600 - minutes * 60);
  const upTime = (hours > 0 ? hours + "h " : "") + (minutes > 0 ? minutes + "m " : "") + seconds + "s";
  ctx.reply(`👋Hi ${masterUser.user.first_name}\n\nI am running for almost \`${upTime}\``, {parse_mode: 'Markdown'});
});

mailServer.on('connected', () => {
  console.log(chalk.magentaBright(`[ ${chalk.greenBright(new Date().toLocaleTimeString())} ] Connected To The Mail Server...`));
});

mailServer.on('error', (error: Error) => {
  console.error(chalk.redBright(`[ Error ]: ${chalk.red(error.message)}`));
});

mailServer.start();
bot.launch().then(() => {
  console.log(chalk.magentaBright(`[ ${chalk.greenBright(new Date().toLocaleTimeString())} ] Telegram Bot Started...`));
}).catch((error: Error) => {
  console.error(chalk.redBright(`[ ${chalk.greenBright('Error')} ]: ${chalk.yellowBright(error.message)}`));
});
