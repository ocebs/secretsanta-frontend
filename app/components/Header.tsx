import { gql, useMutation, useQuery, useApolloClient } from "@apollo/client";
import { Link, useNavigate } from "@remix-run/react";
import Avatar from "boring-avatars";
import { useEffect, useRef, useState } from "react";

import { UserPlusIcon } from "@heroicons/react/24/outline";

import type {
  CreateSessionMutation,
  HeaderProfileQuery,
} from "~/__generated__/gql";
import { useLoginStatusLazyQuery } from "~/__generated__/gql";
import { Spinner } from "./LoadingScreen";
import getLink from "~/link";

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
  {
    label: "Secret Santa",
    href: "/",
  },
];

export default function Header() {
  const { data, loading, startPolling, stopPolling } =
    useQuery<HeaderProfileQuery>(headerQuery);
  const [
    login,
    { loading: submitting, data: createSessionData, called: loginCalled },
  ] = useMutation<CreateSessionMutation>(createSessionMutation);

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
      )};path=/;max-age=31536000;samesite=lax`;
      client.setLink(getLink(document.cookie));
      startPolling(1000);
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
        className={`w-full fixed top-0 left-0 h-full items-center justify-center bg-white dark:bg-gray-900 sm:bg-black/30 shadow-xl transition-all ${
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
                >
                  #bot-spam
                </a>{" "}
                and run the command
              </p>
              <pre className="p-4 overflow-auto text-gray-800 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-200">
                <code>
                  /secretsanta login{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    {data?.currentSession?.id}
                  </span>
                </code>
              </pre>
            </>
          ) : (
            <>
              <h1 className="flex gap-3">
                <Spinner /> Creating Session {loginCalled && "login called"}
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
              <Link
                key={i.href}
                to={i.href}
                className={`" block px-4 py-2.5 rounded whitespace-nowrap overflow-hidden text-ellipsis ${
                  "/" == i.href ? "bg-white/10" : "hover:bg-white/10"
                }`}
              >
                {i.label}
              </Link>
            ))}
          </nav>
          {loading || submitting ? (
            <div
              className={`bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center p-2`}
            >
              <svg
                width="38"
                height="38"
                viewBox="0 0 38 38"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#fff"
                className="animate-spin"
              >
                <g fill="none" fillRule="evenodd">
                  <g transform="translate(1 1)" strokeOpacity="2">
                    <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
                    <path d="M36 18c0-9.94-8.06-18-18-18" />
                  </g>
                </g>
              </svg>
            </div>
          ) : data?.currentProfileId ? (
            <Link
              to={`/profile/${data.currentProfileId}`}
              className={`bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center`}
            >
              <Avatar name={data.currentProfileId} size={40} variant="beam" />
            </Link>
          ) : data?.currentSession ? (
            <Link
              to="/authenticate"
              className={`bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
            </Link>
          ) : (
            <button
              onClick={async () => {
                loginDialogue.current?.showModal();
                createLogin();
              }}
              className={`bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center`}
            >
              <UserPlusIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>
    </>
  );
}
