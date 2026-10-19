import { createHmac, timingSafeEqual } from "node:crypto";

const SITE_URL = "https://rodrigo936.github.io/rplay-digital/";
const DEFAULT_GRAPH_API_VERSION = "v26.0";
const AUTO_REPLY = [
  "¡Hola! Gracias por escribir a RPlay Digital 👋",
  "Podés ver el catálogo de TV Digital y nuestras opciones acá:",
  SITE_URL,
  "Desde el catálogo podés consultar planes o pedir un demo. Decime qué aplicación te interesa y te ayudo.",
].join("\n\n");

function plainResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

function constantTimeStringMatch(expected, received) {
  if (typeof expected !== "string" || typeof received !== "string") return false;
  const expectedBytes = Buffer.from(expected);
  const receivedBytes = Buffer.from(received);
  return expectedBytes.length === receivedBytes.length
    && timingSafeEqual(expectedBytes, receivedBytes);
}

function isValidMetaSignature(rawBody, signatureHeader, appSecret) {
  if (!signatureHeader?.startsWith("sha256=") || !appSecret) return false;

  const receivedHex = signatureHeader.slice("sha256=".length);
  if (!/^[a-f0-9]{64}$/i.test(receivedHex)) return false;

  const expectedHex = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");
  return constantTimeStringMatch(expectedHex, receivedHex.toLowerCase());
}

function getMissingConfiguration(method) {
  const required = method === "GET"
    ? ["WHATSAPP_VERIFY_TOKEN"]
    : [
        "WHATSAPP_VERIFY_TOKEN",
        "META_APP_SECRET",
        "WHATSAPP_ACCESS_TOKEN",
        "WHATSAPP_PHONE_NUMBER_ID",
      ];
  return required.filter((name) => !process.env[name]);
}

async function sendCatalogReply(recipient) {
  const version = process.env.WHATSAPP_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  if (!/^v\d+\.\d+$/.test(version)) {
    throw new Error("La versión de Graph API no tiene un formato válido.");
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!/^\d+$/.test(phoneNumberId)) {
    throw new Error("El identificador del número de WhatsApp no tiene un formato válido.");
  }
  const endpoint = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: { preview_url: false, body: AUTO_REPLY },
    }),
  });

  if (!response.ok) {
    throw new Error(`Meta rechazó el envío (HTTP ${response.status}).`);
  }
}

export default async (request) => {
  if (request.method !== "GET" && request.method !== "POST") {
    return plainResponse("Método no permitido", 405);
  }

  const missing = getMissingConfiguration(request.method);
  if (missing.length > 0) {
    console.error(`Faltan variables privadas en Netlify: ${missing.join(", ")}`);
    return plainResponse("La función todavía no está configurada.", 503);
  }

  if (request.method === "GET") {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (
      mode === "subscribe"
      && challenge
      && constantTimeStringMatch(process.env.WHATSAPP_VERIFY_TOKEN, token)
    ) {
      return plainResponse(challenge);
    }
    return plainResponse("Verificación rechazada", 403);
  }

  const rawBody = await request.text();
  if (!isValidMetaSignature(
    rawBody,
    request.headers.get("x-hub-signature-256"),
    process.env.META_APP_SECRET,
  )) {
    return plainResponse("Firma inválida", 401);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return plainResponse("JSON inválido", 400);
  }

  if (payload.object !== "whatsapp_business_account") {
    return plainResponse("EVENT_RECEIVED");
  }

  const messages = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value?.messages ?? []) {
        if (typeof message.from === "string" && message.from.length > 0) {
          messages.push(message.from);
        }
      }
    }
  }

  // Acknowledge authentic webhooks even if Meta's send endpoint is temporarily
  // unavailable, so a delivery retry cannot accidentally send duplicate replies.
  for (const recipient of messages) {
    try {
      await sendCatalogReply(recipient);
    } catch {
      console.error("No se pudo enviar una respuesta automática de WhatsApp.");
    }
  }

  return plainResponse("EVENT_RECEIVED");
};

