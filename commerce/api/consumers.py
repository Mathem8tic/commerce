import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, Conversation

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        logger.info(f'Connecting to room: {self.room_group_name}')

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        logger.info(f'Disconnecting from room: {self.room_group_name}')
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', None)

        if message:
            message_data = {
                'content': message['content'],
                'conversation_id': self.room_name,
                'user': self.scope['user']
            }

            logger.info(f'Received message: {message_data}')

            # Save the message to the database
            await self.save_message(message_data)

            # Include the username in the message sent to the group
            message['username'] = self.scope['user'].username

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message
                }
            )

    async def chat_message(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'message': message
        }))

    @database_sync_to_async
    def save_message(self, message_data):
        logger.info(f'Saving message to database: {message_data}')
        conversation = Conversation.objects.get(id=message_data['conversation_id'])
        Message.objects.create(
            conversation=conversation,
            user=message_data['user'],
            content=message_data['content']
        )