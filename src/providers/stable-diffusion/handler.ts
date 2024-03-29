import { fetchImageGeneration } from './api'
import type { Provider } from '@/types/provider'

// TODO: handle CORS error
export const handleImagePrompt: Provider['handleImagePrompt'] = async(prompt, payload) => {
  console.log('payload', payload)
  const response = await fetchImageGeneration({
    token: payload.globalSettings.token as string,
    method: 'POST',
    body: {
      version: payload.globalSettings.version as string,
      input: {
        prompt,
      },
    },
  })
  if (!response.ok) {
    const responseJson = await response.json()
    const errMessage = responseJson.error?.message || 'Unknown error'
    throw new Error(errMessage)
  }
  const resJson = await response.json()

  return waitImageWithPrediction(resJson, payload.globalSettings.token as string)
}

interface Prediction {
  id: string
  input: {
    prompt: string
  }
  output: string[] | null
  status: 'starting' | 'succeeded' | 'failed'
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const waitImageWithPrediction = async(prediction: Prediction, token: string) => {
  let currentPrediction = prediction
  while (currentPrediction.status !== 'succeeded' && currentPrediction.status !== 'failed') {
    await sleep(1000)
    const response = await fetchImageGeneration({ token })
    prediction = await response.json()
    if (!response.ok) {
      const responseJson = await response.json()
      const errMessage = responseJson.error?.message || 'Unknown error'
      throw new Error(errMessage)
    }
    currentPrediction = prediction
  }
  if (!currentPrediction.output || currentPrediction.output.length === 0)
    throw new Error('No output')
  return currentPrediction.output[0]
}
