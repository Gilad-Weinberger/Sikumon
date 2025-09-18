// Client-side auth functions that call API routes

export const signUp = async (
  email: string,
  password: string,
  fullName?: string,
  grade?: string
) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, fullName, grade }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Sign up failed");
  }

  return result.data;
};

export const signIn = async (email: string, password: string) => {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Sign in failed");
  }

  return result.data;
};

export const signOut = async () => {
  const response = await fetch("/api/auth/signout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Sign out failed");
  }

  return result;
};

export const getCurrentUser = async () => {
  const response = await fetch("/api/auth/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to get current user");
  }

  return result.user;
};

export const getSession = async () => {
  // For client-side session management, we'll use the user endpoint
  // and construct a simple session-like object
  const user = await getCurrentUser();
  return user ? { user, access_token: null } : null;
};
