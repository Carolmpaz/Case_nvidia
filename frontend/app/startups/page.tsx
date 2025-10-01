"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X, Building2 } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { StartupCard } from "@/components/ui/startup-card"

export default function StartupsPage() {
  const [startups, setStartups] = useState<any[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSector, setSelectedSector] = useState<string>("")
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [selectedInvestor, setSelectedInvestor] = useState<string>("")
  const [selectedInvestmentRange, setSelectedInvestmentRange] = useState<string>("")

  const investmentRanges = [
    { label: "Até R$ 5M", min: 0, max: 5 },
    { label: "R$ 5M - R$ 15M", min: 5, max: 15 },
    { label: "R$ 15M - R$ 25M", min: 15, max: 25 },
    { label: "Acima de R$ 25M", min: 25, max: Number.POSITIVE_INFINITY },
  ]

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    async function fetchStartups() {
      try {
        const res = await fetch(`${apiUrl}/startups`)
        if (!res.ok) throw new Error("Erro na resposta da API")
        const data = await res.json()

        // Normaliza os campos do backend para o formato usado no frontend
        const normalized = data.map((s: any) => ({
          name: s.nome,
          sector: s.setor,
          foundedYear: s.ano_fundacao,
          lastInvestment: s.valor_investimento,
          investor: s.vc_investidor,
          website: s.site,
          // campos extras (se quiser usar depois)
          round: s.rodada,
          description: s.descricao_breve,
          founderLinkedin: s.linkedin_fundador,
          country: s.localizacao
        }))

        setStartups(normalized)
      } catch (error) {
        console.error("Erro ao carregar startups:", error)
      }
    }
    fetchStartups()
  }, [])


  const sectors = [...new Set(startups.map((s) => s.sector ?? ""))].filter(Boolean).sort()
  // Gera lista de países únicos automaticamente a partir dos dados do banco
  const countries = [...new Set(startups.map((s) => s.country ?? ""))].filter(Boolean).sort()
  // Gera lista de investidores únicos, considerando apenas o primeiro investidor de cada startup
  const investors = [
    ...new Set(
      startups
        .map((s) =>
          (s.investor ?? "")
            .split(",")[0]
            .trim()
        )
        .filter(Boolean)
    ),
  ].sort()

  // Para mostrar todos os investidores separadamente e contar o valor/quantidade por investidor:
  // Exemplo de estrutura para uso futuro:
  // const investorStats = {};
  // startups.forEach((s) => {
  //   const investorList = (s.investor ?? "").split(",").map((i: string) => i.trim()).filter(Boolean);
  //   investorList.forEach((inv) => {
  //     if (!investorStats[inv]) investorStats[inv] = { count: 0, total: 0 };
  //     investorStats[inv].count += 1;
  //     investorStats[inv].total += Number.parseFloat((s.lastInvestment ?? "0").replace(/[^\d,]/g, "").replace(",", "."));
  //   });
  // });

  const filteredStartups = useMemo(() => {
    return startups.filter((startup) => {
      const matchesSearch = (startup.name ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesSector = !selectedSector || (startup.sector ?? "") === selectedSector
      const matchesCountry = !selectedCountry || (startup.country ?? "") === selectedCountry
      // Filtra pelo primeiro investidor apenas
      const matchesInvestor =
        !selectedInvestor ||
        ((startup.investor ?? "").split(",")[0].trim() === selectedInvestor)

      let matchesInvestmentRange = true
      if (selectedInvestmentRange) {
        const range = investmentRanges.find((r) => r.label === selectedInvestmentRange)
        if (range) {
          const investmentValue = Number.parseFloat(
            (startup.lastInvestment ?? "0").replace(/[^\d,]/g, "").replace(",", ".")
          )
          matchesInvestmentRange = investmentValue >= range.min && investmentValue <= range.max
        }
      }

      return matchesSearch && matchesSector && matchesCountry && matchesInvestor && matchesInvestmentRange
    })
  }, [startups, searchTerm, selectedSector, selectedCountry, selectedInvestor, selectedInvestmentRange])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedSector("")
    setSelectedCountry("")
    setSelectedInvestor("")
    setSelectedInvestmentRange("")
  }

  const hasActiveFilters =
    searchTerm || selectedSector || selectedCountry || selectedInvestor || selectedInvestmentRange

  return (
    <div className="space-y-6">
      <PageHeader
        title="Startups"
        description={`Explore ${startups.length} startups em nosso portfólio com filtros avançados`}
      />

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar startups por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Linha de filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedInvestor} onValueChange={setSelectedInvestor}>
                <SelectTrigger>
                  <SelectValue placeholder="Investidor" />
                </SelectTrigger>
                <SelectContent>
                  {investors.map((investor) => (
                    <SelectItem key={investor} value={investor}>
                      {investor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedInvestmentRange} onValueChange={setSelectedInvestmentRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Faixa de Investimento" />
                </SelectTrigger>
                <SelectContent>
                  {investmentRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtros ativos */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Busca: {searchTerm}</span>
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                    </Badge>
                  )}
                  {selectedSector && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>{selectedSector}</span>
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSector("")} />
                    </Badge>
                  )}
                  {selectedCountry && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>{selectedCountry}</span>
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCountry("")} />
                    </Badge>
                  )}
                  {selectedInvestor && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>{selectedInvestor}</span>
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedInvestor("")} />
                    </Badge>
                  )}
                  {selectedInvestmentRange && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>{selectedInvestmentRange}</span>
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedInvestmentRange("")} />
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center space-x-1">
                  <X className="w-4 h-4" />
                  <span>Limpar filtros</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredStartups.length} startup{filteredStartups.length !== 1 ? "s" : ""} encontrada
          {filteredStartups.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Ordenar por relevância</span>
        </div>
      </div>

      {/* Grid de Startups */}
      {filteredStartups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStartups.map((startup, index) => (
            <StartupCard key={index} {...startup} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="Nenhuma startup encontrada"
          description="Tente ajustar os filtros para encontrar startups que correspondam aos seus critérios."
        >
          <Button onClick={clearFilters} className="mt-4">
            Limpar filtros
          </Button>
        </EmptyState>
      )}
    </div>
  )
}