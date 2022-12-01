import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { endpoint } from "~/link";

export const loader: LoaderFunction = ({ request }) =>
  fetch(endpoint.http, request);
export const action: ActionFunction = ({ request }) =>
  fetch(endpoint.http, request);
