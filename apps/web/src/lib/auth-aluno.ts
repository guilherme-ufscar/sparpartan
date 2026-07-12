import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { alunos } from "@/db/schema";

export const {
  handlers: handlersAluno,
  signIn: signInAluno,
  signOut: signOutAluno,
  auth: authAluno,
} = NextAuth({
  trustHost: true,
  basePath: "/api/auth-aluno",
  session: { strategy: "jwt" },
  pages: { signIn: "/aluno/login" },
  cookies: {
    sessionToken: {
      name: "aluno-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "aluno-callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "aluno-csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      id: "aluno",
      name: "Aluno",
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const senha = credentials?.senha as string | undefined;
        if (!email || !senha) return null;

        const [aluno] = await db
          .select()
          .from(alunos)
          .where(eq(alunos.email, email))
          .limit(1);

        if (!aluno || !aluno.ativo) return null;

        const senhaValida = await bcrypt.compare(senha, aluno.senhaHash);
        if (!senhaValida) return null;

        return {
          id: aluno.id,
          name: aluno.nome,
          email: aluno.email,
          tipo: "aluno",
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.tipo = (user as { tipo?: string }).tipo;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { id?: string; tipo?: string }).id = token.sub;
        (session.user as { tipo?: string }).tipo = token.tipo as string | undefined;
      }
      return session;
    },
  },
});
