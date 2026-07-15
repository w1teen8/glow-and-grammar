import type { Role } from "@/types/models";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      name: string;
      email: string;
      profileId: string | null;
      // True only for the founder account — other teacher accounts are
      // scoped to their own assigned students.
      isAdmin: boolean;
    };
  }

  interface User {
    id: string;
    role: Role;
    profileId: string | null;
    isAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    profileId: string | null;
    isAdmin: boolean;
  }
}
