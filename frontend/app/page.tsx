"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { StartupCard } from "@/components/ui/startup-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, DollarSign, Users, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

const apiUrl = process.env.REACT_APP_API_URL;

// Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts"

interface Startup {
  id: number
  nome: string
  setor: string
  localizacao: string // alterado de 'pais' para 'localizacao'
  ano_fundacao: number
  valor_investimento: string | number
  vc_investidor: string
  site: string
  created_at?: string // caso exista data no banco
}

// Conversor "US$220M" → número em R$
function parseInvestment(value: string | number): number {
  if (typeof value === "number") return value
  if (!value) return 0

  let multiplier = 1
  let clean = value.toUpperCase().trim()

  if (clean.includes("B")) {
    multiplier = 1_000_000_000
    clean = clean.replace("B", "")
  } else if (clean.includes("M")) {
    multiplier = 1_000_000
    clean = clean.replace("M", "")
  }

  let rate = 1
  if (clean.includes("US$")) {
    rate = 5
    clean = clean.replace("US$", "")
  } else if (clean.includes("R$")) {
    clean = clean.replace("R$", "")
  }

  const numeric = parseFloat(clean.replace(",", "."))
  return isNaN(numeric) ? 0 : numeric * multiplier * rate
}

// Formata número abreviado: 3B, 250M, 12K
function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}K`
  return `R$ ${value.toFixed(0)}`
}

export default function DashboardPage() {
  const [kpiData, setKpiData] = useState({
    totalStartups: 0,
    totalStartupsChange: 0,
    totalInvested: 0,
    totalInvestedChange: 0,
    totalInvestors: 0,
    totalInvestorsChange: 0,
    monthlyGrowth: 0,
  })

  const [recentStartups, setRecentStartups] = useState<Startup[]>([])
  const [chartData, setChartData] = useState<{ year: string; total: number }[]>([])

  useEffect(() => {
    async function fetchStartups() {
      try {
        const res = await fetch(`${apiUrl}/startups`)
        const data: Startup[] = await res.json()

        const now = new Date()
        const thisMonth = now.getMonth()
        const lastMonth = (thisMonth - 1 + 12) % 12
        const thisYear = now.getFullYear()
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

        // Filtra startups do mês atual e anterior
        const startupsThisMonth = data.filter(s => {
          const date = s.created_at ? new Date(s.created_at) : new Date(s.ano_fundacao, 0, 1)
          return date.getMonth() === thisMonth && date.getFullYear() === thisYear
        })

        const startupsLastMonth = data.filter(s => {
          const date = s.created_at ? new Date(s.created_at) : new Date(s.ano_fundacao, 0, 1)
          return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
        })

        // Totais
        const totalStartups = data.length
        const totalInvested = data.reduce((sum, s) => sum + parseInvestment(s.valor_investimento), 0)
        const uniqueInvestors = new Set(data.map(s => s.vc_investidor)).size

        // Changes (mês atual vs. anterior)
        const startupsChange = startupsLastMonth.length > 0
          ? startupsThisMonth.length - startupsLastMonth.length
          : startupsThisMonth.length

        const investedThisMonth = startupsThisMonth.reduce((sum, s) => sum + parseInvestment(s.valor_investimento), 0)
        const investedLastMonth = startupsLastMonth.reduce((sum, s) => sum + parseInvestment(s.valor_investimento), 0)
        const investedChange = investedLastMonth > 0
          ? investedThisMonth - investedLastMonth
          : investedThisMonth

        const investorsThisMonth = new Set(startupsThisMonth.map(s => s.vc_investidor)).size
        const investorsLastMonth = new Set(startupsLastMonth.map(s => s.vc_investidor)).size
        const investorsChange = investorsThisMonth - investorsLastMonth

        // Crescimento percentual startups
        const monthlyGrowth = startupsLastMonth.length > 0
          ? ((startupsThisMonth.length - startupsLastMonth.length) / startupsLastMonth.length) * 100
          : 100

        // Startups recentes (últimas 3 por ano fundação)
        const recentes = [...data]
          .sort((a, b) => b.ano_fundacao - a.ano_fundacao)
          .slice(0, 3)

        // Agrupar investimentos por ano
        const investmentsByYear = data.reduce((acc, s) => {
          const year = s.ano_fundacao
          const value = parseInvestment(s.valor_investimento)
          acc[year] = (acc[year] || 0) + value
          return acc
        }, {} as Record<number, number>)

        const chart = Object.entries(investmentsByYear)
          .map(([year, total]) => ({ year, total }))
          .sort((a, b) => Number(a.year) - Number(b.year))

        setKpiData({
          totalStartups,
          totalStartupsChange: startupsChange,
          totalInvested,
          totalInvestedChange: investedChange,
          totalInvestors: uniqueInvestors,
          totalInvestorsChange: investorsChange,
          monthlyGrowth,
        })
        setRecentStartups(recentes)
        setChartData(chart)
      } catch (err) {
        console.error("Erro ao carregar startups:", err)
      }
    }

    fetchStartups()
  }, [])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard de Startups"
        description="Visão geral completa do ecossistema de startups e investimentos"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Startups"
          value={kpiData.totalStartups}
          change={kpiData.totalStartupsChange >= 0 ? `+${kpiData.totalStartupsChange}` : `${kpiData.totalStartupsChange}`}
          changeType={kpiData.totalStartupsChange >= 0 ? "positive" : "negative"}
          icon={Building2}
          description="Comparação com mês anterior"
        />
        <MetricCard
          title="Total Investido"
          value={formatCurrencyShort(kpiData.totalInvested)}
          change={formatCurrencyShort(kpiData.totalInvestedChange)}
          changeType={kpiData.totalInvestedChange >= 0 ? "positive" : "negative"}
          icon={DollarSign}
          description="Comparação com mês anterior"
        />
        <MetricCard
          title="Investidores Ativos"
          value={kpiData.totalInvestors}
          change={kpiData.totalInvestorsChange >= 0 ? `+${kpiData.totalInvestorsChange}` : `${kpiData.totalInvestorsChange}`}
          changeType={kpiData.totalInvestorsChange >= 0 ? "positive" : "negative"}
          icon={Users}
          description="Comparação com mês anterior"
        />
        <MetricCard
          title="Crescimento Mensal"
          value={`${kpiData.monthlyGrowth.toFixed(1)}%`}
          change={`${kpiData.monthlyGrowth.toFixed(1)}%`}
          changeType={kpiData.monthlyGrowth >= 0 ? "positive" : "negative"}
          icon={TrendingUp}
          description="Taxa de crescimento mês a mês"
        />
      </div>

      {/* Recent Startups */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Startups Recentes</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/startups">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentStartups.map((s) => (
            <StartupCard
              key={s.id}
              name={s.nome}
              sector={s.setor}
              country={s.localizacao}
              foundedYear={s.ano_fundacao}
              lastInvestment={s.valor_investimento}
              investor={s.vc_investidor}
              website={s.site}
            />
          ))}
        </CardContent>
      </Card>

      {/* Gráfico de investimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Investimentos por Ano</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v) => formatCurrencyShort(v)} />
              <Tooltip formatter={(value) => formatCurrencyShort(Number(value))} />
              <Legend />
              <Bar dataKey="total" fill="#4f46e5" name="Total Investido" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
