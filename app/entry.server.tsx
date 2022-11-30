import type { EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { renderToStringWithData } from "@apollo/client/react/ssr";
import getLink from "./link";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const client = new ApolloClient({
    ssrMode: true,
    link: getLink(request.headers.get("cookie") ?? ""),
    cache: new InMemoryCache(),
  });
  const markup = (
    await renderToStringWithData(
      <ApolloProvider client={client}>
        <RemixServer context={remixContext} url={request.url} />
      </ApolloProvider>
    )
  ).replace(
    /(<\/body><\/html>)$/i,
    `${renderToStaticMarkup(
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__GQL_STATE__ = ${JSON.stringify(client.extract())}`,
        }}
      />
    )}$1`
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response(`<!doctype html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
