# RPlay Digital

Sitio web estático de RPlay Digital, desarrollado con HTML, CSS y JavaScript.

## Abrir el sitio

Abrí `index.html` en un navegador.

## Publicar

El proyecto puede publicarse vinculando este repositorio con Netlify. Los archivos públicos del sitio están en la raíz y en `assets/`.

## Respuesta automática de WhatsApp

El endpoint está en `/.netlify/functions/whatsapp-webhook`. Netlify lo publica junto al sitio cuando conectás este repositorio y ejecutás un deploy. La página pública de GitHub Pages sigue usando sus archivos de la raíz.

### Configuración privada en Netlify

En la configuración del sitio de Netlify, agregá estas variables para el alcance de Functions y volvé a publicar:

- `WHATSAPP_VERIFY_TOKEN`: texto aleatorio que vas a elegir y copiar también en la configuración del webhook de Meta.
- `META_APP_SECRET`: App Secret de la app de Meta. Guardalo solamente en Netlify; no lo subas a GitHub ni lo pegues en un chat.
- `WHATSAPP_ACCESS_TOKEN`: token de acceso de WhatsApp Cloud API. Para la prueba inicial, usá el token que muestra Meta en API Setup; puede vencer.
- `WHATSAPP_PHONE_NUMBER_ID`: identificador del número de prueba que muestra Meta en API Setup.
- `WHATSAPP_GRAPH_API_VERSION`: opcional; si no se define, la función usa `v26.0`.

Después del deploy, copiá la URL `https://TU-SITIO.netlify.app/.netlify/functions/whatsapp-webhook` en Meta Developers, en la configuración de Webhooks de WhatsApp. Ingresá el mismo `WHATSAPP_VERIFY_TOKEN` y suscribí el campo `messages`.

La función valida la verificación inicial de Meta y la firma de cada aviso. Cuando llega un mensaje a la cuenta de prueba, responde con el enlace al catálogo de RPlay Digital. Esta conexión de prueba no activa todavía el WhatsApp Business real.
