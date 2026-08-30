export interface UserInterface {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  access_token: string;
  user?: UserInterface;
}
