import { NextResponse, type NextRequest } from "next/server";

/**
 * Gate con password condivisa (HTTP Basic Auth).
 * - In locale: se APP_PASSWORD non è impostata, NON blocca nulla.
 * - Su Vercel: imposta APP_PASSWORD per proteggere l'app pubblica.
 * Il browser chiede utente+password: l'utente può essere qualsiasi,
 * conta solo che la password coincida con APP_PASSWORD.
 */
export function middleware(req: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) return NextResponse.next();

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const fornita = decoded.slice(decoded.indexOf(":") + 1);
      if (fornita === password) return NextResponse.next();
    } catch {
      // header malformato: ricade nella richiesta di autenticazione
    }
  }

  return new NextResponse("Autenticazione richiesta", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Officina", charset="UTF-8"' },
  });
}

export const config = {
  // Protegge tutto tranne gli asset statici di Next.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
