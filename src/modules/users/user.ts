import type { Role } from "./role";

/** A user as exposed by the application: never carries the password or its hash. */
export type User = {
  id: number;
  name: string;
  email: string;
  login: string;
  role: Role;
};

export type NewUser = Omit<User, "id"> & { password: string };
