import React, { useState, useTransition } from "react";
import {
  HydrationBoundary,
  QueryClientProvider,
  dehydrate,
  queryOptions,
  useSuspenseQuery,
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";
import { Button } from "./ui/button";

export default function App() {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(pokemonOptions({ id: 1 }));

  return (
    <main>
      <QueryClientProvider client={queryClient}>
        <h1>Pokemon Info</h1>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <PokemonInfo />
        </HydrationBoundary>
      </QueryClientProvider>
    </main>
  );
}

export function PokemonInfo() {
  const [id, setId] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { data } = useSuspenseQuery(pokemonOptions({ id }));

  return (
    <div>
      <figure>
        <img src={data.sprites.front_shiny} height={200} alt={data.name} />
        <h2>I'm {data.name}</h2>
        <p>{JSON.stringify(data.abilities)}</p>
      </figure>

      <Button
        onClick={() => {
          startTransition(() => {
            setId((prev) => prev - 1);
          });
        }}
        disabled={isPending}
      >
        prev
      </Button>

      <Button
        onClick={() => {
          startTransition(() => {
            setId((prev) => prev + 1);
          });
        }}
        disabled={isPending}
      >
        next
      </Button>
    </div>
  );
}

export const pokemonOptions = ({ id }: { id: number }) => {
  return queryOptions({
    queryKey: ["pokemon", id],
    queryFn: async () => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

      return response.json();
    },
  });
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
