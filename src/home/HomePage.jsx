import { PanelLeft } from "lucide-react";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/CORPSEED.webp";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-900">
      <header className="dark:bg-black dark:text-white bg-white h-[60px] shadow px-4 py-2 flex items-center justify-between">
        <span className="text-xl font-bold text-neutral-800 dark:text-white">
          <img src={logo} alt="corpseed" style={{ height: "48px" }} />
        </span>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Button color="primary" onPress={() => navigate("/login")}>
            Login
          </Button>
        </div>
      </header>
    </div>
  );
};

export default HomePage;
