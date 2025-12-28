import axios from "axios";

// Get API URL from environment or use production config
const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Production fallback
    if (import.meta.env.PROD) {
        return 'https://your-backend-url.railway.app/api';
    }

    // Development: Use current hostname and port 3000 for API
    // This allows access from local network IPs (e.g., 192.168.x.x)
    const hostname = window.location.hostname;
    const apiPort = 3000;
    
    // If accessing via localhost, use localhost
    // If accessing via IP (192.168.x.x, 10.x.x.x, etc.), use that IP
    return `http://${hostname}:${apiPort}/api`;
};

export const apiClient = axios.create({
    baseURL: getApiUrl(),
    withCredentials: true,
    timeout: 10000, // 10 second timeout
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("jwt_token");
        console.log("API Request - URL:", config.url);
        console.log("API Request - Token present:", !!token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("API Request - Authorization header set");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log("API 401 error:", error.response?.data?.message);

            // Only redirect on specific authentication errors, not on general 401s
            if (error.response?.data?.message === "Token expired" ||
                error.response?.data?.message === "Access token required" ||
                error.response?.data?.message === "Invalid token") {

                console.log("JWT authentication failed, redirecting to signin");
                localStorage.removeItem("jwt_token");
                localStorage.removeItem("auth_user");
                window.location.href = "/signin";
            } else {
                console.log("401 error but not JWT related, not redirecting");
            }
        }
        return Promise.reject(error);
    }
);

export type SignInPayload = { email: string; password: string };
export type SignUpPayload = { email: string; password: string; shopName: string };

export async function signIn(payload: SignInPayload) {
    console.log("API - SignIn called with:", payload.email)
    const { data } = await apiClient.post("/auth/signin", payload);
    // Store JWT token
    console.log("SignIn response:", data);
    console.log("SignIn response keys:", Object.keys(data));
    console.log("SignIn token present:", !!data.token);

    if (data.token) {
        localStorage.setItem("jwt_token", data.token);
        console.log("JWT token stored in localStorage");
        console.log("JWT token length:", data.token.length);
        console.log("JWT token first 50 chars:", data.token.substring(0, 50) + "...");

        // Verify storage
        const storedToken = localStorage.getItem("jwt_token");
        console.log("Stored token verification:", storedToken ? "SUCCESS" : "FAILED");
        console.log("Stored token length:", storedToken ? storedToken.length : 0);
    } else {
        console.warn("No JWT token received in signin response");
        console.warn("Response data:", JSON.stringify(data, null, 2));
    }
    return data;
}

export async function signUp(payload: SignUpPayload) {
    console.log("API - SignUp called with:", payload.email, payload.shopName)
    const { data } = await apiClient.post("/auth/signup", payload);
    // Store JWT token
    console.log("SignUp response:", data);
    console.log("SignUp response keys:", Object.keys(data));
    console.log("SignUp token present:", !!data.token);

    if (data.token) {
        localStorage.setItem("jwt_token", data.token);
        console.log("JWT token stored in localStorage");
        console.log("JWT token length:", data.token.length);
        console.log("JWT token first 50 chars:", data.token.substring(0, 50) + "...");

        // Verify storage
        const storedToken = localStorage.getItem("jwt_token");
        console.log("Stored token verification:", storedToken ? "SUCCESS" : "FAILED");
        console.log("Stored token length:", storedToken ? storedToken.length : 0);
    } else {
        console.warn("No JWT token received in signup response");
        console.warn("Response data:", JSON.stringify(data, null, 2));
    }
    return data;
}

export type DebtItem = { description: string; amount: number };
export type CreateDebtPayload = {
    customerName: string;
    phone?: string;
    items: DebtItem[];
    total: number;
    dueDate?: string | Date;
};

export async function listDebts() {
    const { data } = await apiClient.get(`/debts`);
    return data as any[];
}

export async function createDebt(payload: CreateDebtPayload) {
    const { data } = await apiClient.post(`/debts`, payload);
    return data;
}

export async function updateDebtStatus(debtId: string, status: string) {
    const { data } = await apiClient.patch(`/debts/${debtId}`, { status });
    return data;
}


