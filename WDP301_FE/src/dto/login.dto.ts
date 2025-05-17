export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  fullName: string;
  role: string;
  email: string;
  phone_number: string;
  token: string;
}
