import { useQuery, useSubscription, gql } from "@apollo/client";
import { json, type LoaderFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import Avatar from "boring-avatars";
import { MatchupMessagesSubscription, MatchupQuery } from "~/__generated__/gql";

interface ParamsLoader {
  params: { id: string };
}

export const loader: LoaderFunction = async ({ params }) => {
  return json({ params } as ParamsLoader);
};

const matchupFragments = gql`
  fragment MessageBody on MessagesConnection {
    pageInfo {
      endCursor
    }
    nodes {
      id
      sender
      profileBySender {
        id
        name
      }
      message
      timestamp
    }
  }
  fragment Matchup on Matchup {
    sender
    recipient
    profileBySender {
      id
      name
      countryByCountry {
        id
        name
      }
    }
    profileByRecipient {
      id
      name
      countryByCountry {
        id
        name
      }
    }
  }
`;

const profileQuery = gql`
  ${matchupFragments}

  query Matchup($matchup: UUID!) {
    currentProfile {
      id
      name
      id
    }

    currentProfileId

    matchup(id: $matchup) {
      ...Matchup

      messagesByMatchup(orderBy: TIMESTAMP_ASC) {
        ...MessageBody
      }
    }
  }
`;

const messageSubscription = gql`
  ${matchupFragments}
  subscription MatchupMessages($matchup: UUID!, $cursor: Cursor) {
    matchup(id: $matchup) {
      ...Matchup

      messagesByMatchup(orderBy: TIMESTAMP_ASC, after: $cursor) {
        ...MessageBody
      }
    }
  }
`;

export default function MatchupRoute() {
  const { params } = useLoaderData<ParamsLoader>();

  const { data: staticData, loading: loadingProfile } = useQuery<MatchupQuery>(
    profileQuery,
    {
      variables: {
        matchup: params.id ?? "",
      },
    }
  );

  const { data, loading } = useSubscription<MatchupMessagesSubscription>(
    messageSubscription,
    {
      variables: {
        matchup: params.id ?? "",
        cursor: staticData?.matchup?.messagesByMatchup.pageInfo.endCursor,
      },
    }
  );

  if (staticData && !staticData?.currentProfile) return <h1>not logged in</h1>;

  const matchup = (data ?? staticData)?.matchup;
  const messages = [
    ...(staticData?.matchup?.messagesByMatchup?.nodes ?? []),
    ...(data?.matchup?.messagesByMatchup?.nodes ?? []),
  ];

  if (!matchup) return <div>Matchup not found</div>;

  return (
    <>
      <header className="sticky top-0 bg-white shadow" key="matchup-header">
        <div className="flex items-center max-w-screen-lg gap-1.5 p-4 px-6 mx-auto">
          {matchup?.sender !== staticData?.currentProfileId ? (
            <>
              <Avatar name={matchup?.sender} variant="beam" size={32} />
              <span className="font-semibold ">
                {matchup?.profileBySender?.name ??
                  (matchup?.recipient == staticData?.currentProfileId
                    ? "Santa himself"
                    : "Captain Incognito")}
              </span>
              is{" "}
            </>
          ) : (
            "You're "
          )}
          {matchup?.recipient !== staticData?.currentProfileId &&
            "sending something to"}
          {matchup?.recipient !== staticData?.currentProfileId && (
            <>
              <Avatar name={matchup?.recipient} variant="beam" size={32} />
              <span className="font-semibold ">
                {matchup?.profileByRecipient?.name ??
                  (matchup?.recipient == staticData?.currentProfileId
                    ? "Santa himself"
                    : "Captain Incognito")}
              </span>
            </>
          )}
          {matchup?.recipient == staticData?.currentProfileId &&
            "sending you something"}
          <div className="flex items-center justify-end flex-1">
            <Link
              to={`/profile/${matchup?.profileByRecipient?.id}`}
              className="block px-4 py-2 text-white rounded shadow-md bg-gradient-to-r from-blue-500 to-purple-600 w-max"
            >
              View Profile
            </Link>
          </div>
        </div>
      </header>
      <div className="flex flex-col w-full max-w-screen-lg gap-1 p-6 mx-auto">
        {messages?.map((node, n) => {
          if (!matchup) throw "what the fuck";
          const previousMessage = messages[n - 1];
          const nextMessage = messages[n + 1];
          return (
            <div
              key={node.id}
              className={`flex gap-2 ${
                staticData?.currentProfileId == node.sender
                  ? "flex-row-reverse"
                  : "flex-row"
              } items-end ${
                nextMessage?.sender !== node.sender ? "mb-3 md:mb-0" : ""
              }`}
              title={new Date(node?.timestamp).toLocaleString()}
            >
              <div
                className={`w-12 h-full rounded-3xl items-end flex overflow-hidden justify-center text-xl flex-shrink-0 ${
                  nextMessage?.sender == node.sender ? "opacity-0" : ""
                }`}
              >
                <Avatar name={node.sender} square size={48} variant="beam" />
              </div>
              <div
                className={`p-3 px-6 ${
                  staticData?.currentProfileId == node.sender
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-200 text-black"
                } rounded-3xl max-w-xl ${
                  nextMessage?.sender == node.sender
                    ? node.sender == staticData?.currentProfileId
                      ? "rounded-br-md"
                      : "rounded-bl-md"
                    : ""
                }  ${
                  previousMessage?.sender == node.sender
                    ? node.sender == staticData?.currentProfileId
                      ? "rounded-tr-md"
                      : "rounded-tl-md"
                    : ""
                }`}
              >
                <div>{node?.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
