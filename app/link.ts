import { setContext } from "@apollo/client/link/context";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";

export default function getLink(cookieString: string) {
  const cookies = new Map(
    cookieString.split(/; */g).map((i) => {
      let a = i.split("=");
      return [a.splice(0, 1)[0], decodeURIComponent(a.join("="))];
    })
  );

  const authLink = setContext((_, { headers }) => {
    const token = cookies.get("token");

    const headerClone = { ...headers };

    if (token) headerClone["Authorization"] = `Bearer ${token}`;

    return {
      headers: headerClone,
    };
  });

  const httpLink = new BatchHttpLink({
    uri:
      typeof window == "undefined"
        ? "https://gql.ocebs.com/graphql"
        : "/graphql",
  });

  const token = cookies.get("token");

  const connectionParams: Record<string, any> = {};

  if (token) connectionParams.authorization = `Bearer ${token}`;

  const wsLink =
    typeof window !== "undefined" &&
    new WebSocketLink(
      new SubscriptionClient("wss://gql.ocebs.com/graphql", {
        connectionParams: () => Promise.resolve(connectionParams),
        reconnect: true,
      })
    );

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);

      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink || httpLink,
    httpLink
  );

  return authLink.concat(splitLink);
}
