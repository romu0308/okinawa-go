import type { APIRoute } from 'astro';
export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const spot = url.searchParams.get('spot');
  if (!spot) {
    return new Response(JSON.stringify({ error: 'spot_required' }), { status: 400 });
  }
  const { getReviews } = await import('../../../lib/supabase');
  const reviews = await getReviews(spot);
  return new Response(JSON.stringify(reviews), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const { spotSlug, name, rating, comment } = await request.json();
  if (!spotSlug || !rating || !comment) {
    return new Response(JSON.stringify({ error: 'missing_fields' }), { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return new Response(JSON.stringify({ error: 'invalid_rating' }), { status: 400 });
  }
  const { addReview } = await import('../../../lib/supabase');
  const result = await addReview(spotSlug, name || '', rating, comment);
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
};
