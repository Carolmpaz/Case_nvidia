from app.db import engine
from app.models import Base
from apscheduler.schedulers.background import BackgroundScheduler
from fetch_data import fetch_and_save

def init():
    Base.metadata.create_all(bind=engine)
if __name__ == '__main__':
    init()
    print('DB initialized')



scheduler = BackgroundScheduler()
# todo dia às 7h
scheduler.add_job(fetch_and_save, 'cron', hour=7, minute=0)
scheduler.start()

# seu backend continua rodando normalmente
