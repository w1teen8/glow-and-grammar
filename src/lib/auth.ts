import { type AuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/types/models";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { profile: true },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileId: user.profileId,
          // The founder is the only full admin — other teacher accounts are
          // scoped to the students assigned to them.
          isAdmin: user.role === "TEACHER" && (user.profile?.isFounder ?? false),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; role: Role; profileId: string | null; isAdmin: boolean };
        token.id = u.id;
        token.role = u.role;
        token.profileId = u.profileId;
        token.isAdmin = u.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.profileId = token.profileId as string | null;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) throw new Response("Unauthorized", { status: 401 });
  return session;
}

export async function requireTeacher() {
  const session = await requireSession();
  if (session.user.role !== "TEACHER") throw new Response("Forbidden", { status: 403 });
  return session;
}

// The founder — full access to every student. Other teacher accounts are
// scoped to their own students (see lib/permissions.ts).
export async function requireAdmin() {
  const session = await requireTeacher();
  if (!session.user.isAdmin) throw new Response("Forbidden", { status: 403 });
  return session;
}
