import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatar.vercel.sh",
				port: "",
				pathname: "**",
			}
		],
	},
};

export default nextConfig;
