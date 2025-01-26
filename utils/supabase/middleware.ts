import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
	try {
		// create an unmodified response
		let response = NextResponse.next({
			request: {
				headers: request.headers,
			},
		});

		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL as string,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
			{
				cookies: {
					getAll() {
						return request.cookies.getAll();
					},
					setAll(cookiesToSet) {
						for (const { name, value } of cookiesToSet) {
							request.cookies.set(name, value);
						}
						response = NextResponse.next({
							request,
						});
						for (const { name, value, options } of cookiesToSet) {
							response.cookies.set(name, value, options);
						}
					},
				},
			},
		);

		// refresh session if expired - required for server components
		// https://supabase.com/docs/guides/auth/server-side/nextjs
		const user = await supabase.auth.getUser();

		// protected routes
		if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}

		if (request.nextUrl.pathname === "/" && !user.error) {
			return NextResponse.redirect(new URL("/protected", request.url));
		}

		return response;
	} catch (e) {
		// a supabase client could not be created!
		// likely because the environment variables are setup incorrectly
		return NextResponse.next({
			request: {
				headers: request.headers,
			},
		});
	}
};
