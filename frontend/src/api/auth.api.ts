// auth.api.ts - Simple Login with Name and Password

export interface LoginRequest {
  name: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // Replace with your actual API endpoint
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw {
        response: {
          data: {
            message: error.message || 'Login failed'
          }
        }
      };
    }

    return await response.json();
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  }
};