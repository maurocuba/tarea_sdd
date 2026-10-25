import { useEffect, useReducer } from 'react'
import { groupReducer } from './groupReducer'
import { loadGroup, saveGroup } from './storage'

/** Group state, loaded once from storage and saved after every change (RQ-10). */
export function useGroup() {
  const [group, dispatch] = useReducer(groupReducer, undefined, loadGroup)

  useEffect(() => {
    saveGroup(group)
  }, [group])

  return { group, dispatch }
}
