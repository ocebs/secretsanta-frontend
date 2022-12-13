import type { MetaFunction } from "@remix-run/cloudflare";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import Header from "./components/Header";
import styles from "./__generated__/tailwind.css";

export function links() {
	return [
		{ rel: "stylesheet", href: styles },
		{ rel: "shortcut icon", href: "/logo.svg" },
	];
}
export const meta: MetaFunction = () => ({
	charset: "utf-8",
	title: "OCE Secret Santa",
	viewport:
		"width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
});

export default function App() {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="dark:bg-gray-900 dark:text-gray-200">
				<Header />
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
