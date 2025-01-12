"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useHotkeys } from "react-hotkeys-hook";
import { Moon, SunDim } from "lucide-react";

import { Button } from "./ui/button";

const KEYS = ["ctrl+u", "meta+u"];

export function ThemeSwitcher() {
	const { setTheme, theme } = useTheme();

	useHotkeys(KEYS, () => {
		setTheme(theme === "light" ? "dark" : "light");
	});

	return (
		<div className="fixed bottom-2 left-4 z-50">
			<Button
				variant="outline"
				onKeyDown={() => setTheme(theme === "dark" ? "light" : "dark")}
				onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				size="icon"
			>
				{theme === "dark" ? (
					<Moon className="size-5" />
				) : (
					<SunDim className="size-5" />
				)}
			</Button>
		</div>
	);
}
