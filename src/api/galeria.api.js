import { httpJson, buildApiUrl } from "./http.js";

export const galeriaApi = {
  list: () => httpJson(buildApiUrl("/api/galeria")),
};
