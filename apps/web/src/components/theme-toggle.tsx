"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function alternar() {
    const proximo = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", proximo);
    localStorage.setItem("theme", proximo);
    setDark(!dark);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className="rounded-pill p-2 text-on-surface-variant hover:bg-surface-container-low"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
