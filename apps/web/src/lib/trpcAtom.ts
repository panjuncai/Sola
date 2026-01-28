import { atomWithQuery } from "jotai-tanstack-query"
import type { AtomWithQueryOptions } from "jotai-tanstack-query"
import type { DefaultError, QueryKey } from "@tanstack/query-core"

type QueryProcedure<TInput, TOutput> = {
  query: (input: TInput) => Promise<TOutput>
}

type TrpcAtomOptions<TOutput> = Omit<
  AtomWithQueryOptions<TOutput, DefaultError, TOutput, QueryKey>,
  "queryKey" | "queryFn"
>

export const trpcAtom = <TInput, TOutput>(
  key: string,
  procedure: QueryProcedure<TInput, TOutput>,
  input: TInput,
  options: TrpcAtomOptions<TOutput> = {}
) =>
  atomWithQuery<TOutput, DefaultError, TOutput, QueryKey>(() => {
    const queryKey =
      input === undefined ? ([key] as const) : ([key, input] as const)
    return {
      queryKey,
      queryFn: () => procedure.query(input),
      ...options,
    }
  })
