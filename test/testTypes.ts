declare namespace NodeJS {
  export interface Global {
    fetch: (input?: Request | string, init?: RequestInit) => Promise<Response>
    localStorage: any
  }
}
