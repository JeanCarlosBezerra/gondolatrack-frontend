// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/favicon.ico",
];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
    
  const { pathname, search } = req.nextUrl;

  // deixa passar rotas públicas e assets
  if (isPublicPath(pathname)) return NextResponse.next();

  // se não tiver cookie do token, manda pro login
  const token = req.cookies.get("gt_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // opcional: valida token chamando /auth/me
  // (se token inválido/expirado, redireciona pro login)
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";
    const meResp = await fetch(`${apiBase}/auth/me`, {
      headers: {
        cookie: `gt_token=${token}`,
      },
    });

    if (!meResp.ok) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // Se a API cair, por segurança mandamos pro login (ou você pode liberar)
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Ajuste o matcher para proteger tudo, exceto o que já filtramos acima
export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
