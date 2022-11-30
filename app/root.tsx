import { gql, useMutation, useQuery } from "@apollo/client";
import type { MetaFunction } from "@remix-run/cloudflare";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useNavigate,
  ScrollRestoration,
} from "@remix-run/react";
import Avatar from "boring-avatars";
import type {
  CreateSessionMutation,
  HeaderProfileQuery,
} from "./__generated__/gql";

import styles from "./__generated__/tailwind.css";

const createSessionMutation = gql`
  mutation CreateSession($description: String!) {
    createSession(input: { description: $description }) {
      jwtToken
    }
  }
`;

const profileQuery = gql`
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

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "OCE Secret santa",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const { data, loading, refetch } = useQuery<HeaderProfileQuery>(profileQuery);
  const [login, { loading: submitting }] = useMutation<CreateSessionMutation>(
    createSessionMutation
  );

  const navigate = useNavigate();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="dark:bg-gray-900 dark:text-gray-200">
        <header
          className={`bg-gradient-to-r from-blue-600 to-pink-700 text-white`}
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
            <nav className="relative flex items-center gap-2">
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
                  <g fill="none" fill-rule="evenodd">
                    <g transform="translate(1 1)" stroke-width="2">
                      <circle stroke-opacity=".5" cx="18" cy="18" r="18" />
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
                to="/login"
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
                  const { data } = await login({
                    variables: {
                      description: navigator.userAgent,
                    },
                  });
                  if (data?.createSession?.jwtToken) {
                    document.cookie = `token=${encodeURIComponent(
                      data?.createSession?.jwtToken
                    )};path=/;max-age=31536000;samesite=lax;secure`;
                    navigate(`/authenticate`);
                  }
                }}
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
                    d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                  />
                </svg>
              </button>
            )}
          </div>
        </header>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
