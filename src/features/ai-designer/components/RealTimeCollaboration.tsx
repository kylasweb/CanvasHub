"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Users, 
  MessageSquare, 
  Lightbulb, 
  GitMerge, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Settings,
  Eye,
  Edit,
  Share,
  Download,
  RefreshCw
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'online' | 'offline' | 'away'
  lastActive: Date
}

interface CollaborationMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
  type: 'chat' | 'suggestion' | 'conflict' | 'system'
}

interface CollaborationSuggestion {
  id: string
  type: 'collaboration' | 'realtime' | 'conflict' | 'insight'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  data: any
  timestamp: Date
  status: 'pending' | 'accepted' | 'rejected'
}

interface RealTimeCollaborationProps {
  projectId: string
  userId: string
  userName: string
}

export default function RealTimeCollaboration({ projectId, userId, userName }: RealTimeCollaborationProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [messages, setMessages] = useState<CollaborationMessage[]>([])
  const [suggestions, setSuggestions] = useState<CollaborationSuggestion[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState(0)
  const [conflicts, setConflicts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        userId,
        userName,
        projectId
      }
    })

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to collaboration server')
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from collaboration server')
    })

    socketInstance.on('user-joined', (data) => {
      setCollaborators(prev => [...prev, data.user])
      setActiveUsers(data.activeUsers)
      
      // Add system message
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        userId: 'system',
        userName: 'System',
        content: `${data.user.name} joined the collaboration`,
        timestamp: new Date(),
        type: 'system'
      }])
    })

    socketInstance.on('user-left', (data) => {
      setCollaborators(prev => prev.filter(c => c.id !== data.userId))
      setActiveUsers(data.activeUsers)
      
      // Add system message
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        userId: 'system',
        userName: 'System',
        content: `${data.userName} left the collaboration`,
        timestamp: new Date(),
        type: 'system'
      }])
    })

    socketInstance.on('receive-message', (message) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('collaboration-suggestion', (suggestion) => {
      setSuggestions(prev => [...prev, suggestion])
      toast.info(`New AI suggestion: ${suggestion.title}`)
    })

    socketInstance.on('conflict-detected', (conflict) => {
      setConflicts(prev => [...prev, conflict])
      toast.warning('Collaboration conflict detected')
    })

    socketInstance.on('active-users', (count) => {
      setActiveUsers(count)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [projectId, userId, userName])

  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !socket) return

    const message: CollaborationMessage = {
      id: `msg_${Date.now()}`,
      userId,
      userName,
      content: newMessage,
      timestamp: new Date(),
      type: 'chat'
    }

    socket.emit('send-message', message)
    setMessages(prev => [...prev, message])
    setNewMessage('')
  }, [newMessage, socket, userId, userName])

  const requestCollaborationSuggestions = useCallback(async () => {
    if (!projectId) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/ai/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'suggest_collaboration'
        })
      })

      if (!response.ok) throw new Error('Failed to get suggestions')

      const data = await response.json()
      
      // Convert AI suggestions to collaboration suggestions
      const aiSuggestions: CollaborationSuggestion[] = data.data.suggestions.suggestions?.map((suggestion: any, index: number) => ({
        id: `ai_suggestion_${Date.now()}_${index}`,
        type: 'collaboration',
        title: suggestion.title || 'Collaboration Suggestion',
        description: suggestion.description || 'AI-generated collaboration improvement',
        priority: suggestion.priority || 'medium',
        data: suggestion,
        timestamp: new Date(),
        status: 'pending'
      })) || []

      setSuggestions(prev => [...prev, ...aiSuggestions])
      toast.success('AI collaboration suggestions generated')
    } catch (error) {
      toast.error('Failed to generate collaboration suggestions')
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  const requestRealtimeSuggestions = useCallback(async (currentContent: any) => {
    if (!projectId || !socket) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/ai/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'real_time_suggestion',
          data: {
            currentContent,
            collaborators: collaborators.length,
            userRole: collaborators.find(c => c.id === userId)?.role || 'editor'
          }
        })
      })

      if (!response.ok) throw new Error('Failed to get realtime suggestions')

      const data = await response.json()
      
      // Broadcast realtime suggestions to all collaborators
      socket.emit('broadcast-suggestion', {
        type: 'realtime',
        suggestions: data.data.realtimeSuggestions.suggestions
      })

      toast.success('Real-time suggestions shared with team')
    } catch (error) {
      toast.error('Failed to generate real-time suggestions')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, collaborators, userId, socket])

  const resolveConflict = useCallback(async (conflictId: string, resolution: any) => {
    if (!projectId) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/ai/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'conflict_resolution',
          data: {
            conflicts: conflicts.filter(c => c.id === conflictId),
            conflictHistory: []
          }
        })
      })

      if (!response.ok) throw new Error('Failed to resolve conflict')

      const data = await response.json()
      
      // Remove resolved conflict
      setConflicts(prev => prev.filter(c => c.id !== conflictId))
      
      // Add resolution message
      if (socket) {
        const message: CollaborationMessage = {
          id: `msg_${Date.now()}`,
          userId: 'system',
          userName: 'System',
          content: `Conflict resolved: ${resolution.description}`,
          timestamp: new Date(),
          type: 'system'
        }
        socket.emit('send-message', message)
        setMessages(prev => [...prev, message])
      }

      toast.success('Conflict resolved successfully')
    } catch (error) {
      toast.error('Failed to resolve conflict')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, conflicts, socket])

  const acceptSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, status: 'accepted' as const } : s)
    )
    toast.success('Suggestion accepted')
  }, [])

  const rejectSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, status: 'rejected' as const } : s)
    )
    toast.success('Suggestion rejected')
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800'
      case 'editor': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span className="font-medium">Real-time Collaboration</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? `${activeUsers} active` : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={requestCollaborationSuggestions}
            disabled={isLoading}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            AI Suggestions
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => requestRealtimeSuggestions({})}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Real-time Analysis
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Collaborators & Suggestions */}
        <div className="space-y-4">
          {/* Active Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Active Collaborators ({collaborators.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={collaborator.avatar} />
                            <AvatarFallback>
                              {collaborator.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(collaborator.status)}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{collaborator.name}</p>
                          <p className="text-xs text-gray-500">{collaborator.email}</p>
                        </div>
                      </div>
                      <Badge className={getRoleColor(collaborator.role)}>
                        {collaborator.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                AI Suggestions ({suggestions.filter(s => s.status === 'pending').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {suggestions
                    .filter(s => s.status === 'pending')
                    .map((suggestion) => (
                      <div key={suggestion.id} className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => acceptSuggestion(suggestion.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => rejectSuggestion(suggestion.id)}
                          >
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Active Conflicts */}
          {conflicts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Active Conflicts ({conflicts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {conflicts.map((conflict) => (
                      <div key={conflict.id} className="p-3 rounded-lg border border-red-200 bg-red-50">
                        <h4 className="font-medium text-sm mb-2">{conflict.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{conflict.description}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => resolveConflict(conflict.id, conflict)}
                        >
                          <GitMerge className="w-3 h-3 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Chat & Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chat */}
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Team Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-80">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${message.userId === userId ? 'order-2' : 'order-1'}`}>
                        <div className={`p-3 rounded-lg ${message.type === 'system' ? 'bg-gray-100 text-gray-600' : message.userId === userId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                          {message.type !== 'system' && (
                            <p className="font-medium text-xs mb-1">{message.userName}</p>
                          )}
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!isConnected}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!isConnected || !newMessage.trim()}
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {suggestions
                    .filter(s => s.status !== 'pending')
                    .slice(-5)
                    .map((suggestion) => (
                      <div key={suggestion.id} className="flex items-center space-x-3 p-2 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${suggestion.status === 'accepted' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{suggestion.title}</span> was {suggestion.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(suggestion.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}