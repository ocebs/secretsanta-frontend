import { gql, useQuery } from "@apollo/client";
import { json, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import Avatar from "boring-avatars";
import { ProfilePageQuery } from "~/__generated__/gql";

interface ParamsLoader {
  params: { profileId: string };
}

export const loader: LoaderFunction = async ({ params }) => {
  return json({ params } as ParamsLoader);
};

const profilePageQuery = gql`
  query ProfilePage($id: UUID!) {
    profile(id: $id) {
      id
      name
      bio
      address
      country
      countryByCountry {
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
    }
  );

  if (!data?.profile) return <div>Profile not found</div>;

  const profile = data.profile;

  return !error ? (
    <div className="w-full max-w-screen-lg p-6 mx-auto">
      <div className="flex items-center gap-5 py-12 ">
        <Avatar name={profile.id} size={128} variant="beam" />
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl">{profile.name}</h1>
          <div className="text-2xl">
            {flags[(profile.country ?? -2) - 1]}{" "}
            {profile.countryByCountry?.name}
          </div>
        </div>
      </div>
      <div className="p-4 mb-6 prose bg-gray-100 rounded-lg max-w-none">
        <h2>Bio</h2>
        {profile.bio}
      </div>

      <div className="p-4 prose bg-gray-100 rounded-lg max-w-none">
        <h2>Address</h2>
        <pre className="p-0 text-black bg-gray-100 ">
          {profile.address ?? "No address"}
        </pre>
      </div>
    </div>
  ) : (
    <pre className="text-red-600">{JSON.stringify(error)}</pre>
  );
}
