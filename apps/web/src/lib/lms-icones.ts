import {
  Anchor,
  Ship,
  Compass,
  Waves,
  LifeBuoy,
  Wrench,
  Cog,
  Ruler,
  BookOpen,
  GraduationCap,
  FileText,
  ClipboardList,
  Radio,
  MapPin,
  Navigation,
  Flag,
  Fuel,
  Zap,
  Wind,
  Sun,
  ShieldCheck,
  AlertTriangle,
  Wrench as Tool,
  Gauge,
  Container,
  Package,
  Users,
  Award,
  BookMarked,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

/**
 * Conjunto curado de ícones lucide para o seletor de ícone de `materias` do LMS —
 * tema náutico/educacional. A chave é o que é persistido em `materias.icone`.
 */
export const LMS_ICONES: Record<string, LucideIcon> = {
  Anchor,
  Ship,
  Compass,
  Waves,
  LifeBuoy,
  Wrench,
  Cog,
  Ruler,
  BookOpen,
  GraduationCap,
  FileText,
  ClipboardList,
  Radio,
  MapPin,
  Navigation,
  Flag,
  Fuel,
  Zap,
  Wind,
  Sun,
  ShieldCheck,
  AlertTriangle,
  Tool,
  Gauge,
  Container,
  Package,
  Users,
  Award,
  BookMarked,
  Lightbulb,
};

export const LMS_ICONE_NOMES = Object.keys(LMS_ICONES);

export function iconeLms(nome: string | null | undefined): LucideIcon {
  return (nome && LMS_ICONES[nome]) || BookOpen;
}
