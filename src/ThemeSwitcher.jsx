import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          variant="light"
          className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          {isDark ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-black" />}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Theme Options" className="dark:bg-black dark:text-white">
        <DropdownItem key="light" onClick={() => setTheme("light")}>
          Light Mode
        </DropdownItem>
        <DropdownItem key="dark" onClick={() => setTheme("dark")}>
          Dark Mode
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
