import { useQuery, useSubscription, gql, useMutation } from "@apollo/client";
import { json, type LoaderFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import Avatar from "boring-avatars";
import { useState } from "react";
import LoadingScreen, { Spinner } from "~/components/LoadingScreen";
import type {
	MatchupMessagesSubscription,
	MatchupQuery,
	SendMessageMutation,
} from "~/__generated__/gql";

import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

interface ParamsLoader {
	params: { id: string };
}

export const meta = () => ({
	title: "Messages | OCE Secret Santa",
});
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
      senderId
      sender {
        id
        name
      }
      message
      timestamp
    }
  }
  fragment Matchup on Matchup {
    id
    senderId
    recipientId
    sender {
      id
      name
      country {
        id
        name
      }
    }
    recipient {
      id
      name
      country {
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

      messagesByMatchup(orderBy: TIMESTAMP_DESC) {
        ...MessageBody
      }
    }
  }
`;

const sendMessageMutation = gql`
  mutation SendMessage($message: String!, $matchup: UUID!, $senderId: UUID!) {
    createMessage(
      input: {
        message: { senderId: $senderId, message: $message, matchup: $matchup }
      }
    ) {
      message {
        id
      }
    }
  }
`;

const messageSubscription = gql`
  ${matchupFragments}
  subscription MatchupMessages($matchup: UUID!) {
    matchup(id: $matchup) {
      ...Matchup

      messagesByMatchup(orderBy: TIMESTAMP_DESC) {
        ...MessageBody
      }
    }
  }
`;

export default function MatchupRoute() {
	const { params } = useLoaderData<ParamsLoader>();
	const [sendMessage, { loading: sendLoading, error: sendError }] =
		useMutation<SendMessageMutation>(sendMessageMutation);

	const { data: staticData, loading: loadingProfile } = useQuery<MatchupQuery>(
		profileQuery,
		{
			variables: {
				matchup: params.id ?? "",
			},
		},
	);

	const { data } = useSubscription<MatchupMessagesSubscription>(
		messageSubscription,
		{
			variables: {
				matchup: params.id ?? "",
				cursor: staticData?.matchup?.messagesByMatchup.pageInfo.endCursor,
			},
		},
	);

	const [currentMessage, setMessage] = useState("");

	if (staticData && !staticData?.currentProfile) return <h1>not logged in</h1>;

	if (loadingProfile || (staticData === undefined && data === undefined)) {
		return <LoadingScreen />;
	}

	const matchup = (data ?? staticData)?.matchup;
	const messages =
		data?.matchup?.messagesByMatchup?.nodes ??
		staticData?.matchup?.messagesByMatchup?.nodes ??
		[];

	if (!matchup) return <div>Matchup not found</div>;

	return (
		<>
			<header
				className="sticky top-0 z-20 bg-white shadow dark:bg-gray-900 dark:text-white"
				key="matchup-header"
			>
				<div className="flex items-center max-w-screen-lg gap-1.5 p-4 px-6 mx-auto ">
					{matchup?.senderId !== staticData?.currentProfileId ? (
						<>
							<Avatar name={matchup?.senderId} variant="beam" size={32} />
							<span className="font-semibold ">
								{matchup?.sender?.name ??
									(matchup?.recipientId == staticData?.currentProfileId
										? "Santa himself"
										: "Captain Incognito")}
							</span>
							is{" "}
						</>
					) : (
						"You're "
					)}
					{matchup?.recipientId !== staticData?.currentProfileId &&
						"sending something to"}
					{matchup?.recipientId !== staticData?.currentProfileId && (
						<>
							<Avatar name={matchup?.recipientId} variant="beam" size={32} />
							<span className="font-semibold ">
								{matchup?.recipient?.name ??
									(matchup?.recipientId == staticData?.currentProfileId
										? "Santa himself"
										: "Captain Incognito")}
							</span>
						</>
					)}
					{matchup?.recipientId == staticData?.currentProfileId &&
						"sending you something"}
					<div className="flex items-center justify-end flex-1">
						<Link
							to={`/profile/${matchup?.recipient?.id}`}
							className="block px-4 py-2 text-white rounded shadow-md bg-gradient-to-r from-blue-500 to-purple-600 w-max"
						>
							View Profile
						</Link>
					</div>
				</div>
			</header>
			<div className="fixed w-full h-96 dots top-[9.5rem] -mb-96"></div>
			<div
				className={
					"flex-1 overflow-y-auto gap-1 overflow-x-hidden relative z-10 flex flex-col-reverse py-24 p-5 max-w-screen-lg mx-auto w-full"
				}
			>
				{sendError && (
					<div className="px-6 text-red-600">{sendError.message}</div>
				)}
				{sendLoading && (
					<div className="flex items-center justify-end w-full gap-2 py-2 font-light">
						Sending...
						<div className="flex items-center justify-center w-12 h-12">
							<Spinner />
						</div>
					</div>
				)}
				{messages?.map((node, n) => {
					if (!matchup) throw "what the fuck";
					const previousMessage = messages[n - 1];
					const nextMessage = messages[n + 1];
					return (
						<div
							key={node.id}
							className={`flex gap-2 ${
								staticData?.currentProfileId == node.senderId
									? "flex-row-reverse"
									: "flex-row"
							} items-end ${
								nextMessage?.senderId !== node.senderId ? "mt-3 md:mt-0" : ""
							}`}
							title={new Date(node?.timestamp).toLocaleString()}
						>
							{previousMessage?.senderId !== node.senderId ? (
								<Link
									to={`/profile/${node.senderId}`}
									className={`w-12 h-12 rounded-full items-end flex overflow-hidden justify-center text-xl flex-shrink-0`}
								>
									<Avatar
										name={node.senderId}
										square
										size={48}
										variant="beam"
									/>
								</Link>
							) : (
								<div className="w-12" />
							)}
							<div
								className={`p-3 px-6 ${
									staticData?.currentProfileId == node.senderId
										? "bg-blue-600 text-white"
										: "bg-gray-200 text-black dark:bg-gray-800 dark:text-white"
								} rounded-3xl max-w-xl break-words [hyphens:auto] ${
									nextMessage?.senderId == node.senderId
										? node.senderId == staticData?.currentProfileId
											? "rounded-tr-md"
											: "rounded-tl-md"
										: ""
								}  ${
									previousMessage?.senderId == node.senderId
										? node.senderId == staticData?.currentProfileId
											? "rounded-br-md"
											: "rounded-bl-md"
										: ""
								}`}
							>
								<div>{node?.message}</div>
							</div>
						</div>
					);
				})}
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const message = currentMessage;
					sendMessage({
						variables: {
							message,
							matchup: matchup.id,
							senderId: staticData?.currentProfileId,
						},
					}).then(() => setMessage(""));
				}}
				className="fixed bottom-0 left-0 z-10 w-full bg-gradient-to-b from-transparent to-white dark:to-gray-900"
			>
				<div className="flex w-full max-w-screen-lg gap-2 p-4 mx-auto">
					<input
						type="text"
						value={currentMessage}
						onChange={(e) => setMessage(e.target.value)}
						className={[
							`flex-1 p-3 px-6 bg-white dark:bg-gray-700 ring-transparent shadow dark rounded-full ring-2 ring-inset focus:outline-none`,
							"",
						].join("\n")}
						autoFocus
						required
						placeholder="Message"
					/>
					<button
						type="submit"
						disabled={sendLoading}
						className="flex items-center justify-center w-12 h-12 text-white bg-blue-600 rounded-full hover:brightness-150"
					>
						<PaperAirplaneIcon className="w-6 h-6" />
					</button>
				</div>
			</form>
		</>
	);
}
