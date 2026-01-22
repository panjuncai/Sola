import { atomWithQuery } from "jotai-tanstack-query"
import type { QueryObserverOptions } from "@tanstack/query-core"

type QueryProcedure<TInput, TOutput> = {
  query: (input: TInput) => Promise<TOutput>
}

type TrpcAtomOptions<TOutput> = Omit<
  QueryObserverOptions<TOutput, unknown, TOutput, TOutput, unknown[]>,
  "queryKey" | "queryFn"
>

export const trpcAtom = <TInput, TOutput>(
  key: string,
  procedure: QueryProcedure<TInput, TOutput>,
  input: TInput,
  options: TrpcAtomOptions<TOutput> = {}
) =>
  atomWithQuery<TOutput>(() => ({
    queryKey: [key, input],
    queryFn: () => procedure.query(input),
    ...options,
  }))
