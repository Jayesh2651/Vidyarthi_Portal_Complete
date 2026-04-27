import { useEffect, useState } from 'react'

export function useAsyncData(loader, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false

    async function runLoader() {
      await Promise.resolve()
      if (ignore) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await loader()
        if (ignore) {
          return
        }
        setData(response.data)
      } catch (requestError) {
        if (ignore) {
          return
        }
        setData(null)
        setError(requestError)
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void runLoader()

    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  return {
    data,
    loading,
    error,
    reload: () => setReloadKey((current) => current + 1),
  }
}
