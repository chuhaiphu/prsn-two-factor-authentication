import api from "./base";


export const loginApi = async (payload) => {
  try {
    const response = await api.post("/auth/login", payload);
    if (response.data.content.message === '2FA required') {
      return {
        requiresTwoFA: true,
        tempToken: response.data.content.tempToken
      };
    }
    // Handle normal login case here
    const { access_token, refresh_token } = response.data.content;
    localStorage.setItem('access_token', JSON.stringify(access_token));
    localStorage.setItem('refresh_token', JSON.stringify(refresh_token));
    return response.data
  } catch (error) {
    throw error.response;
  }
};

export const registerApi = async (signupData) => {
  try {
    const response = await api.post('/user/signup', signupData);
    return response.data;
  } catch (error) {
    throw error.response;
  }
}

export const refreshTokenApi = async () => {
  try {
    const response = await api.post("/auth/refresh");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const setup2FAApi = async (userId) => {
  try {
    const response = await api.post(`/auth/2fa/setup?userId=${userId}`);
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const turnOn2FAApi = async (twoFACode) => {
  try {
    const response = await api.post(`/auth/2fa/turn-on?twoFACode=${twoFACode}`);
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const turnOff2FAApi = async () => {
  try {
    const response = await api.post("/auth/2fa/turn-off");
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const authenticate2FAAndLoginApi = async (tempToken, twoFactorAuthenticationCode) => {
  try {
    const response = await api.post(`/auth/2fa/authenticate?tempToken=${tempToken}&twoFactorAuthenticationCode=${twoFactorAuthenticationCode}`);
    const { access_token, refresh_token } = response.data.content;
    localStorage.setItem('access_token', JSON.stringify(access_token));
    localStorage.setItem('refresh_token', JSON.stringify(refresh_token));
    return response.data.content;
  } catch (error) {
    console.log('Error in authenticate2FAAndLoginApi:', error.response || error);
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 && data.message.message === "Wrong authentication code") {
        throw new Error("Incorrect 2FA code. Please try again.");
      } else if (status === 500 && data.message === "jwt expired") {
        throw new Error("Your session has expired. Please log in again.");
      }
    }
    throw new Error("An unexpected error occurred. Please try again later.");
  }
};

// Add this function to the existing file
export const findUserById = async (id) => {
  try {
    const response = await api.get(`/user/by-id?id=${id}`);
    return response.data.content;
  } catch (error) {
    throw error.response;
  }
};
