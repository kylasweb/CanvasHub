"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Download, Share2, Eye, Edit, Plus, QrCode, Globe, Mail, Phone, MapPin, Building, User, Briefcase, Link as LinkIcon, Settings } from "lucide-react"

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
}

export default function VirtualVisitingCardPage() {
  const [cards, setCards] = useState<VirtualVisitingCard[]>([])
  const [selectedCard, setSelectedCard] = useState<VirtualVisitingCard | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<Partial<VirtualVisitingCard>>({})

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/visiting-cards")
      if (response.ok) {
        const data = await response.json()
        setCards(data.cards)
        if (data.cards.length > 0) {
          setSelectedCard(data.cards[0])
        }
      }
    } catch (error) {
      toast.error("Failed to fetch visiting cards")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCard = async () => {
    try {
      const response = await fetch("/api/visiting-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const newCard = await response.json()
        setCards([...cards, newCard])
        setSelectedCard(newCard)
        setIsEditing(false)
        setFormData({})
        toast.success("Visiting card created successfully")
      } else {
        toast.error("Failed to create visiting card")
      }
    } catch (error) {
      toast.error("Failed to create visiting card")
    }
  }

  const handleUpdateCard = async () => {
    if (!selectedCard) return
    
    try {
      const response = await fetch(`/api/visiting-cards/${selectedCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const updatedCard = await response.json()
        setCards(cards.map(card => card.id === selectedCard.id ? updatedCard : card))
        setSelectedCard(updatedCard)
        setIsEditing(false)
        setFormData({})
        toast.success("Visiting card updated successfully")
      } else {
        toast.error("Failed to update visiting card")
      }
    } catch (error) {
      toast.error("Failed to update visiting card")
    }
  }

  const handleDeleteCard = async () => {
    if (!selectedCard) return
    
    try {
      const response = await fetch(`/api/visiting-cards/${selectedCard.id}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        setCards(cards.filter(card => card.id !== selectedCard.id))
        setSelectedCard(cards.length > 1 ? cards.find(card => card.id !== selectedCard.id) || null : null)
        toast.success("Visiting card deleted successfully")
      } else {
        toast.error("Failed to delete visiting card")
      }
    } catch (error) {
      toast.error("Failed to delete visiting card")
    }
  }

  const startEditing = () => {
    if (selectedCard) {
      setFormData(selectedCard)
      setIsEditing(true)
    }
  }

  const startCreating = () => {
    setFormData({
      theme: "MODERN",
      layout: "STANDARD",
      visibility: "PUBLIC",
      status: "ACTIVE"
    })
    setIsEditing(true)
    setSelectedCard(null)
  }

  const getSocialLinks = () => {
    if (!selectedCard?.socialLinks) return []
    try {
      return JSON.parse(selectedCard.socialLinks)
    } catch {
      return []
    }
  }

  const getCustomFields = () => {
    if (!selectedCard?.customFields) return []
    try {
      return JSON.parse(selectedCard.customFields)
    } catch {
      return []
    }
  }

  const renderCardPreview = () => {
    if (!selectedCard) return null

    const socialLinks = getSocialLinks()
    const customFields = getCustomFields()

    return (
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
            <Avatar className="w-20 h-20">
              <AvatarImage src={selectedCard.profileImage} />
              <AvatarFallback>
                {selectedCard.title?.charAt(0) || selectedCard.company?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
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

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {selectedCard.mobile && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${selectedCard.mobile}`} className="text-sm hover:underline">
                  {selectedCard.mobile}
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
          </div>

          {(selectedCard.address || selectedCard.city || selectedCard.state || selectedCard.country) && (
            <div className="mt-4 flex items-center space-x-2">
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

          {socialLinks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Social Links</h4>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>{link.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {customFields.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Additional Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {customFields.map((field: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{field.label}:</span> {field.value}
                  </div>
                ))}
              </div>
            </div>
          )}

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
    )
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
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Virtual Visiting Cards</h1>
          <p className="text-muted-foreground">Create and manage your digital business cards</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={startCreating}>
            <Plus className="w-4 h-4 mr-2" />
            Create Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Cards</CardTitle>
              <CardDescription>
                {cards.length} card{cards.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {cards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cards yet. Create your first card!</p>
              ) : (
                cards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCard?.id === card.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {card.title || card.company || "Untitled Card"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {card.position || "No position"}
                        </p>
                      </div>
                      <Badge variant={card.status === "ACTIVE" ? "default" : "secondary"}>
                        {card.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedCard ? "Edit Card" : "Create New Card"}
                </CardTitle>
                <CardDescription>
                  {selectedCard ? "Update your visiting card information" : "Create a new virtual visiting card"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title/Name</Label>
                        <Input
                          id="title"
                          value={formData.title || ""}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={formData.company || ""}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={formData.position || ""}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio || ""}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="contact" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ""}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone || ""}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mobile">Mobile</Label>
                        <Input
                          id="mobile"
                          value={formData.mobile || ""}
                          onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={formData.website || ""}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address || ""}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city || ""}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state || ""}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP</Label>
                        <Input
                          id="zip"
                          value={formData.zip || ""}
                          onChange={(e) => setFormData({...formData, zip: e.target.value})}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="appearance" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={formData.theme || "MODERN"} onValueChange={(value) => setFormData({...formData, theme: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MODERN">Modern</SelectItem>
                            <SelectItem value="CLASSIC">Classic</SelectItem>
                            <SelectItem value="MINIMAL">Minimal</SelectItem>
                            <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                            <SelectItem value="CREATIVE">Creative</SelectItem>
                            <SelectItem value="ELEGANT">Elegant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="layout">Layout</Label>
                        <Select value={formData.layout || "STANDARD"} onValueChange={(value) => setFormData({...formData, layout: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STANDARD">Standard</SelectItem>
                            <SelectItem value="COMPACT">Compact</SelectItem>
                            <SelectItem value="DETAILED">Detailed</SelectItem>
                            <SelectItem value="SIDEBAR">Sidebar</SelectItem>
                            <SelectItem value="GRID">Grid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="profileImage">Profile Image URL</Label>
                        <Input
                          id="profileImage"
                          value={formData.profileImage || ""}
                          onChange={(e) => setFormData({...formData, profileImage: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="coverImage">Cover Image URL</Label>
                        <Input
                          id="coverImage"
                          value={formData.coverImage || ""}
                          onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="visibility">Visibility</Label>
                        <Select value={formData.visibility || "PUBLIC"} onValueChange={(value) => setFormData({...formData, visibility: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PUBLIC">Public</SelectItem>
                            <SelectItem value="PRIVATE">Private</SelectItem>
                            <SelectItem value="UNLISTED">Unlisted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status || "ACTIVE"} onValueChange={(value) => setFormData({...formData, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="slug">Custom URL Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug || ""}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        placeholder="your-custom-slug"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  {selectedCard && (
                    <Button variant="destructive" onClick={handleDeleteCard}>
                      Delete
                    </Button>
                  )}
                  <Button onClick={selectedCard ? handleUpdateCard : handleCreateCard}>
                    {selectedCard ? "Update" : "Create"} Card
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {selectedCard ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">
                      {selectedCard.title || selectedCard.company || "Untitled Card"}
                    </h2>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={startEditing}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      {selectedCard.qrCode && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <QrCode className="w-4 h-4 mr-2" />
                              QR Code
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>QR Code</DialogTitle>
                              <DialogDescription>
                                Scan this QR code to view the visiting card
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-center">
                              <img src={selectedCard.qrCode} alt="QR Code" className="w-64 h-64" />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                  
                  {renderCardPreview()}
                </>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">No Card Selected</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first virtual visiting card to get started
                      </p>
                      <Button onClick={startCreating}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Card
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}