import { useLoadingStore } from '@/stores/loadingStore.js'
import { useLanguageStore } from "@/stores/languageStore.js";
import { useAlertStore } from '@/stores/alertStore.js'

const text = {
  genericError: {
    et: 'Midagi läks valesti',
    en: 'Oops! Something went wrong',
  }
}

/**
 * Makes an API request with loading state and error handling.
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {Object} body - Request body (optional)
 * @returns {Promise<any>} - Response JSON or error
 */
export async function apiRequest(endpoint, method = 'GET', body = null) {
  const loadingStore = useLoadingStore()
  const alertStore = useAlertStore()
  const languageStore = useLanguageStore()

  loadingStore.startLoading()
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json' ,
        'Accept-Language': languageStore.currentLanguage,
      },
      body: body ? JSON.stringify(body) : null,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || text.genericError[languageStore.currentLanguage])
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', error.message)
    alertStore.showAlert(error.message, 'error')
    throw error
  } finally {
    loadingStore.stopLoading()
  }
}
