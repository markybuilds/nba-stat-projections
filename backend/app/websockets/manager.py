"""
WebSocket connection manager for NBA stat projections.
Handles real-time updates for projections and game data.
"""

from typing import Dict, List, Any
import json
from fastapi import WebSocket


class ConnectionManager:
    """
    WebSocket connection manager for handling real-time updates.
    """
    
    def __init__(self):
        # Active connections dictionary with client_id as key and WebSocket as value
        self.active_connections: Dict[str, WebSocket] = {}
        # Subscriptions dictionary with topic as key and list of client_ids as value
        self.subscriptions: Dict[str, List[str]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """
        Connect a new WebSocket client
        
        Args:
            websocket: The WebSocket connection
            client_id: Unique identifier for the client
        """
        await websocket.accept()
        self.active_connections[client_id] = websocket
    
    def disconnect(self, client_id: str):
        """
        Disconnect a WebSocket client and remove all subscriptions
        
        Args:
            client_id: Unique identifier for the client
        """
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            
        # Remove client from all subscriptions
        for topic in self.subscriptions:
            if client_id in self.subscriptions[topic]:
                self.subscriptions[topic].remove(client_id)
    
    def subscribe(self, client_id: str, topic: str):
        """
        Subscribe a client to a topic
        
        Args:
            client_id: Unique identifier for the client
            topic: Topic to subscribe to (e.g., 'projections', 'game/{game_id}')
        """
        if topic not in self.subscriptions:
            self.subscriptions[topic] = []
        
        if client_id not in self.subscriptions[topic]:
            self.subscriptions[topic].append(client_id)
    
    def unsubscribe(self, client_id: str, topic: str):
        """
        Unsubscribe a client from a topic
        
        Args:
            client_id: Unique identifier for the client
            topic: Topic to unsubscribe from
        """
        if topic in self.subscriptions and client_id in self.subscriptions[topic]:
            self.subscriptions[topic].remove(client_id)
    
    async def broadcast(self, topic: str, data: Any):
        """
        Broadcast data to all clients subscribed to a topic
        
        Args:
            topic: Topic to broadcast to
            data: Data to broadcast (will be JSON serialized)
        """
        if topic not in self.subscriptions:
            return
        
        message = json.dumps({
            "topic": topic,
            "data": data
        })
        
        # Get all clients subscribed to this topic
        client_ids = self.subscriptions[topic]
        
        # Send message to each connected client
        for client_id in client_ids:
            if client_id in self.active_connections:
                try:
                    await self.active_connections[client_id].send_text(message)
                except Exception:
                    # If sending fails, disconnect the client
                    self.disconnect(client_id)
    
    async def send_personal_message(self, client_id: str, data: Any):
        """
        Send a personal message to a specific client
        
        Args:
            client_id: Client to send message to
            data: Data to send (will be JSON serialized)
        """
        if client_id not in self.active_connections:
            return
            
        message = json.dumps({
            "topic": "personal",
            "data": data
        })
        
        try:
            await self.active_connections[client_id].send_text(message)
        except Exception:
            # If sending fails, disconnect the client
            self.disconnect(client_id)


# Create a singleton instance
manager = ConnectionManager() 