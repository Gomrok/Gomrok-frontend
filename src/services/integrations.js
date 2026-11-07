export class IntegrationUnavailableError extends Error {
  constructor(service) { super(`سرویس ${service} هنوز متصل نشده است. اطلاعات به سرور ارسال نشد.`); this.name = "IntegrationUnavailableError"; this.code = "NOT_CONFIGURED"; }
}
const unavailable = (service) => async () => { throw new IntegrationUnavailableError(service); };
// Replace adapters with a reviewed backend contract. Never put API secrets here.
export const authAdapter = Object.freeze({ login: unavailable("ورود"), register: unavailable("ثبت‌نام"), getSession: async () => null, logout: async () => {} });
export const tradeAdapter = Object.freeze({ createRequest: unavailable("ثبت درخواست"), recordEvent: unavailable("معامله"), list: unavailable("معامله") });
export const disputeAdapter = Object.freeze({ submit: unavailable("مرکز اختلاف"), uploadEvidence: unavailable("مدارک"), notices: unavailable("ابلاغ و اعلان") });
export const identityAdapter = Object.freeze({ verifyCompany: unavailable("احراز هویت شرکت"), activationQuote: unavailable("هزینهٔ فعال‌سازی") });
export const adliyarAdapter = Object.freeze({ submitCode: unavailable("عدلیار"), getCaseStatus: unavailable("عدلیار") });
export function createAuthService(adapter = authAdapter) { return { login: (credentials) => adapter.login(credentials), register: (registration) => adapter.register(registration), getSession: () => adapter.getSession(), logout: () => adapter.logout() }; }
