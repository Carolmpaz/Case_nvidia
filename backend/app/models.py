from sqlalchemy import Column, Integer, String, Text, Date, TIMESTAMP, Float, create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Startup(Base):
    __tablename__ = "startups"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    site = Column(String)
    setor = Column(String)
    ano_fundacao = Column(Integer)
    valor_investimento = Column(String)
    rodada = Column(String)
    data_investimento = Column(Date)
    vc_investidor = Column(String)
    descricao_breve = Column(Text)
    linkedin_fundador = Column(String)
    localizacao = Column(String)
    atualizado_em = Column(TIMESTAMP)

class Investidor(Base):
    __tablename__ = "investidores"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    origem = Column(String)
    setor_preferido = Column(String)
