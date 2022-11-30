import { useQuery, useSubscription, gql } from "@apollo/client";
import { Link } from "@remix-run/react";

const query = gql`
  query MatchupListing {
    matchups {
      nodes {
        id
        profileBySender {
          name
          bio
          address
          countryByCountry {
            id
            name
          }
        }
        profileByRecipient {
          name
          bio
          address
          countryByCountry {
            id
            name
          }
        }
      }
    }
  }
`;

export default function Index() {
  const { data, loading, error } = useQuery(query);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      {data?.matchups?.nodes?.length ?? 0 > 0 ? (
        <div>
          {data ? (
            <ol>
              {data?.matchups?.nodes.map((matchup) => (
                <li key={matchup.id}>
                  <Link to={`/matchup/${matchup.id}`}>
                    {matchup.profileBySender?.name ?? "Mystery Man"} &rarr;{" "}
                    {matchup.profileByRecipient?.name ?? "Mystery Man"}
                  </Link>
                </li>
              ))}
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
