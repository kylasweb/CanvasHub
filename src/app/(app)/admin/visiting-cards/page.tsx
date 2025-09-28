"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Download, Users, TrendingUp, Clock, MapPin, Mail, Phone, Globe, Building } from "lucide-react"

interface VirtualVisitingCard {
  id: string
  title?: string
  company?: string
  position?: string
  email?: string
  phone?: string
  mobile?: string
  website?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  bio?: string
  profileImage?: string
  coverImage?: string
  socialLinks?: string
  customFields?: string
  theme: string
  layout: string
  visibility: string
  status: string
  qrCode?: string
  slug?: string
  views: number
  lastViewedAt?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name?: string
    email: string
  }
}

interface CardStats {
  totalCards: number
  activeCards: number
  totalViews: number
  popularTheme: string
  cardsByTheme: Record<string, number>
  cardsByStatus: Record<string, number>
  recentViews: Array<{
    cardId: string
    cardTitle: string
    views: number
    lastViewed: string
  }>
}

export default function AdminVisitingCardsPage() {
  const [cards, setCards] = useState<VirtualVisitingCard[]>([])
  const [stats, setStats] = useState<CardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [themeFilter, setThemeFilter] = useState("all")
  const [selectedCard, setSelectedCard] = useState<VirtualVisitingCard | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [cardsResponse, statsResponse] = await Promise.all([
        fetch("/api/admin/visiting-cards"),
        fetch("/api/admin/visiting-cards/stats")
      ])

      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json()
        setCards(cardsData.cards)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      toast.error("Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || card.status === statusFilter
    const matchesTheme = themeFilter === "all" || card.theme === themeFilter

    return matchesSearch && matchesStatus && matchesTheme
  })

  const handleDeleteCard = async (cardId: string) => {
    try {
      const response = await fetch(`/api/admin/visiting-cards/${cardId}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        setCards(cards.filter(card => card.id !== cardId))
        toast.success("Card deleted successfully")
        fetchData() // Refresh stats
      } else {
        toast.error("Failed to delete card")
      }
    } catch (error) {
      toast.error("Failed to delete card")
    }
  }

  const handleStatusChange = async (cardId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/visiting-cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setCards(cards.map(card => 
          card.id === cardId ? { ...card, status: newStatus } : card
        ))
        toast.success("Card status updated")
        fetchData() // Refresh stats
      } else {
        toast.error("Failed to update card status")
      }
    } catch (error) {
      toast.error("Failed to update card status")
    }
  }

  const getSocialLinks = (card: VirtualVisitingCard) => {
    if (!card.socialLinks) return []
    try {
      return JSON.parse(card.socialLinks)
    } catch {
      return []
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Virtual Visiting Cards</h1>
          <p className="text-muted-foreground">Manage all virtual visiting cards in the system</p>
        </div>
        <Button onClick={fetchData}>
          Refresh Data
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCards}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeCards} active cards
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all cards
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Popular Theme</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.popularTheme}</div>
              <p className="text-xs text-muted-foreground">
                Most used theme
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.recentViews?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Cards viewed today
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>All Visiting Cards</CardTitle>
            <CardDescription>
              Manage and monitor all virtual visiting cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={themeFilter} onValueChange={setThemeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  <SelectItem value="MODERN">Modern</SelectItem>
                  <SelectItem value="CLASSIC">Classic</SelectItem>
                  <SelectItem value="MINIMAL">Minimal</SelectItem>
                  <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  <SelectItem value="CREATIVE">Creative</SelectItem>
                  <SelectItem value="ELEGANT">Elegant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Theme</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={card.profileImage} />
                            <AvatarFallback>
                              {card.title?.charAt(0) || card.company?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {card.title || card.company || "Untitled"}
                            </div>
                            {card.position && (
                              <div className="text-sm text-muted-foreground">
                                {card.position}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{card.user.name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">
                            {card.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {card.theme}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={card.status} 
                          onValueChange={(value) => handleStatusChange(card.id, value)}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span>{card.views.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(card.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedCard(card)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Card Preview</DialogTitle>
                                <DialogDescription>
                                  Preview of the virtual visiting card
                                </DialogDescription>
                              </DialogHeader>
                              {selectedCard && (
                                <Card className="overflow-hidden">
                                  {selectedCard.coverImage && (
                                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                                      <img 
                                        src={selectedCard.coverImage} 
                                        alt="Cover" 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <CardContent className="p-6">
                                    <div className="flex items-start space-x-4">
                                      <Avatar className="w-16 h-16">
                                        <AvatarImage src={selectedCard.profileImage} />
                                        <AvatarFallback>
                                          {selectedCard.title?.charAt(0) || selectedCard.company?.charAt(0) || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <h3 className="text-lg font-semibold">
                                              {selectedCard.title || selectedCard.company || "Untitled"}
                                            </h3>
                                            {selectedCard.position && (
                                              <p className="text-sm text-muted-foreground">{selectedCard.position}</p>
                                            )}
                                            {selectedCard.company && (
                                              <p className="text-sm text-muted-foreground flex items-center">
                                                <Building className="w-4 h-4 mr-1" />
                                                {selectedCard.company}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex space-x-2">
                                            <Badge variant={selectedCard.status === "ACTIVE" ? "default" : "secondary"}>
                                              {selectedCard.status}
                                            </Badge>
                                            <Badge variant="outline">
                                              {selectedCard.visibility}
                                            </Badge>
                                          </div>
                                        </div>
                                        
                                        {selectedCard.bio && (
                                          <p className="mt-3 text-sm text-muted-foreground">
                                            {selectedCard.bio}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {selectedCard.email && (
                                        <div className="flex items-center space-x-2">
                                          <Mail className="w-4 h-4 text-muted-foreground" />
                                          <a href={`mailto:${selectedCard.email}`} className="text-sm hover:underline">
                                            {selectedCard.email}
                                          </a>
                                        </div>
                                      )}
                                      {selectedCard.phone && (
                                        <div className="flex items-center space-x-2">
                                          <Phone className="w-4 h-4 text-muted-foreground" />
                                          <a href={`tel:${selectedCard.phone}`} className="text-sm hover:underline">
                                            {selectedCard.phone}
                                          </a>
                                        </div>
                                      )}
                                      {selectedCard.website && (
                                        <div className="flex items-center space-x-2">
                                          <Globe className="w-4 h-4 text-muted-foreground" />
                                          <a href={selectedCard.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                                            {selectedCard.website}
                                          </a>
                                        </div>
                                      )}
                                      {(selectedCard.address || selectedCard.city) && (
                                        <div className="flex items-center space-x-2">
                                          <MapPin className="w-4 h-4 text-muted-foreground" />
                                          <span className="text-sm">
                                            {[
                                              selectedCard.address,
                                              selectedCard.city,
                                              selectedCard.state,
                                              selectedCard.zip,
                                              selectedCard.country
                                            ].filter(Boolean).join(", ")}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                      <div className="flex items-center space-x-4">
                                        <span className="flex items-center">
                                          <Eye className="w-4 h-4 mr-1" />
                                          {selectedCard.views} views
                                        </span>
                                        {selectedCard.slug && (
                                          <span className="flex items-center">
                                            <Globe className="w-4 h-4 mr-1" />
                                            /{selectedCard.slug}
                                          </span>
                                        )}
                                      </div>
                                      <span>Theme: {selectedCard.theme}</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCards.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No cards found matching your filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Card usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats && (
              <>
                <div>
                  <h4 className="text-sm font-medium mb-2">Cards by Theme</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.cardsByTheme).map(([theme, count]) => (
                      <div key={theme} className="flex items-center justify-between">
                        <span className="text-sm">{theme}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Cards by Status</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.cardsByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm">{status}</span>
                        <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Recently Viewed</h4>
                  <div className="space-y-2">
                    {stats.recentViews?.slice(0, 5).map((item, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{item.cardTitle}</div>
                        <div className="text-muted-foreground">
                          {item.views} views • {new Date(item.lastViewed).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}