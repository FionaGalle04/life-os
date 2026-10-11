import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

function configuredClient() {
  if (!supabaseUrl || !supabasePublishableKey) return null
  try {
    return createClient(supabaseUrl, supabasePublishableKey, { global: { fetch: async (input, init) => {
      const controller = new AbortController()
      const abort = () => controller.abort()
      if (init?.signal?.aborted) abort()
      init?.signal?.addEventListener('abort', abort, { once: true })
      const timeout = setTimeout(abort, 15000)
      try { return await fetch(input, { ...init, signal: controller.signal }) }
      finally { clearTimeout(timeout); init?.signal?.removeEventListener('abort', abort) }
    } } })
  } catch { return null }
}

export const supabase = configuredClient()
