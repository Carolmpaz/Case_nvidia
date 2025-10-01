from datetime import date
from pydantic import BaseModel, Field

class StartupCreate(BaseModel):
    nome: str = Field(..., alias="Nome da Startup")
    site: str = Field(..., alias="Site")
    setor: str = Field(..., alias="Setor")
    ano_fundacao: int = Field(..., alias="Ano de Fundação")
    valor_investimento: str = Field(..., alias="Valor do Investimento (em reais)")
    rodada: str = Field(..., alias="Rodada")
    data_investimento: date = Field(..., alias="Data do Investimento")
    vc_investidor: str = Field(..., alias="VC Investidor")
    descricao_breve: str = Field(..., alias="Descrição Breve")
    linkedin_fundador: str = Field(..., alias="LinkedIn do Fundador")
    localizacao: str = Field(..., alias="Localização (país)")