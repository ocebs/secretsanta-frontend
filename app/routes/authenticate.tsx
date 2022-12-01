import { gql, useQuery } from "@apollo/client";
import { Link, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import type { AuthenticateInfoQuery } from "~/__generated__/gql";

const query = gql`
  query AuthenticateInfo {
    currentProfileId
    currentSession {
      id
      description
    }
  }
`;

export const NoLoginScreen = () => (
  <div className="flex items-center justify-center flex-1">
    <article className="prose dark:prose-invert">
      <h1>No Session</h1>
      <p>
        To log in, click the button in the top right corner and reload the page.
      </p>
    </article>
  </div>
);

export default function AuthenticatePage() {
  const { data, refetch } = useQuery<AuthenticateInfoQuery>(query, {
    pollInterval: 500,
  });

  const navigate = useNavigate();
  const profileURL = `/profile/${data?.currentProfileId}`;

  useEffect(() => {
    if (data?.currentProfileId) navigate(profileURL);
  });
  if (data?.currentProfileId) {
    return (
      <div className="w-full max-w-screen-lg p-4 mx-auto text-lg prose dark:prose-invert">
        <p>You're already logged in.</p>
        <p>
          If you're not automatically redirected,{" "}
          <Link to={`/profile/${data.currentProfileId}`}>Click here</Link> to
          visit your profile.
        </p>
      </div>
    );
  }

  return data?.currentSession ? (
    <div className="flex items-center justify-center flex-1">
      <article className="prose dark:prose-invert">
        <h1>Log in to OCE secret santa</h1>
        <p>
          To finish logging in to the website, go to{" "}
          <a href="https://discord.com/channels/471250128615899136/564362385956143124">
            #bot-spam
          </a>{" "}
          and run the command
        </p>
        <pre>
          <code>/secretsanta login {data?.currentSession?.id}</code>
        </pre>
        <button onClick={() => refetch()}>Refresh</button>
      </article>
    </div>
  ) : (
    <NoLoginScreen />
  );
}
