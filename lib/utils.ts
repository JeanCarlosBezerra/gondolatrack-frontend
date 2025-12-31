// === INÍCIO ARQUIVO NOVO: lib/utils.ts ===
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function createPageUrl(pageName: string): string {
  switch (pageName) {
    case "Lojas":
      return "/lojas";
    case "Gondolas":
    case "Gôndolas":
      return "/gondola";
    case "Abastecimento":
      return "/abastecimento";
    default:
      return "/";
  }
}
// === FIM ARQUIVO NOVO ===
