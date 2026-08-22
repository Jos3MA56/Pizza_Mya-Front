import { httpJson, buildApiUrl } from "./http.js";

export const combosApi = {
  async today() {
    const data = await httpJson(buildApiUrl("/api/combos/today"));
    return Array.isArray(data) ? data : [];
  },

  async detail(id) {
    const data = await httpJson(buildApiUrl(`/api/combos/${id}`));
    return data || null;
  },
};
