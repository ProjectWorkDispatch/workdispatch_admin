import axios from "axios";

const AUTH_URL = process.env.AUTH_URL;

export const createAuthUser = async (user) => {
  try {
    const response = await axios.post(
      `${AUTH_URL}/Auth/register`,
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password || "Temp1234!",
        phone: user.phone || "00000000",
        role: user.role || "CLIENT",
        description: user.description || "",
        address: user.address || "",
        latitude: user.latitude || 0,
        longitude: user.longitude || 0
      }
    );

    return response.data.user;
  } catch (error) {
    console.error("Auth error:", error.response?.data || error.message);
    throw new Error("Error creando usuario en AuthService");
  }
};