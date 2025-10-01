import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ExternalLink, MapPin, Calendar, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface StartupCardProps {
  name: string
  sector: string
  country: string
  foundedYear: number
  lastInvestment: string
  investor: string
  website?: string
  className?: string
}

export function StartupCard({
  name,
  sector,
  country,
  foundedYear,
  lastInvestment,
  investor,
  website,
  className,
}: StartupCardProps) {
  return (
    <Card className={cn("group hover:border-primary/20 transition-all duration-300 hover:glow-green-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{name}</h3>
            <Badge variant="secondary" className="text-xs">
              {sector}
            </Badge>
          </div>
          {website && (
            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
              <a href={website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{country}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{foundedYear}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="font-semibold text-primary">{lastInvestment}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Investido por <span className="text-foreground font-medium">{investor}</span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
        >
          Ver Histórico
        </Button>
      </CardContent>
    </Card>
  )
}
