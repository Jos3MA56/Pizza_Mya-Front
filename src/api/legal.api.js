import { buildApiUrl, httpJson } from "./http.js";

export const legalApi = {
  list: () => httpJson(buildApiUrl("/api/legal")),
  get: (slug) => httpJson(buildApiUrl(`/api/legal/${slug}`)),
};
