import { useQuery, gql } from "@apollo/client";
import { Link } from "@remix-run/react";
import Avatar from "boring-avatars";
import LoadingScreen from "~/components/LoadingScreen";
import type { MatchupListingQuery } from "~/__generated__/gql";
import { NoLoginScreen } from "./authenticate";

const matchupFragment = gql`
  fragment MatchupInfo on MatchupsConnection {
    nodes {
      id
      senderId
      recipientId
      messagesByMatchup(first: 1, orderBy: TIMESTAMP_DESC) {
        nodes {
          id
          senderId
          sender {
            id
            name
          }
          message
          timestamp
        }
      }
      sender {
        id
        name
        bio
        address
        country {
          id
          name
        }
      }
      recipient {
        id
        name
        bio
        address
        country {
          id
          name
        }
      }
    }
  }
`;

const query = gql`
  ${matchupFragment}
  query MatchupListing {
    currentProfileId
    matchups {
      ...MatchupInfo
    }
  }
`;

export default function Index() {
  const { data, loading } = useQuery<MatchupListingQuery>(query, {
    pollInterval: 2000,
  });

  const matchups = data?.matchups?.nodes;
  if (loading || data === undefined) return <LoadingScreen />;

  if (!data.currentProfileId) return <NoLoginScreen />;

  return (
    <div className="w-full max-w-screen-lg p-6 mx-auto">
      {(matchups?.length ?? 0) > 0 ? (
        <div>
          {data ? (
            <ol>
              {data?.matchups?.nodes.map((matchup) => {
                const [lastMessage] = [
                  ...(matchup?.messagesByMatchup.nodes ?? []),
                ].splice(-1);
                return (
                  <li key={matchup.id}>
                    <Link
                      to={`/matchup/${matchup.id}`}
                      className="flex items-center gap-3 p-4 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div>
                        <Avatar
                          name={
                            matchup.senderId === data.currentProfileId
                              ? matchup.recipientId
                              : matchup.senderId
                          }
                          size={64}
                          variant="beam"
                        />
                      </div>
                      <div className="flex flex-col flex-1 gap-1">
                        <div className="text-xl">
                          {(matchup.senderId === data.currentProfileId
                            ? matchup.recipient
                            : matchup.sender
                          )?.name ?? "Mystery man"}
                        </div>
                        <div>
                          {!lastMessage ? (
                            <em>No messages</em>
                          ) : (
                            <>
                              <strong className="font-bold text-gray-900 dark:text-gray-200">
                                {lastMessage.sender?.name ?? "Mystery Man"}
                              </strong>
                              : {lastMessage.message}
                            </>
                          )}
                        </div>
                      </div>
                      {lastMessage?.timestamp && (
                        <div>
                          {new Date(lastMessage.timestamp).toLocaleString()}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div>not logged in </div>
          )}
        </div>
      ) : (
        <div>No matchups</div>
      )}
    </div>
  );
}
