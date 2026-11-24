// Fetches JSON and turns failures into messages a user can read.
export class HttpClient {
  #fetch;

  // The default looks up globalThis.fetch on each call so tests can mock it.
  constructor(fetchFn = (...args) => globalThis.fetch(...args)) {
    this.#fetch = fetchFn;
  }

  async getJSON(url, headers = {}) {
    let res;
    try {
      res = await this.#fetch(url, { headers });
    } catch {
      throw new Error('Network error. Check your connection and try again.');
    }
    if (!res.ok) throw new Error('Weather service is unavailable. Try again later.');
    return res.json();
  }
}
