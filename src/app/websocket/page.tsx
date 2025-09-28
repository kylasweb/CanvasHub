"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Wifi, 
  WifiOff, 
  Users, 
  MessageSquare, 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Server,
  Zap
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  type: 'user' | 'system' | 'echo';
}

interface SystemInfo {
  connected: boolean;
  uptime: string;
  connections: number;
  messages: number;
  lastPing: Date | null;
}

export default function WebSocket() {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    connected: false,
    uptime: '0s',
    connections: 0,
    messages: 0,
    lastPing: null
  });
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize WebSocket connection
    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      
      const newSocket = io('http://localhost:3000', {
        path: '/api/socketio',
        transports: ['websocket'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
        setConnectionStatus('connected');
        setSystemInfo(prev => ({
          ...prev,
          connected: true,
          connections: (newSocket.io as any).engine?.clientsCount || 1
        }));
        toast({
          title: "WebSocket Connected",
          description: "Real-time features are now active",
        });
        
        // Send initial connection message
        newSocket.emit('message', {
          text: 'User connected to WebSocket',
          sender: 'system',
          type: 'system'
        });
      });

      newSocket.on('disconnect', (reason: string) => {
        console.log('Disconnected from WebSocket:', reason);
        setConnectionStatus('disconnected');
        setSystemInfo(prev => ({
          ...prev,
          connected: false,
          connections: 0
        }));
        toast({
          title: "WebSocket Disconnected",
          description: `Reason: ${reason}`,
          variant: "destructive"
        });
      });

      newSocket.on('connect_error', (error: Error) => {
        console.error('Connection error:', error);
        setConnectionStatus('disconnected');
        toast({
          title: "Connection Error",
          description: error.message,
          variant: "destructive"
        });
      });

      newSocket.on('message', (data: any) => {
        const message: Message = {
          id: Date.now().toString(),
          text: data.text || data,
          sender: data.sender || 'server',
          timestamp: new Date(),
          type: data.type || 'echo'
        };
        
        setMessages(prev => [...prev, message]);
        setSystemInfo(prev => ({
          ...prev,
          messages: prev.messages + 1
        }));
      });

      newSocket.on('pong', () => {
        setSystemInfo(prev => ({
          ...prev,
          lastPing: new Date()
        }));
      });

      newSocket.on('system_info', (info: any) => {
        setSystemInfo(prev => ({
          ...prev,
          ...info,
          connected: true
        }));
      });

      // Update uptime every second
      const startTime = Date.now();
      const uptimeInterval = setInterval(() => {
        if (newSocket.connected) {
          const uptime = Date.now() - startTime;
          const seconds = Math.floor(uptime / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          
          let uptimeStr = '';
          if (hours > 0) {
            uptimeStr = `${hours}h ${minutes % 60}m ${seconds % 60}s`;
          } else if (minutes > 0) {
            uptimeStr = `${minutes}m ${seconds % 60}s`;
          } else {
            uptimeStr = `${seconds}s`;
          }
          
          setSystemInfo(prev => ({
            ...prev,
            uptime: uptimeStr
          }));
        }
      }, 1000);

      // Ping server every 30 seconds
      const pingInterval = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('ping');
        }
      }, 30000);

      setSocket(newSocket);

      return () => {
        clearInterval(uptimeInterval);
        clearInterval(pingInterval);
        newSocket.close();
      };
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (socket && socket.connected && inputMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: 'user',
        timestamp: new Date(),
        type: 'user'
      };
      
      setMessages(prev => [...prev, message]);
      socket.emit('message', {
        text: inputMessage,
        sender: 'user',
        type: 'user'
      });
      
      setInputMessage('');
      setSystemInfo(prev => ({
        ...prev,
        messages: prev.messages + 1
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setSystemInfo(prev => ({
      ...prev,
      messages: 0
    }));
  };

  const reconnect = () => {
    if (socket) {
      socket.disconnect();
    }
    // The useEffect will handle reconnection
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="outline">
            <Zap className="w-3 h-3 mr-1 animate-spin" />
            Connecting...
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WebSocket Communication</h1>
          <p className="text-muted-foreground">
            Real-time messaging and system monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Button variant="outline" size="sm" onClick={reconnect}>
            <Wifi className="w-4 h-4 mr-2" />
            Reconnect
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold">
                  {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                </p>
              </div>
              {connectionStatus === 'connected' ? (
                <Wifi className="h-8 w-8 text-green-500" />
              ) : (
                <WifiOff className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-lg font-semibold">{systemInfo.uptime}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="text-lg font-semibold">{systemInfo.connections}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="text-lg font-semibold">{systemInfo.messages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Log</CardTitle>
            <CardDescription>Real-time message exchange</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {messages.length} messages
                </p>
                <Button variant="outline" size="sm" onClick={clearMessages}>
                  Clear
                </Button>
              </div>
              
              <div className="h-96 overflow-y-auto border rounded-md p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <Alert key={message.id} className={`${
                      message.type === 'system' ? 'border-blue-200 bg-blue-50' :
                      message.type === 'user' ? 'border-green-200 bg-green-50' :
                      'border-gray-200'
                    }`}>
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {message.type === 'user' ? 'You' : 
                                 message.type === 'system' ? 'System' : 'Server'}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {message.type}
                              </Badge>
                            </div>
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={connectionStatus !== 'connected'}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!inputMessage.trim() || connectionStatus !== 'connected'}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>WebSocket connection details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Connection Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Server:</span>
                    <span>localhost:3000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Path:</span>
                    <span>/api/socketio</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transport:</span>
                    <span>WebSocket</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Ping:</span>
                    <span>
                      {systemInfo.lastPing 
                        ? systemInfo.lastPing.toLocaleTimeString() 
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Socket Events</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>• connect - Connection established</div>
                  <div>• disconnect - Connection lost</div>
                  <div>• message - Receive messages</div>
                  <div>• ping/pong - Heartbeat</div>
                  <div>• system_info - Server status</div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Features</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>✓ Real-time messaging</div>
                  <div>✓ Auto-reconnection</div>
                  <div>✓ Connection monitoring</div>
                  <div>✓ Message history</div>
                  <div>✓ System metrics</div>
                </div>
              </div>

              {connectionStatus === 'disconnected' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    WebSocket connection is inactive. Click "Reconnect" to establish a new connection.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}