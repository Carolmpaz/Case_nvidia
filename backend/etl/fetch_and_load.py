import httpx, io, csv
import os
from datetime import datetime
from dotenv import load_dotenv
from app.db import get_session
from app.models import Startup

# Load environment variables from .env file
load_dotenv()

vc = ["Kaszek", "Monashees", "Softbank LatAm", "Astella Investimentos", "Valor Capital Group", "Bossanova", "Angel Ventures", "Crescera Capital", "QED Investors"]

PERPLEXY_KEY = os.getenv("PERPLEXY_API_KEY")
PERPLEXY_URL = "https://api.perplexity.ai/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {PERPLEXY_KEY}",
    "Content-Type": "application/json"
}

def parse_int(value):
    """Converte para int, retorna None se vazio ou inválido"""
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
            return {}

        data = r.json()
        csv_text = data["choices"][0]["message"]["content"]
        csv_text = csv_text.replace("```csv", "").replace("```", "").strip()
        reader = csv.DictReader(io.StringIO(csv_text), delimiter=';')
        rows = list(reader)
        if not rows:
            return {}

        row = rows[0]
        # Campos tratados
        ano_fundacao = parse_int(row.get("Ano de Fundação"))
        valor_investimento = row.get("Valor do Investimento (em reais)")
        data_investimento = row.get("Data do Investimento")
       

        # Retorna dicionário pronto
        return {
            "nome": row.get("Nome da Startup") or nome,
            "site": row.get("Site"),
            "setor": row.get("Setor"),
            "ano_fundacao": ano_fundacao,
            "valor_investimento": valor_investimento.strip() if valor_investimento else None,
            "rodada": row.get("Rodada"),
            "data_investimento": data_investimento.strip() if data_investimento else None,
            "vc_investidor": row.get("VC Investidor"),
            "descricao_breve": row.get("Descrição Breve"),
            "linkedin_fundador": row.get("LinkedIn do Fundador"),
            "localizacao": row.get("Localização (país)")
        }

    except Exception as e:
        print("Erro ao buscar dados da API:", e)
        return {}

def fetch_startups(vcs):
    results = []
    with httpx.Client(timeout=60.0) as client:
        for vc in vcs:
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

            r = client.post(PERPLEXY_URL, json=payload, headers=HEADERS)
            if r.status_code != 200:
                print("Erro Perplexy:", r.status_code, r.text)
                continue

            data = r.json()
            csv_text = data["choices"][0]["message"]["content"]
            csv_text = csv_text.replace("```csv", "").replace("```", "").strip()
            reader = csv.DictReader(io.StringIO(csv_text), delimiter=';')

            for it in reader:
                results.append({
                    "nome": it.get("Nome da Startup"),
                    "site": it.get("Site"),
                    "setor": it.get("Setor"),
                    "ano_fundacao": parse_int(it.get("Ano de Fundação")),
                    "valor_investimento": it.get("Valor do Investimento (em reais)").strip() if it.get("Valor do Investimento (em reais)") else None,
                    "rodada": it.get("Rodada"),
                    "data_investimento": it.get("Data do Investimento").strip() if it.get("Data do Investimento") else None,
                    "vc_investidor": it.get("VC Investidor") or vc,
                    "descricao_breve": it.get("Descrição Breve"),
                    "linkedin_fundador": it.get("LinkedIn do Fundador"),
                    "localizacao": it.get("localizacao")
                })
    return results

def upsert_startups(items):
    session = get_session()
    try:
        for it in items:
            # Verifica se já existe startup com mesmo nome
            q = session.query(Startup).filter(Startup.nome == it['nome']).first()
            if q:
                # Atualiza campos existentes
                for k, v in it.items():
                    if v is not None:
                        setattr(q, k, v)
                q.atualizado_em = datetime.utcnow()
            else:
                s = Startup(**it, atualizado_em=datetime.utcnow())
                session.add(s)
        session.commit()
    finally:
        session.close()

if __name__ == '__main__':
    startups = fetch_startups(vc)
    upsert_startups(startups)
    print(f"Importadas {len(startups)} startups.")