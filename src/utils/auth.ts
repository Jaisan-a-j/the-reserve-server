import generateToken from "./generateToken";

export const normalizeEmail = (email: string) => email.toLowerCase().trim();

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const getOtpExpiry = () => new Date(Date.now() + 5 * 60 * 1000);

export const generateAuthResponse = (user: any) => ({
  token: generateToken(user._id.toString()),
  user: {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
  },
});
