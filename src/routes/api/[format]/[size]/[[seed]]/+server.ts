import type {RequestHandler} from "./$types";

export const GET: RequestHandler = async ({url, params}) => {
  const searchParams = new URLSearchParams();
  searchParams.set("format", params.format);
  searchParams.set("size", params.size);
  if (params.seed) searchParams.set("seed", params.seed);

  return new Response(null, {
    status: 301,
    headers: {
      Location: `/api?${searchParams}`
    }
  });
};
