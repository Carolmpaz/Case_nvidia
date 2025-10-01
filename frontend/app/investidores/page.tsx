"use client"

import { useState, useEffect, useMemo } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, MapPin, Building2, DollarSign, Plus, Trophy, TrendingUp, X } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

const apiUrl = process.env.REACT_APP_API_URL;

export default function InvestidoresPage() {
  const [startups, setStartups] = useState<any[]>([])
  const [investors, setInvestors] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newInvestor, setNewInvestor] = useState({
    name: "",
    origin: "",
    preferredSector: "",
    description: "",
    website: "",
  })
  const [selectedSector, setSelectedSector] = useState("")

  // Buscar startups do backend
  useEffect(() => {
    async function fetchStartups() {
      try {
        const res = await fetch(`${apiUrl}/startups`)// ajuste sua API
        if (!res.ok) throw new Error("Erro na resposta da API")
        const data = await res.json()

        const normalized = data.map((s: any) => ({
          name: s.nome,
          sector: s.setor,
          country: s.pais ?? "N/A",
          foundedYear: s.ano_fundacao,
          lastInvestment: s.valor_investimento ?? "R$ 0",
          investor: s.vc_investidor ?? "N/A",
          website: s.site ?? "",
          description: s.descricao_breve ?? "",
        }))

        setStartups(normalized)
      } catch (error) {
        console.error("Erro ao carregar startups:", error)
      }
    }
    fetchStartups()
  }, [])

  // Criar lista de investidores a partir das startups + novos investidores adicionados
  useEffect(() => {
    const investorsMap: Record<string, any> = {}

    // Agregar investidores das startups (considera múltiplos separados por vírgula)
    startups.forEach((s) => {
      if (!s.investor) return
      const valor = Number.parseFloat((s.lastInvestment ?? "0").replace(/[^\d,]/g, "").replace(",", ".")) || 0
      const investorList = (s.investor ?? "")
        .split(",")
        .map((i: string) => i.trim())
        .filter(Boolean)
      investorList.forEach((key) => {
        if (!investorsMap[key]) {
          investorsMap[key] = {
            name: key,
            origin: "N/A",
            preferredSector: "N/A",
            description: "",
            website: "",
            totalInvested: valor,
            startupsCount: 1,
          }
        } else {
          investorsMap[key].totalInvested += valor
          investorsMap[key].startupsCount += 1
        }
      })
    })

    

    setInvestors(Object.values(investorsMap))
  }, [startups])

  const sectors = [...new Set(investors.map((i) => i.preferredSector))].filter(Boolean).sort()

  // Filtragem dinâmica
  const filteredInvestors = useMemo(() => {
    return investors.filter((investor) => {
      const matchesSearch =
        investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.preferredSector.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSector = !selectedSector || investor.preferredSector === selectedSector
      return matchesSearch && matchesSector
    })
  }, [investors, searchTerm, selectedSector])

  // Ranking por total investido
  const topInvestors = [...investors]
    .sort((a, b) => b.totalInvested - a.totalInvested)
    .slice(0, 5)

  // Estatísticas
  const totalInvested = investors.reduce((acc, i) => acc + (i.totalInvested || 0), 0)

  const handleAddInvestor = () => {
    setInvestors([
      ...investors,
      { ...newInvestor, totalInvested: 0, startupsCount: 0 },
    ])
    setIsAddDialogOpen(false)
    setNewInvestor({ name: "", origin: "", preferredSector: "", description: "", website: "" })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedSector("")
  }

  const hasActiveFilters = searchTerm || selectedSector

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investidores"
        description={`Explore ${investors.length} investidores do ecossistema de startups`}
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
           
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
          
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome do investidor"
                  value={newInvestor.name}
                  onChange={(e) => setNewInvestor({ ...newInvestor, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origem</Label>
                <Input
                  id="origin"
                  placeholder="País/região de origem"
                  value={newInvestor.origin}
                  onChange={(e) => setNewInvestor({ ...newInvestor, origin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Setor Preferido</Label>
                <Select
                  value={newInvestor.preferredSector}
                  onValueChange={(value) => setNewInvestor({ ...newInvestor, preferredSector: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://exemplo.com"
                  value={newInvestor.website}
                  onChange={(e) => setNewInvestor({ ...newInvestor, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Breve descrição do investidor"
                  value={newInvestor.description}
                  onChange={(e) => setNewInvestor({ ...newInvestor, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddInvestor}>Adicionar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de investidores */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Input
              placeholder="Buscar investidores por nome, origem ou setor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4"
            />
          </div>

          {filteredInvestors.length > 0 ? (
            <div className="space-y-4">
              {filteredInvestors.map((investor, index) => (
                <Card key={index} className="hover:border-primary/20 transition-all duration-300 hover:glow-green-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-foreground">{investor.name}</h3>
                          <Badge variant="secondary">{investor.preferredSector}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{investor.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{investor.origin}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span>{investor.startupsCount} startups</span>
                          </div>
                          <div className="flex items-center space-x-2 text-primary">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">R$ {investor.totalInvested.toLocaleString()}</span>
                          </div>
                          {investor.website && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={investor.website} target="_blank" rel="noopener noreferrer" className="text-xs">
                                Visitar site
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="Nenhum investidor encontrado"
              description="Tente ajustar o termo de busca ou adicione um novo investidor."
            >
              <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                Adicionar Investidor
              </Button>
            </EmptyState>
          )}
        </div>

        {/* Ranking e Estatísticas */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center space-x-2">
              <Trophy className="w-5 h-5 text-primary" />
              <CardTitle>Ranking por Volume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topInvestors.map((investor, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{investor.name}</p>
                    <p className="text-sm text-primary font-semibold">R$ {investor.totalInvested.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de Investidores</span>
                  <span className="font-semibold text-foreground">{investors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volume Total</span>
                  <span className="font-semibold text-primary">R$ {totalInvested.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
