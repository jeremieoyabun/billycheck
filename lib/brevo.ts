// lib/brevo.ts — Brevo API helpers (server-side only)

const BREVO_BASE = "https://api.brevo.com/v3";

export const BREVO_LIST_ELECTRICITY = 3;
export const BREVO_LIST_TELECOM = 4;

function getApiKey() {
  return process.env.BREVO_API_KEY ?? null;
}

async function brevoFetch(path: string, body: unknown) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("BREVO_API_KEY not set — skipping Brevo call");
    return null;
  }

  const res = await fetch(`${BREVO_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  return res;
}

/** Add email to a Brevo list */
export async function addToList(email: string, listId: number) {
  try {
    const res = await brevoFetch(
      `/contacts/lists/${listId}/contacts/add`,
      { emails: [email] }
    );
    if (res && !res.ok && res.status !== 400 && res.status !== 409) {
      const text = await res.text().catch(() => "");
      console.error("Brevo addToList error:", res.status, text);
    }
  } catch (err) {
    console.error("Brevo addToList failed:", err);
  }
}

/** Create or update a contact with attributes */
export async function upsertContact(
  email: string,
  attributes: Record<string, string | number | boolean>,
  listIds?: number[]
) {
  try {
    const body: Record<string, unknown> = {
      email,
      attributes,
      updateEnabled: true,
    };
    if (listIds?.length) body.listIds = listIds;

    const res = await brevoFetch("/contacts", body);
    if (res && !res.ok && res.status !== 204) {
      const text = await res.text().catch(() => "");
      console.error("Brevo upsertContact error:", res.status, text);
    }
  } catch (err) {
    console.error("Brevo upsertContact failed:", err);
  }
}

/** Send an event for automation triggers (Brevo v3/events API) */
export async function trackEvent(
  email: string,
  eventName: string,
  eventProperties?: Record<string, string | number | boolean>
) {
  try {
    const body: Record<string, unknown> = {
      event_name: eventName,
      identifiers: { email_id: email },
    };
    if (eventProperties) body.event_properties = eventProperties;

    const res = await brevoFetch("/events", body);
    if (res && !res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Brevo trackEvent error:", res.status, text);
    }
  } catch (err) {
    console.error("Brevo trackEvent failed:", err);
  }
}
