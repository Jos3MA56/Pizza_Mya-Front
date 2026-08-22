import { buildApiUrl, httpJson } from "./http.js";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function uploadForm(path, { token, formData }) {
  return httpJson(buildApiUrl(path), {
    method: "POST",
    headers: {
      ...authHeaders(token),
    },
    body: formData,
  });
}

export const adminCloudinaryApi = {
  list: ({ token, folder = "", nextCursor = "", maxResults = 24 }) => {
    const params = new URLSearchParams();
    if (folder) params.set("folder", folder);
    if (nextCursor) params.set("next_cursor", nextCursor);
    if (maxResults) params.set("max_results", String(maxResults));

    return httpJson(
      buildApiUrl(`/api/admin/cloudinary/assets?${params.toString()}`),
      {
        headers: {
          ...authHeaders(token),
        },
      },
    );
  },

  upload: ({ token, folder = "", file }) => {
    const formData = new FormData();
    if (folder) formData.append("folder", folder);
    formData.append("imagen", file);

    return uploadForm("/api/admin/cloudinary/upload", {
      token,
      formData,
    });
  },
};
