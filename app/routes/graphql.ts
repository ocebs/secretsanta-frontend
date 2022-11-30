import { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = ({ request }) =>
  fetch("https://gql.ocebs.com/graphql", request);
export const action: ActionFunction = ({ request }) =>
  fetch("https://gql.ocebs.com/graphql", request);
