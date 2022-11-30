import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { RemixBrowser } from "@remix-run/react";
import { hydrate } from "react-dom";
import getLink from "./link";

const client = new ApolloClient({
  /// @ts-expect-error apollo cache
  cache: new InMemoryCache().restore(window.__GQL_STATE__),
  link: getLink(document.cookie),
  ssrForceFetchDelay: 100, // in milliseconds
});

hydrate(
  <ApolloProvider client={client}>
    <RemixBrowser />
  </ApolloProvider>,
  document
);
