import bcrypt from "bcryptjs";
import { db } from "./index";
import { usuarios } from "./schema";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@sparapan.com.br";
  const senha = process.env.SEED_ADMIN_PASSWORD ?? "trocar123";
  const senhaHash = await bcrypt.hash(senha, 10);

  await db
    .insert(usuarios)
    .values({ nome: "Administrador", email, senhaHash, role: "admin" })
    .onConflictDoNothing({ target: usuarios.email });

  console.log(`Usuário admin pronto: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
