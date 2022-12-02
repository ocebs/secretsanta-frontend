import { gql, useQuery } from "@apollo/client";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import Avatar from "boring-avatars";
import LoadingScreen from "~/components/LoadingScreen";
import type { ProfilePageQuery } from "~/__generated__/gql";

interface ParamsLoader {
  params: { profileId: string };
}

export const loader: LoaderFunction = async ({ params }) => {
  return json({ params } as ParamsLoader);
};

const profilePageQuery = gql`
  query ProfilePage($id: UUID!) {
    currentProfileId
    profile(id: $id) {
      id
      name
      bio
      address
      countryId
      country {
        id
        name
      }
    }
  }
`;

const flags = ["🦘", "🥝"];

export default function ProfilePage() {
  const {
    params: { profileId },
  } = useLoaderData<ParamsLoader>();

  const { data, loading, error } = useQuery<ProfilePageQuery>(
    profilePageQuery,
    {
      variables: { id: profileId },
      pollInterval: 1500,
    }
  );

  if (loading || data == undefined) return <LoadingScreen />;

  if (!data?.profile) return <div>Profile not found</div>;

  const profile = data.profile;

  return !error ? (
    <>
      <div className="absolute w-full dots h-96 -z-10"></div>
      <div className="w-full max-w-screen-lg p-6 mx-auto">
        {profile.id == data?.currentProfileId && (
          <div className="px-4 py-3 text-gray-900 bg-blue-100 border-2 border-blue-400 shadow-md shadow-blue-600/30 dark:border-blue-600 dark:text-gray-100 dark:bg-blue-900/50 backdrop-blur-sm rounded-xl">
            Update your profile using the <code>/secretsanta profile</code> and{" "}
            <code>/secretsanta set-country</code> Discord commands
          </div>
        )}
        <div className="flex items-center gap-5 py-12 ">
          <Avatar name={profile.id} size={128} variant="beam" />
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl">{profile.name}</h1>
            <div className="text-2xl">
              {flags[(profile.countryId ?? -2) - 1]} {profile.country?.name}
            </div>
          </div>
        </div>
        <div className="p-4 mb-6 prose rounded-lg dark:prose-invert max-w-none">
          <h2>Bio</h2>
          <div className="whitespace-pre-line">
            {profile.bio ?? <em>No bio set</em>}
          </div>
          <h2>Address</h2>
          <div className="whitespace-pre-line">
            {profile.address ?? <em>No address set</em>}
          </div>
        </div>
      </div>
    </>
  ) : (
    <pre className="text-red-600">{JSON.stringify(error)}</pre>
  );
}
