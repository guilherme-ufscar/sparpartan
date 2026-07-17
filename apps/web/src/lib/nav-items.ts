import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Ship,
  FileStack,
  Clock,
  FileText,
  Wrench,
  Folder,
  BarChart3,
  Mail,
  AlarmClock,
  GraduationCap,
  Settings,
  Receipt,
  HardHat,
  BookOpen,
  UserCog,
  Landmark,
  BookMarked,
  MessageSquare,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/orcamentos", label: "Orçamentos", icon: Receipt },
  { href: "/taxas", label: "Taxas a Pagar", icon: Landmark },
  { href: "/lembretes", label: "Lembretes", icon: AlarmClock },
  { href: "/chat", label: "Chat da Equipe", icon: MessageSquare },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/embarcacoes", label: "Embarcações", icon: Ship },
  { href: "/obras", label: "Obras", icon: HardHat },
  { href: "/processos", label: "Processos", icon: FileStack },
  { href: "/pendentes", label: "Pendentes", icon: Clock },
  { href: "/documentos", label: "Documentos", icon: FileText },
  { href: "/servicos", label: "Serviços", icon: Wrench },
  { href: "/arquivos", label: "Arquivos", icon: Folder },
  { href: "/documentos-sparapan", label: "Documentos Sparapan", icon: BookMarked },
  { href: "/vendas", label: "Vendas", icon: BarChart3 },
  { href: "/emails", label: "Enviar E-mails", icon: Mail },
  { href: "/area-de-estudos", label: "Área de Estudos", icon: GraduationCap },
  { href: "/lms/materias", label: "LMS", icon: BookOpen },
  { href: "/alunos", label: "Alunos", icon: UserCog },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/documentos", label: "Docs", icon: FileText },
  { href: "/configuracoes", label: "Menu", icon: Settings },
];
