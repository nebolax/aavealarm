import logging
import os

from aiogram import Bot
from dotenv import load_dotenv

load_dotenv()

TG_BOT_TOKEN = os.environ['TG_BOT_TOKEN']
TG_ADMIN_ID = 327150749

bot = Bot(token=TG_BOT_TOKEN, parse_mode='HTML')

async def send_admin_message(text: str):
    try:
        await bot.send_message(TG_ADMIN_ID, text)
    except Exception:
        logging.error('Couldnt send a telegram notification')
