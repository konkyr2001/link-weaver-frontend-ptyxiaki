const URL = import.meta.env.VITE_BACKEND_URL;

const login = async (email, password) => {
  try {
    const response = await fetch(`${URL}/api/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { error: data.error };
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.userObj));
    return data;
  } catch (error) {
    console.log(error.message);
    return { error: error.message };
  }
};

const signup = async (firstName, lastName, email, password, recaptcha) => {
  try {
    const response = await fetch(`${URL}/api/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        password,
        email,
        recaptcha,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      if (data.error === "User already exists") {
        return { error: "User already exists" };
      } else {
        return { error: data.error || "Something went wrong" };
      }
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.userObj));
    return data;
  } catch (error) {
    console.log(error.message);
    return { error: error.message || "Something went wrong" };
  }
};

const authorizeGoogleUser = async (token) => {
  try {
    const response = await fetch(`${URL}/api/user/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Something went wrong" };
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.userObj));
    return data;
  } catch (error) {
    console.log(error.message);
    return { error: error.message || "Something went wrong" };
  }
};

const getUserHistory = async (token) => {
  try {
    const response = await fetch(`${URL}/api/user/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Something went wrong" };
    }
    return data;
  } catch (error) {
    console.log(error.message);
    return { error: error.message || "Something went wrong" };
  }
};

const getUser = async (token) => {
  try {
    const response = await fetch(`${URL}/api/user/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Something went wrong" };
    }
    return data;
  } catch (error) {
    return { error: error.message || "Something went wrong" };
  }
};

const updateProfile = async (token, firstName, lastName) => {
  try {
    const response = await fetch(`${URL}/api/user/updateProfile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName,
        lastName,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Something went wrong" };
    }
    return data;
  } catch (error) {
    return { error: error.message || "Something went wrong" };
  }
};

const changePassword = async (token, currentPassword, newPassword) => {
  try {
    const response = await fetch(`${URL}/api/user/changePassword`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Something went wrong" };
    }
    return data;
  } catch (error) {
    return { error: error.message || "Something went wrong" };
  }
};

const deleteGoogleUser = async (token) => {
  try {
    const response = await fetch(`${URL}/api/user/google/me`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Something went wrong" };
    }
    return data;
  } catch (error) {
    return { error: error.message || "Something went wrong" };
  }
};

const deleteLocalUser = async (token, password) => {
  try {
    const response = await fetch(`${URL}/api/user/me`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Something went wrong" };
    }
    return data;
  } catch (error) {
    return { error: error.message || "Something went wrong" };
  }
};
export {
  login,
  signup,
  authorizeGoogleUser,
  getUserHistory,
  getUser,
  updateProfile,
  changePassword,
  deleteGoogleUser,
  deleteLocalUser,
};
