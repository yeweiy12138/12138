import { createEffect, createSignal } from 'solid-js'
import { convertReadableStreamToAccessor } from '@/logics/stream'
import { updateMessage } from '@/stores/messages'
import Markdown from './Markdown'

interface Props {
  class?: string
  text: string
  streamInfo?: () => {
    conversationId: string
    messageId: string
    stream: ReadableStream | null
  }
}

export default (props: Props) => {
  const [localText, setLocalText] = createSignal('')

  createEffect(async() => {
    const text = props.text
    if (props.text) {
      setLocalText(text)
    } else if (props.streamInfo) {
      const streamInfo = props.streamInfo()
      if (streamInfo.messageId && streamInfo.stream) {
        const finalText = await convertReadableStreamToAccessor(streamInfo.stream, setLocalText)
        setLocalText(finalText)
        updateMessage(streamInfo.conversationId, streamInfo.messageId, {
          content: finalText,
        })
      }
    } else {
      setLocalText('')
    }
  })

  return (
    <Markdown
      class={`prose prose-neutral dark:prose-invert max-w-3xl -my-4 ${props.class ?? ''}`}
      text={localText()}
    />
  )
}
