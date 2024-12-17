export interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  role: "user" | "admin" | "super_admin";
}

export interface UserProfile extends User {
  profile: Profile;
}

interface Profile {
  _id: string;
  avatar: string | null;
  isStudent: boolean;
  canvasApiKey: string | null;
  credits: number;
}
