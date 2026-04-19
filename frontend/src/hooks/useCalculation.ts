import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { loanApi } from '@/api'
import { useLoanStore } from '@/stores/loanStore'
import { buildRequest } from '@/utils/buildRequest'

/**
 * Convenience hook used by CalculatorPage.
 * Keeps mutation logic out of the component.
 */
export function useCalculation() {
  const store = useLoanStore()

  const mutation = useMutation({
    mutationFn: () => loanApi.calculate(buildRequest(useLoanStore.getState())),
    onMutate:   ()         => store.setLoading(true),
    onSuccess:  (data)     => { store.setResult(data); store.setLoading(false) },
    onError:    (e: Error) => store.setError(e.message),
    onSettled:  ()         => store.setLoading(false),
  })

  return {
    calculate: mutation.mutate,
    isLoading: mutation.isPending,
    error:     mutation.error?.message ?? null,
  }
}

/**
 * Lightweight hook to fetch live EMI from the backend as sliders move.
 * Debounced 300ms so it doesn't fire on every slider tick.
 */
export function useLiveEmi() {
  const { loan } = useLoanStore()
  const [liveEmi, setLiveEmi] = useState<number | null>(null)

  useEffect(() => {
    const tid = setTimeout(async () => {
      try {
        const emi = await loanApi.getEmi(
          loan.loanAmount,
          loan.annualInterestRate,
          loan.tenureMonths,
        )
        setLiveEmi(emi)
      } catch {
        // ignore — preview is best-effort
      }
    }, 300)
    return () => clearTimeout(tid)
  }, [loan.loanAmount, loan.annualInterestRate, loan.tenureMonths])

  return liveEmi
}
