import type {RequestHandler} from "./$types";
import {validateImageQuery, validateImageRequest} from "$lib/api/limits";
import {apiError} from "$lib/api/responses";

export const GET: RequestHandler = async ({params, url}) => {
  try {
    // Check the original URL before set() can hide duplicates or shorten it.
    validateImageQuery(url);
    const target = new URL("/api", url);
    target.search = url.search;
    const searchParams = target.searchParams;
    // Explicit path parameters win; a query seed is used when the path omits it.
    searchParams.set("format", params.format);
    searchParams.set("size", params.size);
    if (params.seed !== undefined) searchParams.set("seed", params.seed);
    const {size} = validateImageRequest(target);
    searchParams.set("size", String(size));

    return new Response(null, {
      status: 301,
      headers: {Location: `/api?${searchParams}`}
    });
  } catch (error) {
    return apiError(error);
  }
};
