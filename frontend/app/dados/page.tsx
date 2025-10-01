"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, ArrowUpDown, Filter, FileSpreadsheet, FileText } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

const apiUrl = process.env.REACT_APP_API_URL;


type Startup = {
  id: number
  name: string
  sector: string
  country: string
  city: string
  foundedYear: number
  lastInvestment: string
  totalRaised: string
  investor: string
  stage: string
  website: string
  status: string
  localizacao: string
}

type SortField = keyof Startup
type SortDirection = "asc" | "desc"

export default function DadosPage() {
  const [data, setData] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [filterSector, setFilterSector] = useState<string>("")
  const [filterCountry, setFilterCountry] = useState<string>("")
  const [filterStage, setFilterStage] = useState<string>("")

  // 🔄 Carrega dados da API e normaliza
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${apiUrl}/startups`)
        if (!res.ok) throw new Error("Erro ao buscar startups")

        const apiData = await res.json()
        console.log("📊 Dados crus da API:", apiData)

        const normalized = apiData.map((s: any) => ({
          id: s.id,
          name: s.nome,
          sector: s.setor,
          country: s.localizacao ?? "N/A",
          city: s.localizacao ?? "N/A",
          foundedYear: s.ano_fundacao,
          lastInvestment: s.valor_investimento,
          totalRaised: s.valor_investimento,
          investor: s.vc_investidor,
          stage: s.rodada,
          website: s.site,
          status: "Ativa", // fixo por enquanto
        }))

        console.log("✅ Dados normalizados:", normalized)
        setData(normalized)
      } catch (error) {
        console.error("❌ Erro ao carregar startups:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Valores únicos para filtros
  const sectors = [...new Set(data.map((s) => s.sector))].sort()
  const countries = [...new Set(data.map((s) => s.country))].sort()
  const stages = [...new Set(data.map((s) => s.stage))].sort()

  // Filtros + ordenação
  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter((startup) => {
      const matchesSearch =
        startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startup.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startup.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startup.investor.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSector = !filterSector || startup.sector === filterSector
      const matchesCountry = !filterCountry || startup.country === filterCountry
      const matchesStage = !filterStage || startup.stage === filterStage

      return matchesSearch && matchesSector && matchesCountry && matchesStage
    })

    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return filtered
  }, [data, searchTerm, sortField, sortDirection, filterSector, filterCountry, filterStage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Nome",
      "Setor",
      "País",
      "Cidade",
      "Ano Fundação",
      "Último Investimento",
      "Total Captado",
      "Investidor",
      "Estágio",
      "Website",
      "Status",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredAndSortedData.map((startup) =>
        [
          startup.name,
          startup.sector,
          startup.country,
          startup.city,
          startup.foundedYear,
          startup.lastInvestment,
          startup.totalRaised,
          startup.investor,
          startup.stage,
          startup.website,
          startup.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "startups-data.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterSector("")
    setFilterCountry("")
    setFilterStage("")
  }

  const hasActiveFilters = searchTerm || filterSector || filterCountry || filterStage

  if (loading) {
    return <p className="text-muted-foreground">Carregando dados...</p>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Base de Dados"
        description="Tabela interativa com todos os dados das startups, com possibilidade de ordenação, filtros e exportação"
      >
        <div className="flex items-center space-x-2">
          <Button onClick={exportToCSV} className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </Button>
        
        </div>
      </PageHeader>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros e Busca</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, setor, país ou investidor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filterSector} onValueChange={setFilterSector}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por setor" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por país" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estágio" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {searchTerm && <Badge variant="secondary">Busca: {searchTerm}</Badge>}
                {filterSector && <Badge variant="secondary">{filterSector}</Badge>}
                {filterCountry && <Badge variant="secondary">{filterCountry}</Badge>}
                {filterStage && <Badge variant="secondary">{filterStage}</Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAndSortedData.length} startup{filteredAndSortedData.length !== 1 ? "s" : ""} encontrada
          {filteredAndSortedData.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <ArrowUpDown className="w-4 h-4" />
          <span>
            Ordenado por {sortField} ({sortDirection === "asc" ? "crescente" : "decrescente"})
          </span>
        </div>
      </div>

      {filteredAndSortedData.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                      Nome
                    </TableHead>
                    <TableHead onClick={() => handleSort("sector")} className="cursor-pointer">
                      Setor
                    </TableHead>
                    <TableHead onClick={() => handleSort("country")} className="cursor-pointer">
                      País
                    </TableHead>
                    <TableHead onClick={() => handleSort("foundedYear")} className="cursor-pointer">
                      Fundação
                    </TableHead>
                    <TableHead onClick={() => handleSort("lastInvestment")} className="cursor-pointer">
                      Último Investimento
                    </TableHead>
                    <TableHead onClick={() => handleSort("investor")} className="cursor-pointer">
                      Investidor
                    </TableHead>
                    <TableHead onClick={() => handleSort("stage")} className="cursor-pointer">
                      Estágio
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedData.map((startup) => (
                    <TableRow key={startup.id} className="hover:bg-muted/30">
                      <TableCell>
                        <p className="font-semibold">{startup.name}</p>
                        <p className="text-xs text-muted-foreground">{startup.city}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{startup.sector}</Badge>
                      </TableCell>
                      <TableCell>{startup.country}</TableCell>
                      <TableCell>{startup.foundedYear}</TableCell>
                      <TableCell className="font-semibold text-primary">{startup.lastInvestment}</TableCell>
                      <TableCell>{startup.investor}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{startup.stage}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="text-xs bg-primary/10 text-primary">
                          {startup.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={FileText}
          title="Nenhum dado encontrado"
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
