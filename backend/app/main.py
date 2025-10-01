from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date
from pydantic import BaseModel
from . import models, db, schemas
import httpx, io, csv
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Startups API")

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],  # altere para o domínio do seu frontend
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

PERPLEXY_KEY = os.getenv("PERPLEXY_API_KEY")
vc = ["Kaszek", "Monashees", "Softbank LatAm", "Astella Investimentos", "Valor Capital Group", "Bossanova", "Angel Ventures", "Crescera Capital", "QED Investors"]


# Verify that the API key is available
if not PERPLEXY_KEY:
    raise ValueError("PERPLEXY_API_KEY environment variable not set")
PERPLEXY_URL = "https://api.perplexity.ai/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {PERPLEXY_KEY}",
    "Content-Type": "application/json"
}

class StartupCreate(BaseModel):
    nome: str
    site: str 
    setor: str 
    ano_fundacao: int 
    valor_investimento: str 
    rodada: str 
    data_investimento: date 
    vc_investidor: str 
    descricao_breve: str 
    linkedin_fundador: str 
    localizacao: str 

def parse_int(value):
    if value and value.strip().isdigit():
        return int(value.strip())
    return None

def fetch_startup_data(nome: str):
    payload = {
            "model": "sonar-pro",
    "messages": [
        {"role": "system", "content": "Você é um assistente especializado em fornecer dados estruturados de startups."},
        {"role": "user", "content": f"""
        Liste exatamente 10 startups investidas pelo VC {vc} em formato CSV.

        As colunas devem ser exatamente nesta ordem:
        Nome da Startup; Site; Setor; Ano de Fundação; Valor do Investimento (em reais); Rodada; Data do Investimento; VC Investidor; Descrição Breve; LinkedIn do Fundador; Localização (país)

        Regras:
        - Nunca deixe nenhum campo vazio. Se não houver informação, escreva 'Desconhecido'.
        - Use sempre ponto e vírgula (;) como separador de colunas.
        - Retorne apenas a tabela em CSV puro, sem markdown, sem cabeçalho extra e sem comentários.
        - A tabela deve conter exatamente 11 linhas: 1 cabeçalho + 10 startups.

        Exemplo de formato esperado (apenas ilustrativo, substitua pelos dados corretos):

        Nome da Startup; Site; Setor; Ano de Fundação; Valor do Investimento (em reais); Rodada; Data do Investimento; VC Investidor; Descrição Breve; LinkedIn do Fundador; Localização (país)
        Startup A; www.startupa.com; Fintech; 2018; 5.000.000; Série A; 2021-06-15; {vc}; Plataforma de pagamentos digitais; linkedin.com/in/fundadorA; Brasil
        Startup B; www.startupb.com; Healthtech; 2019; 2.500.000; Seed; 2020-11-20; {vc}; App de consultas médicas; linkedin.com/in/fundadorB; EUA
        ...
        Startup J; www.startupj.com; Edtech; 2017; 8.000.000; Série B; 2022-05-10; {vc}; Plataforma de ensino online; linkedin.com/in/fundadorJ; Canadá
        """}
        ]
    }

    try:
        r = httpx.post(PERPLEXY_URL, json=payload, headers=HEADERS, timeout=60)
        if r.status_code != 200:
            print("Erro Perplexy:", r.status_code, r.text)
            return []

        data = r.json()
        csv_text = data["choices"][0]["message"]["content"]
        print("==== CSV recebido da API ====")
        print(csv_text)
        csv_text = csv_text.replace("```csv", "").replace("```", "").strip()
        reader = csv.DictReader(io.StringIO(csv_text), delimiter=';')
        rows = list(reader)
        startups = []
        for row in rows:
            row_clean = {k.strip(): v.strip() if isinstance(v, str) else v for k, v in row.items()}
            # Trata vc_investidor para remover colchetes e aspas
            vc_raw = row_clean.get("VC Investidor")
            if vc_raw:
                if isinstance(vc_raw, str) and vc_raw.startswith("["):
                    vc_raw = vc_raw.replace("[", "").replace("]", "").replace("'", "").strip()
                    row_clean["VC Investidor"] = ", ".join([v.strip() for v in vc_raw.split(",")])
            # Trata data_investimento para converter para date
            data_raw = row_clean.get("Data do Investimento")
            if data_raw:
                try:
                    # Tenta YYYY-MM-DD
                    row_clean["Data do Investimento"] = datetime.strptime(data_raw, "%Y-%m-%d").date()
                except:
                    try:
                        # Tenta YYYY-MM
                        row_clean["Data do Investimento"] = datetime.strptime(data_raw, "%Y-%m").date()
                    except:
                        try:
                            # Tenta DD/MM/YYYY
                            row_clean["Data do Investimento"] = datetime.strptime(data_raw, "%d/%m/%Y").date()
                        except:
                            row_clean["Data do Investimento"] = None
            try:
                startup = schemas.StartupCreate.parse_obj(row_clean)
                startups.append(startup.dict())
            except Exception as e:
                print("Erro ao converter linha do CSV:", row_clean, e)
        return startups
    except Exception as e:
        print("Erro ao buscar dados da API:", e)
        return []

@app.post("/api/startups")
def create_startup(payload: StartupCreate, session: Session = Depends(db.get_session)):
    exists = session.query(models.Startup).filter(models.Startup.nome == payload.nome).first()
    
    # Busca dados da API Perplexy
    api_startups = fetch_startup_data(payload.nome)
    # Se a API retornar startups, atualize ou insira cada uma
    if api_startups:
        results = []
        for api_data in api_startups:
            # Tratar data_investimento
            data = api_data.get("data_investimento")
            if data is None or (isinstance(data, str) and not data.strip()):
                api_data["data_investimento"] = None
            else:
                try:
                    api_data["data_investimento"] = datetime.strptime(data, "%d/%m/%Y").date()
                except:
                    try:
                        api_data["data_investimento"] = datetime.strptime(data, "%Y-%m-%d").date()
                    except:
                        api_data["data_investimento"] = None

            # Não sobrescreva vc_investidor se já existe valor
            if not api_data.get("vc_investidor"):
                api_data["vc_investidor"] = "Desconhecido"

            exists = session.query(models.Startup).filter(models.Startup.nome == api_data["nome"]).first()
            if exists:
                for field, value in api_data.items():
                    if value is not None:
                        setattr(exists, field, value)
                exists.atualizado_em = datetime.utcnow()
                session.commit()
                session.refresh(exists)
                results.append(exists)
            else:
                s = models.Startup(**api_data, atualizado_em=datetime.utcnow())
                session.add(s)
                session.commit()
                session.refresh(s)
                results.append(s)
        return [r.__dict__ for r in results]
    # Se não veio nada da API, insere/atualiza normalmente
    payload_dict = payload.dict()
    data = payload_dict.get("data_investimento")
    if data is None or (isinstance(data, str) and not data.strip()):
        payload_dict["data_investimento"] = None
    else:
        try:
            payload_dict["data_investimento"] = datetime.strptime(data, "%d/%m/%Y").date()
        except:
            try:
                payload_dict["data_investimento"] = datetime.strptime(data, "%Y-%m-%d").date()
            except:
                payload_dict["data_investimento"] = None

    # Não sobrescreva vc_investidor se já existe valor
    if not payload_dict.get("vc_investidor"):
        payload_dict["vc_investidor"] = "Desconhecido"

    if exists:
        for field, value in payload_dict.items():
            if value is not None:
                setattr(exists, field, value)
        exists.atualizado_em = datetime.utcnow()
        session.commit()
        session.refresh(exists)
        return exists
    s = models.Startup(**payload_dict, atualizado_em=datetime.utcnow())
    session.add(s)
    session.commit()
    session.refresh(s)
    return s

@app.get('/api/startups')
def list_startups(skip: int = 0, limit: int = 100, session: Session = Depends(db.get_session)):
    items = session.query(models.Startup).offset(skip).limit(limit).all()
    def serialize(item):
        d = item.__dict__.copy()
        d.pop('_sa_instance_state', None)
        return d
    result = [serialize(item) for item in items]
    session.close()  # Fecha a sessão para liberar conexão
    return result