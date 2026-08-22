import { apiFetch } from "./cliente.js";
import { buildApiUrl, HttpError } from "./http.js";

/**
 * Intenta cada request en orden.
 * Si alguno falla con 401, propaga inmediatamente.
 */
async function tryMany(requests = []) {
  let lastError = null;

  for (const request of requests) {
    try {
      return await request();
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError || new Error("No se pudo completar la solicitud");
}

function authOptions(token, extra = {}) {
  return {
    auth: false,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(extra.headers || {}),
    },
    ...extra,
  };
}

function extractDownloadFilename(response, fallback = "archivo_descarga") {
  const disposition = response.headers.get("content-disposition") || "";

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]).replace(/["']/g, "").trim();
    } catch {
      return utf8Match[1].replace(/["']/g, "").trim();
    }
  }

  const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1].trim();
  }

  return fallback;
}

async function postFormData(url, token, formData) {
  let response;

  try {
    response = await fetch(buildApiUrl(url), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload?.message || payload?.error || "No se pudo completar la solicitud",
    );
  }

  return payload;
}

async function downloadBinaryWithAuth(url, token, fallbackName) {
  let response;

  try {
    response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor para descargar el archivo",
    );
  }

  if (!response.ok) {
    let message = "No se pudo descargar el archivo";

    try {
      const json = await response.json();
      message = json?.message || json?.error || message;
    } catch {
      // ignorar
    }

    if (response.status === 401) {
      throw new Error("Tu sesión no es válida para descargar este archivo");
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const filename = extractDownloadFilename(response, fallbackName);
  const blobUrl = window.URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    window.setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
  }

  return true;
}

function getFilenameFromDisposition(disposition = "", fallback = "archivo") {
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]).replace(/["']/g, "").trim();
    } catch {
      return utf8Match[1].replace(/["']/g, "").trim();
    }
  }

  const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1].trim();
  }

  return fallback;
}

function getPickerAcceptConfig(
  filename,
  contentType = "application/octet-stream",
) {
  const extMatch = String(filename || "").match(/(\.[a-z0-9]+)$/i);
  const ext = extMatch?.[1] || "";

  return [
    {
      description: "Archivo descargado",
      accept: {
        [contentType]: ext ? [ext] : [],
      },
    },
  ];
}

async function saveBlobWithDialog(blob, suggestedName, contentType) {
  if (window.showSaveFilePicker) {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: getPickerAcceptConfig(suggestedName, contentType),
    });

    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  }

  const blobUrl = window.URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = suggestedName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  }

  return true;
}

function normalizeImportId(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);

  const candidate =
    value?.importId ??
    value?.import_id ??
    value?.uploadId ??
    value?.upload_id ??
    value?.id ??
    value?.historyId;

  return Number(candidate || 0);
}

function isFormData(value) {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

function normalizePedidoArgs(arg1, arg2) {
  if (typeof arg1 === "object" && arg1 !== null) {
    return {
      token: arg1.token,
      id: arg1.id ?? arg2,
    };
  }

  return {
    token: arg1,
    id: arg2,
  };
}

export const cajeroApi = {
  // =========================
  // PEDIDOS
  // =========================
  async listPedidos(token) {
    const data = await tryMany([
      () => apiFetch("/api/cajero/orders", authOptions(token)),
      () => apiFetch("/api/cashier/orders", authOptions(token)),
    ]);
    return Array.isArray(data) ? data : [];
  },

  async getPedidos({ token }) {
    const data = await tryMany([
      () => apiFetch("/api/cajero/orders", authOptions(token)),
      () => apiFetch("/api/cashier/orders", authOptions(token)),
    ]);
    return Array.isArray(data) ? data : [];
  },

  async getPedidoDetalle(arg1, arg2) {
    const { token, id } = normalizePedidoArgs(arg1, arg2);
    if (!id) throw new Error("Id de pedido requerido");

    return tryMany([
      () => apiFetch(`/api/cajero/orders/${id}`, authOptions(token)),
      () => apiFetch(`/api/cashier/orders/${id}`, authOptions(token)),
    ]);
  },

  async listMetodosPago(token) {
    const data = await tryMany([
      () => apiFetch("/api/cajero/payment-methods", authOptions(token)),
      () => apiFetch("/api/cashier/payment-methods", authOptions(token)),
    ]);
    return Array.isArray(data) ? data : [];
  },

  async changeStatus(token, id, estatus) {
    if (!id) throw new Error("Id de pedido requerido");
    if (!estatus) throw new Error("Estatus requerido");

    return tryMany([
      () =>
        apiFetch(
          `/api/cajero/orders/${id}/status`,
          authOptions(token, { method: "PATCH", body: { estatus } }),
        ),
      () =>
        apiFetch(
          `/api/cashier/orders/${id}/status`,
          authOptions(token, { method: "PATCH", body: { estatus } }),
        ),
    ]);
  },

  async updatePedidoStatus(token, id, estatus) {
    return this.changeStatus(token, id, estatus);
  },

  async markPaid(token, id, paymentData = {}) {
    if (!id) throw new Error("Id de pedido requerido");
    if (!paymentData?.metodo_pago_id) {
      throw new Error("Método de pago requerido");
    }

    return tryMany([
      () =>
        apiFetch(
          `/api/cajero/orders/${id}/pay`,
          authOptions(token, {
            method: "PATCH",
            body: paymentData,
          }),
        ),
      () =>
        apiFetch(
          `/api/cashier/orders/${id}/pay`,
          authOptions(token, {
            method: "PATCH",
            body: paymentData,
          }),
        ),
    ]);
  },

  async pagarPedido({ token, id, ...paymentData }) {
    return this.markPaid(token, id, paymentData);
  },

  async marcarPagado(token, id, paymentData) {
    return this.markPaid(token, id, paymentData);
  },

  // =========================
  // NOTIFICACIONES
  // =========================
  async listNotifications(token) {
    const data = await apiFetch("/api/notifications", authOptions(token));
    return Array.isArray(data) ? data : [];
  },

  async markNotificationAsRead(token, id) {
    if (!id) throw new Error("Id de notificación requerido");
    return apiFetch(
      `/api/notifications/${id}/read`,
      authOptions(token, { method: "PATCH" }),
    );
  },

  async markAllNotificationsAsRead(token) {
    return apiFetch(
      "/api/notifications/read-all",
      authOptions(token, { method: "PATCH" }),
    );
  },

  // =========================
  // RESPALDOS
  // =========================
  async listBackupTables(token) {
    const data = await tryMany([
      () => apiFetch("/api/cajero/backups/tables", authOptions(token)),
      () => apiFetch("/api/cashier/backups/tables", authOptions(token)),
    ]);
    return Array.isArray(data) ? data : [];
  },

  async backupFull(token) {
    return tryMany([
      () =>
        apiFetch(
          "/api/cajero/backups/full",
          authOptions(token, { method: "POST" }),
        ),
      () =>
        apiFetch(
          "/api/cashier/backups/full",
          authOptions(token, { method: "POST" }),
        ),
    ]);
  },

  async backupTable(token, schema, table) {
    if (!schema || !table) throw new Error("Debes seleccionar esquema y tabla");

    return tryMany([
      () =>
        apiFetch(
          `/api/cajero/backups/table/${schema}/${table}`,
          authOptions(token, { method: "POST" }),
        ),
      () =>
        apiFetch(
          `/api/cashier/backups/table/${schema}/${table}`,
          authOptions(token, { method: "POST" }),
        ),
    ]);
  },

  async listRestorableBackups(token, limit = 50) {
    const data = await tryMany([
      () =>
        apiFetch(
          `/api/cajero/backups/restorable?limit=${limit}`,
          authOptions(token),
        ),
      () =>
        apiFetch(
          `/api/cashier/backups/restorable?limit=${limit}`,
          authOptions(token),
        ),
    ]);
    return Array.isArray(data) ? data : [];
  },

  async getRestorableBackups(token, limit = 50) {
    return this.listRestorableBackups(token, limit);
  },

  async restoreBackup(token, payload) {
    if (!payload?.history_id) {
      throw new Error("Debes indicar el respaldo a restaurar");
    }

    return tryMany([
      () =>
        apiFetch(
          "/api/cajero/backups/restore",
          authOptions(token, { method: "POST", body: payload }),
        ),
      () =>
        apiFetch(
          "/api/cashier/backups/restore",
          authOptions(token, { method: "POST", body: payload }),
        ),
    ]);
  },

  async restoreBackupFromHistory(token, payload) {
    return this.restoreBackup(token, payload);
  },

  async getBackupAutomation(token) {
    return tryMany([
      () => apiFetch("/api/cajero/backups/automation", authOptions(token)),
      () => apiFetch("/api/cashier/backups/automation", authOptions(token)),
    ]);
  },

  async getAutoBackupConfig(token) {
    return this.getBackupAutomation(token);
  },

  async saveBackupAutomation(token, payload) {
    return tryMany([
      () =>
        apiFetch(
          "/api/cajero/backups/automation",
          authOptions(token, { method: "PATCH", body: payload }),
        ),
      () =>
        apiFetch(
          "/api/cashier/backups/automation",
          authOptions(token, { method: "PATCH", body: payload }),
        ),
    ]);
  },

  async saveAutoBackupConfig(token, payload) {
    return this.saveBackupAutomation(token, payload);
  },

  // =========================
  // EXPORTACIONES
  // =========================
  async exportFull(token) {
    return tryMany([
      () =>
        apiFetch(
          "/api/cajero/exports/full",
          authOptions(token, { method: "POST" }),
        ),
      () =>
        apiFetch(
          "/api/cashier/exports/full",
          authOptions(token, { method: "POST" }),
        ),
    ]);
  },

  async exportTable(token, schema, table) {
    if (!schema || !table) throw new Error("Debes seleccionar esquema y tabla");

    return tryMany([
      () =>
        apiFetch(
          `/api/cajero/exports/table/${schema}/${table}`,
          authOptions(token, { method: "POST" }),
        ),
      () =>
        apiFetch(
          `/api/cashier/exports/table/${schema}/${table}`,
          authOptions(token, { method: "POST" }),
        ),
    ]);
  },

  // =========================
  // IMPORTACIONES
  // =========================
  async listImportTables(token) {
    const data = await tryMany([
      () => apiFetch("/api/cajero/imports/tables", authOptions(token)),
      () => apiFetch("/api/cashier/imports/tables", authOptions(token)),
    ]);
    return Array.isArray(data) ? data : [];
  },

  async uploadImportCsv(token, payload) {
    let formData;

    if (isFormData(payload)) {
      formData = payload;
    } else {
      const { schema, table, file } = payload || {};
      if (!schema || !table) {
        throw new Error("Debes seleccionar la tabla destino");
      }
      if (!file) {
        throw new Error("Debes seleccionar un archivo CSV");
      }

      formData = new FormData();
      formData.append("schema", schema);
      formData.append("table", table);
      formData.append("file", file);
    }

    return tryMany([
      () => postFormData("/api/cajero/imports/upload", token, formData),
      () => postFormData("/api/cashier/imports/upload", token, formData),
    ]);
  },

  async uploadCsvForImport(token, payload) {
    return this.uploadImportCsv(token, payload);
  },

  async uploadImportFile(token, payload) {
    return this.uploadImportCsv(token, payload);
  },

  async importToStaging(token, payload) {
    const importId = normalizeImportId(payload);
    if (!importId) throw new Error("Id de importación requerido");

    return tryMany([
      () =>
        apiFetch(
          `/api/cajero/imports/${importId}/staging`,
          authOptions(token, { method: "POST" }),
        ),
      () =>
        apiFetch(
          `/api/cashier/imports/${importId}/staging`,
          authOptions(token, { method: "POST" }),
        ),
    ]);
  },

  async validateImport(token, payload) {
    const importId = normalizeImportId(payload);
    if (!importId) throw new Error("Id de importación requerido");

    return tryMany([
      () =>
        apiFetch(
          `/api/cajero/imports/${importId}/validate`,
          authOptions(token, { method: "POST" }),
        ),
      () =>
        apiFetch(
          `/api/cashier/imports/${importId}/validate`,
          authOptions(token, { method: "POST" }),
        ),
    ]);
  },

  async validateImportStaging(token, payload) {
    return this.validateImport(token, payload);
  },

  async validateStagingImport(token, payload) {
    return this.validateImport(token, payload);
  },

  async commitImport(token, payload) {
    const importId = normalizeImportId(payload);
    if (!importId) throw new Error("Id de importación requerido");

    return tryMany([
      () =>
        apiFetch(
          `/api/cajero/imports/${importId}/commit`,
          authOptions(token, { method: "POST" }),
        ),
      () =>
        apiFetch(
          `/api/cashier/imports/${importId}/commit`,
          authOptions(token, { method: "POST" }),
        ),
    ]);
  },

  async clearImportStaging(token, payload) {
    const importId = normalizeImportId(payload);
    if (!importId) throw new Error("Id de importación requerido");

    return tryMany([
      () =>
        apiFetch(
          `/api/cajero/imports/${importId}/clear-staging`,
          authOptions(token, { method: "POST" }),
        ),
      () =>
        apiFetch(
          `/api/cashier/imports/${importId}/clear-staging`,
          authOptions(token, { method: "POST" }),
        ),
    ]);
  },

  async clearStagingImport(token, payload) {
    return this.clearImportStaging(token, payload);
  },

  async truncateImportStaging(token, payload) {
    return this.clearImportStaging(token, payload);
  },

  async listImportHistory(token, limit = 30) {
    const data = await tryMany([
      () =>
        apiFetch(
          `/api/cajero/imports/history?limit=${limit}`,
          authOptions(token),
        ),
      () =>
        apiFetch(
          `/api/cashier/imports/history?limit=${limit}`,
          authOptions(token),
        ),
    ]);
    return Array.isArray(data) ? data : [];
  },

  async getImportHistory(token, limit = 30) {
    return this.listImportHistory(token, limit);
  },

  // =========================
  // HISTORIAL Y DESCARGA
  // =========================
  async listFilesHistory(token, limit = 30) {
    const data = await tryMany([
      () =>
        apiFetch(
          `/api/cajero/files/history?limit=${limit}`,
          authOptions(token),
        ),
      () =>
        apiFetch(
          `/api/cashier/files/history?limit=${limit}`,
          authOptions(token),
        ),
    ]);
    return Array.isArray(data) ? data : [];
  },

  async createFileDownloadTicket(token, historyId) {
    if (!historyId) throw new Error("Id de historial requerido");

    return tryMany([
      () =>
        apiFetch(
          `/api/cajero/files/history/${historyId}/download-ticket`,
          authOptions(token, { method: "POST" }),
        ),
      () =>
        apiFetch(
          `/api/cashier/files/history/${historyId}/download-ticket`,
          authOptions(token, { method: "POST" }),
        ),
    ]);
  },

  getFileDownloadUrl(historyId, ticket, mode = "cajero") {
    const basePath =
      mode === "cashier"
        ? `/api/cashier/files/history/${historyId}/download`
        : `/api/cajero/files/history/${historyId}/download`;

    return `${basePath}?ticket=${encodeURIComponent(ticket)}`;
  },

  async downloadHistoryFile(token, historyId, mode = "cajero") {
    if (!token) throw new Error("No autenticado");
    if (!historyId) throw new Error("Id de historial requerido");

    const ticketData = await this.createFileDownloadTicket(token, historyId);

    if (!ticketData?.ticket) {
      throw new Error("No se pudo crear el ticket de descarga");
    }

    const relativeUrl = this.getFileDownloadUrl(
      historyId,
      ticketData.ticket,
      mode,
    );

    let response;
    try {
      response = await fetch(buildApiUrl(relativeUrl), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      throw new Error(
        "No se pudo conectar con el servidor para descargar el archivo",
      );
    }

    if (!response.ok) {
      let message = "No se pudo descargar el archivo";

      try {
        const json = await response.json();
        message = json?.message || json?.error || message;
      } catch {
        // ignorar
      }

      throw new Error(message);
    }

    const disposition = response.headers.get("content-disposition") || "";
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const filename = getFilenameFromDisposition(
      disposition,
      `archivo_${historyId}`,
    );

    const blob = await response.blob();

    try {
      await saveBlobWithDialog(blob, filename, contentType);
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error("Descarga cancelada");
      }
      throw error;
    }

    return { filename };
  },
};
