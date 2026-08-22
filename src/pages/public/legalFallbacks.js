export const LEGAL_FALLBACKS = {
  "terminos-y-condiciones": {
    titulo: "Términos y condiciones",
    resumen: "Condiciones generales para usar el sitio y realizar pedidos en Pizza Mya.",
    contenido: `Bienvenido a Pizza Mya. Al utilizar este sitio web, consultar el menú, crear una cuenta o realizar un pedido, aceptas estos términos y condiciones.

1. Uso del sitio
El sitio está diseñado para mostrar productos, combos, promociones, información del negocio y permitir la realización de pedidos en línea. El usuario se compromete a proporcionar información real y actualizada al registrarse o confirmar un pedido.

2. Productos, precios y disponibilidad
Los productos, tamaños, precios, complementos y promociones pueden cambiar sin previo aviso. La disponibilidad depende de inventario, horario de operación y zona de entrega.

3. Pedidos
Todo pedido queda sujeto a confirmación del negocio. Pizza Mya podrá contactar al cliente para confirmar datos, dirección o disponibilidad de productos.

4. Pagos
Los métodos de pago disponibles serán los mostrados durante el proceso de compra.

5. Responsabilidad del usuario
El usuario es responsable de revisar su pedido antes de confirmarlo, incluyendo productos, cantidades, dirección, teléfono y método de entrega.`,
  },
  "aviso-privacidad": {
    titulo: "Aviso de privacidad",
    resumen: "Información sobre el uso y protección de datos personales.",
    contenido: `Pizza Mya reconoce la importancia de proteger los datos personales de sus clientes.

1. Datos que podemos recopilar
Podemos solicitar nombre, teléfono, correo electrónico, dirección de entrega, historial de pedidos y datos necesarios para procesar compras o brindar atención.

2. Finalidad del uso de datos
Los datos se utilizan para registrar usuarios, procesar pedidos, confirmar entregas, brindar soporte y enviar notificaciones relacionadas con pedidos.

3. Protección de información
Pizza Mya aplica medidas razonables de seguridad para proteger la información contra accesos no autorizados, pérdida o uso indebido.

4. Derechos del usuario
El usuario puede solicitar actualización, corrección o eliminación de sus datos contactando al negocio por los medios oficiales publicados en este sitio.`,
  },
  "politica-pedidos": {
    titulo: "Política de pedidos",
    resumen: "Reglas generales para confirmar pedidos, entregas y disponibilidad.",
    contenido: `Esta política describe cómo se manejan los pedidos realizados en Pizza Mya.

1. Confirmación del pedido
El pedido se considera recibido cuando el sistema lo registra correctamente. El negocio puede validar disponibilidad, dirección y datos de contacto antes de prepararlo.

2. Tiempo de preparación y entrega
Los tiempos mostrados son estimados. Pueden variar por demanda, clima, distancia, disponibilidad de repartidores o situaciones externas.

3. Dirección y contacto
El cliente debe proporcionar una dirección clara y un teléfono activo.

4. Disponibilidad de productos
Si un producto no está disponible, Pizza Mya podrá contactar al cliente para ofrecer una alternativa.`,
  },
  cancelaciones: {
    titulo: "Cambios y cancelaciones",
    resumen: "Condiciones para cancelar o solicitar cambios en pedidos.",
    contenido: `Pizza Mya permite solicitar cambios o cancelaciones bajo ciertas condiciones.

1. Cancelación desde la web
El cliente podrá cancelar desde la web únicamente si el pedido se encuentra en estado PENDIENTE.

2. Pedidos confirmados o en preparación
Cuando el pedido ya fue confirmado, está en preparación, listo, en camino o entregado, la cancelación automática ya no estará disponible. En esos casos, el cliente deberá contactar directamente al negocio.

3. Cambios en el pedido
Los cambios dependen del estado del pedido y de si la preparación ya inició.`,
  },
  cookies: {
    titulo: "Uso de cookies",
    resumen: "Información sobre almacenamiento local, sesión y preferencias del sitio.",
    contenido: `Este sitio puede utilizar cookies o almacenamiento local para mejorar la experiencia del usuario.

1. Qué se guarda
Podemos guardar datos de sesión, carrito, preferencias, configuración del sitio y datos necesarios para mantener la navegación.

2. Para qué se utiliza
La información se utiliza para recordar productos agregados al carrito, mantener la sesión iniciada y cargar configuración del negocio.

3. Control del usuario
El usuario puede borrar cookies y datos del navegador desde la configuración de su dispositivo o navegador.`,
  },
};

export function getLegalFallback(slug) {
  return LEGAL_FALLBACKS[slug] || LEGAL_FALLBACKS["terminos-y-condiciones"];
}
