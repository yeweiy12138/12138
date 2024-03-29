import StreamableText from '../StreamableText'
import type { Accessor } from 'solid-js'
import type { MessageInstance } from '@/types/message'

interface Props {
  conversationId: string
  messages: Accessor<MessageInstance[]>
}

export default ({ conversationId, messages }: Props) => {
  const messageInput = () => messages().length > 0 ? messages()[0] : null
  const messageOutput = () => messages().length > 1 ? messages()[1] : null
  return (
    <div class="flex flex-col h-full">
      <div class="flex-[1] border-b border-base p-6 break-all overflow-y-scroll">
        <StreamableText
          class="mx-auto"
          text={messageInput()?.content || ''}
        />
      </div>
      <div class="flex-[2] p-6 break-all overflow-y-scroll">
        <StreamableText
          class="mx-auto"
          text={messageOutput()?.content || ''}
          streamInfo={messageOutput()?.stream
            ? () => ({
                conversationId,
                messageId: messageOutput()?.id || '',
                stream: messageOutput()?.stream || null,
              })
            : undefined}
        />
      </div>
    </div>
  )
}
