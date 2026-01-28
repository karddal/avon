"use client"

import useSWR from "swr"


const fetcher = (url: string) => fetch(url).then(r => r.json())

export type UnitEvent = { id: string; name: string }

export function useUnits() {
    const {data, error, isLoading} = useSWR<UnitEvent[]>("/api/units", fetcher, {
        dedupingInterval: 5 * 60 * 1000,
        revalidateOnFocus: false,
    })

    const unitOptions = (data ?? []).map(unit => ({
        value: unit.id,
        label: unit.name,
    }))

    return {unitOptions, isLoading, error}
}