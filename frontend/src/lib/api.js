const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const parseResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getErrorMessage = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data === "string") return data;

  return data.message || data.error || fallback;
};

let refreshPromise = null;

const requestRefresh = async () => {
  const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Session expired"));
  }

  return data;
};

export const refreshAuth = () => {
  if (!refreshPromise) {
    refreshPromise = requestRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const apiRequest = async (path, options = {}, retryOnUnauthorized = true) => {
  const hasBody = options.body !== undefined;
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retryOnUnauthorized) {
    await refreshAuth();
    return apiRequest(path, options, false);
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Something went wrong"));
  }

  return data;
};

export const authApi = {
  userRegisterInit: (payload) =>
    apiRequest(
      "/v1/user/register/init",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      false,
    ),

  userRegisterVerify: (payload) =>
    apiRequest(
      "/v1/user/register/verify",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      false,
    ),

  userLogin: (payload) =>
    apiRequest(
      "/v1/user/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      false,
    ),

  tailorRegisterInit: (payload) =>
    apiRequest(
      "/v1/tailor/register/init",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      false,
    ),

  tailorRegisterVerify: (payload) =>
    apiRequest(
      "/v1/tailor/register/verify",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      false,
    ),

  tailorLogin: (payload) =>
    apiRequest(
      "/v1/tailor/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      false,
    ),

  logout: () =>
    apiRequest(
      "/v1/auth/logout",
      {
        method: "POST",
      },
      false,
    ),
};

export const tailorApi = {
  findTailors: (filters) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value);
      }
    });

    return apiRequest(`/v1/tailor/nearby?${params.toString()}`, {
      method: "GET",
    });
  },
};

export const bookingApi = {
  createOrder: (formData) =>
    apiRequest("/v1/booking/orders", {
      method: "POST",
      body: formData,
    }),

  getMyOrders: () =>
    apiRequest("/v1/booking/orders/my", {
      method: "GET",
    }),

  getOrder: (orderId) =>
    apiRequest(`/v1/booking/orders/${orderId}`, {
      method: "GET",
    }),

  getAcceptedTailors: (orderId) =>
    apiRequest(`/v1/booking/orders/${orderId}/responses`, {
      method: "GET",
    }),

  confirmTailor: (orderId, payload) =>
    apiRequest(`/v1/booking/orders/${orderId}/confirm`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getTailorRequests: () =>
    apiRequest("/v1/booking/tailor/requests", {
      method: "GET",
    }),

  acceptOrder: (orderId, payload) =>
    apiRequest(`/v1/booking/orders/${orderId}/accept`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateOrderStatus: (orderId, status) =>
    apiRequest(`/v1/booking/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  cancelOrder: (orderId, reason) =>
    apiRequest(`/v1/booking/orders/${orderId}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  createPaymentOrder: (orderId) =>
    apiRequest(`/v1/booking/orders/${orderId}/payment/create`, {
      method: "POST",
    }),

  verifyPayment: (orderId, payload) =>
    apiRequest(`/v1/booking/orders/${orderId}/payment/verify`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
