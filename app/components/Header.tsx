import { gql, useMutation, useQuery, useApolloClient } from "@apollo/client";
import { Link } from "@remix-run/react";
import Avatar from "boring-avatars";
import { useEffect, useRef } from "react";

import { CheckIcon } from "@heroicons/react/20/solid";

import type {
  CreateSessionMutation,
  HeaderProfileQuery,
} from "~/__generated__/gql";
import { Spinner } from "./LoadingScreen";
import getLink from "~/link";
import ms from "ms";

const createSessionMutation = gql`
  mutation CreateSession($description: String!) {
    createSession(input: { description: $description }) {
      jwtToken
    }
  }
`;

const headerQuery = gql`
  query HeaderProfile {
    currentProfileId
    currentSession {
      id
      description
    }
    currentProfile {
      id
      name
    }
  }
`;

const navlinks = [
  {
    label: "Ranking",
    href: "https://ocebs.com/",
  },
  {
    label: "Firsts",
    href: "https://ocebs.com/firsts",
  },
];

export default function Header() {
  const { data, startPolling, stopPolling, refetch } =
    useQuery<HeaderProfileQuery>(headerQuery);
  const [login, { data: createSessionData, called: loginCalled }] =
    useMutation<CreateSessionMutation>(createSessionMutation);

  const client = useApolloClient();

  const loginDialogue = useRef<HTMLDivElement>();

  const loginVisible = !data?.currentProfileId;

  async function createLogin() {
    const { data } = await login({
      variables: {
        description: navigator.userAgent,
      },
    });
    if (data?.createSession?.jwtToken) {
      document.cookie = `token=${encodeURIComponent(
        data?.createSession?.jwtToken
      )};path=/;max-age=${ms("5 months") / 1000};samesite=lax`;
      client.setLink(getLink(document.cookie));
      startPolling(1000);
      refetch();
    }
  }

  useEffect(() => {
    if (!data?.currentProfile && !loginCalled) {
      createLogin();
    }

    if (!loginVisible) stopPolling();
  });

  return (
    <>
      <div
        ref={(_this) => (loginDialogue.current = _this ?? undefined)}
        aria-hidden={!loginVisible}
        className={`w-full fixed top-0 left-0 h-full items-center justify-center bg-white dark:bg-gray-900 sm:bg-black/30 shadow-xl ${
          loginVisible ? "flex" : "hidden"
        } z-50`}
      >
        <div className="flex flex-col p-6 gap-3 py-8 sm:h-max max-h[100vh] bg-white dark:bg-gray-900 w-full max-w-[100vw] sm:max-w-screen-sm sm:rounded-xl">
          {data?.currentSession || createSessionData?.createSession ? (
            <>
              <h1 className="flex items-center gap-3 mb-1 text-3xl font-bold">
                <Spinner /> Log in to OCE Secret Santa
              </h1>
              <p>
                To finish logging in, go to{" "}
                <a
                  href="https://discord.com/channels/471250128615899136/564362385956143124"
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  #bot-spam
                </a>{" "}
                and run the command
              </p>
              <pre className="p-4 overflow-auto text-gray-800 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-200">
                <code>
                  /secretsanta login{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    token:{data?.currentSession?.id}
                  </span>
                </code>
              </pre>
            </>
          ) : (
            <>
              <h1 className="flex items-center gap-3 text-3xl font-bold">
                {loginCalled && (
                  <CheckIcon className="absolute w-10 h-10 p-2.5" />
                )}
                <Spinner />
                Creating Session
              </h1>
            </>
          )}
        </div>
      </div>
      <header
        className={`bg-gradient-to-r from-blue-600 to-pink-700 text-white h-20`}
      >
        <div
          className={`max-w-screen-lg mx-auto h-20 px-6 sm:px-8 flex gap-4 items-center justify-between relative`}
        >
          <Link to="/" className="flex items-center gap-3">
            <img
              src={new Date().getMonth() == 5 ? "/gaysabre.svg" : "/logo.svg"}
              className={`h-10 transition-transform transform-gpu hover:-rotate-12 rounded-full`}
              width={40}
              height={40}
              alt="OCE Beat Saber"
            />
            <img
              src="/Wordmark.svg"
              width={218}
              height={20}
              className="hidden h-5 -skew-x-12 sm:block"
              alt=""
            />
          </Link>
          <div className="flex-1" />
          <nav className="relative items-center hidden gap-2 md:flex">
            {navlinks.map((i) => (
              <a
                key={i.href}
                href={i.href}
                className={`" block px-4 py-2.5 rounded whitespace-nowrap overflow-hidden text-ellipsis hover:bg-white/10`}
              >
                {i.label}
              </a>
            ))}
            <Link
              to={"/"}
              className={`" block px-4 py-2.5 rounded whitespace-nowrap overflow-hidden text-ellipsis bg-white/10`}
            >
              Secret Santa
            </Link>
          </nav>
          {data?.currentProfileId && (
            <Link
              to={`/profile/${data.currentProfileId}`}
              className={`bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center`}
            >
              <Avatar name={data.currentProfileId} size={40} variant="beam" />
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
