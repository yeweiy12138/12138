import { action, map } from 'nanostores'
import { conversationMessagesMapData } from './tests/message.mock'
import { db } from './storage/message'
import type { MessageInstance } from '@/types/message'

export const conversationMessagesMap = map<Record<string, MessageInstance[]>>({})

export const rebuildMessagesStore = async() => {
  const data = await db.exportData() || {}
  conversationMessagesMap.set(data)
  // conversationMessagesMap.set(conversationMessagesMapData)
}

export const getMessagesByConversationId = (id: string) => {
  return conversationMessagesMap.get()[id] || []
}

export const updateMessage = action(
  conversationMessagesMap,
  'updateMessage',
  (map, conversationId: string, id: string, payload: Partial<Omit<MessageInstance, 'stream'>>) => {
    const oldMessages = map.get()[conversationId] || []
    const newMessages = oldMessages.map((message) => {
      if (message.id === id) {
        return {
          ...message,
          ...payload,
          stream: undefined,
        }
      }
      return message
    })
    map.setKey(conversationId, newMessages)
    db.setItem(conversationId, newMessages)
  },
)

export const pushMessageByConversationId = action(
  conversationMessagesMap,
  'pushMessageByConversationId',
  (map, id: string, payload: MessageInstance) => {
    const oldMessages = map.get()[id] || []
    map.setKey(id, [...oldMessages, payload])
    db.setItem(id, [...oldMessages, {
      ...payload,
      stream: undefined,
    }])
  },
)

export const clearMessagesByConversationId = action(
  conversationMessagesMap,
  'clearMessagesByConversationId',
  (map, id: string) => {
    map.setKey(id, [])
    db.deleteItem(id)
  },
)
