/**
 * Public-safe shape of a merchant location.
 *
 * Returned by `GET /api/public/locations` — used by the customer-facing
 * site (locations page, pickup picker, search). Never includes merchant_id,
 * access tokens, or any other multi-tenant secrets — the endpoint is
 * intentionally aggregated across all merchants from the customer's POV.
 */
export type PublicLocation = {
  /** URL-safe slug — also doubles as the React key. */
  slug: string;
  /** Display name of the shop (e.g. "Gulf Shores", "Cottage Hill #1"). */
  name: string;
  /** Street + city + state composed for display. */
  address: string;
  city: string;
  state: string;
  zip: string | null;
  phone: string | null;
  /** Geo coords for delivery routing (Phase D). May be null until populated. */
  latitude: number | null;
  longitude: number | null;
  /** Computed Google Maps URL for "Directions" links. */
  mapUrl: string;
  /** Stable photo URL — placeholder for now, real merchant uploads later. */
  image: string;
  /** Order-type availability flags. */
  pickup: boolean;
  delivery: boolean;
};
