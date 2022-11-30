import type { MetaFunction } from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import styles from "./__generated__/tailwind.css";

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
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <header
          className={`bg-gradient-to-r from-blue-600 to-pink-700 text-white`}
        >
          <div
            className={`max-w-screen-lg mx-auto h-20 px-6 sm:px-8 flex gap-4 items-center justify-between relative`}
          >
            <a href="/" className="flex items-center gap-3">
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
            </a>
            <div className="flex-1" />
            <nav className="relative flex items-center gap-2">
              {navlinks.map((i) => (
                <a
                  key={i.href}
                  href={i.href}
                  className={`" block px-4 py-2.5 rounded whitespace-nowrap overflow-hidden text-ellipsis ${
                    "/" == i.href ? "bg-white/10" : "hover:bg-white/10"
                  }`}
                >
                  {i.label}
                </a>
              ))}
            </nav>
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
