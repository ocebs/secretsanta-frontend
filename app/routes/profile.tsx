import { useMutation, useQuery, gql } from "@apollo/client";
import { useState } from "react";

const currentSessionQuery = gql`
  query CurrentSessionQuery {
    currentSession {
      timestamp
      description
    }
    currentProfile {
      name
    }
  }
`;

const createSessionMutation = gql`
  mutation CreateSessionMutation($description: String!) {
    createSession(input: { description: $description }) {
      jwtToken
    }
  }
`;

export default function ProfilePage() {
  let { data: session, updateQuery, loading } = useQuery(currentSessionQuery);
  const [description, setDescription] = useState("");

  const [createSession, { data: sessionResult, loading: sessionLoading }] =
    useMutation(createSessionMutation);

  return session?.currentSession ? (
    <pre>{JSON.stringify(session, undefined, 2)}</pre>
  ) : (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const _this = event.currentTarget;
        if (!(_this instanceof HTMLFormElement)) throw "what the fuck";
        createSession({ variables: { description } }).then(async ({ data }) => {
          console.log({ data });
          document.cookie = `token=${encodeURIComponent(
            data?.createSession?.jwtToken
          )}; MaxAge=${86400 * 90}; Secure`;
          location.reload();
        });
      }}
    >
      <input
        type="text"
        name="session"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <button type="submit">Create Session</button>
    </form>
  );
}
