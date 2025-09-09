import {
  BarChart,
  Briefcase,
  LayoutDashboard,
  Settings,
  ChevronDown,
  ChevronRight,
  User2,
  LogOut,
  UserCircle2,
  HandCoins,
  SquareUserRound,
  UserRound,
  FlaskConical,
  Factory,
  GitCommitHorizontal,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/CORPSEED.webp";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@heroui/react";
import { useSelector } from "react-redux";

const icons = {
  LayoutDashboard,
  Briefcase,
  Settings,
  BarChart,
  User2,
  UserRound,
  HandCoins,
  SquareUserRound,
  FlaskConical,
  GitCommitHorizontal,
  Factory
};

const Sidebar = ({ items, collapsed, setCollapsed }) => {
  const userDetail=useSelector((state)=>state.auth.currentUser)
  const [openMenu, setOpenMenu] = useState({});

  const toggleMenu = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className={`relative h-screen ${
        collapsed ? "w-16" : "w-60"
      } bg-white dark:bg-black dark:text-white flex flex-col transition-all duration-300 `}
    >
      {/* Collapse Toggle */}
      <div className="p-2 flex justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-neutral-800 dark:text-white">
            <img
              src={logo}
              alt="corpseed"
              style={{ height: collapsed ? "32px" : "48px" }}
            />
          </span>
        </div>
      </div>

      <nav className="p-3 space-y-1 font-medium text-neutral-700 dark:text-white max-h-[85vh] overflow-auto">
        {items.map((item) => {
          const Icon = item.icon ? icons[item.icon] : null;
          const isOpen = openMenu[item.key];

          return (
            <div key={item.key}>
              <div
                className="flex items-center justify-between px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white cursor-pointer "
                onClick={() => (item.children ? toggleMenu(item.key) : null)}
              >
                <div className="flex items-center space-x-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {!collapsed &&
                    (item?.children ? (
                      <span className="text-small">{item?.title}</span>
                    ) : (
                      <Link
                        to={item?.url}
                        className="dark:text-white text-small"
                      >
                        {item?.title}
                      </Link>
                    ))}
                </div>
                {!collapsed &&
                  item.children &&
                  (isOpen ? (
                    <ChevronDown className="w-4 h-4 dark:text-white" />
                  ) : (
                    <ChevronRight className="w-4 h-4 dark:text-white" />
                  ))}
              </div>

              {item.children && isOpen && !collapsed && (
                <div className="ml-6 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      to={child.url}
                      key={child.key}
                      className="block px-3 py-1 text-small rounded hover:bg-gray-100 dark:hover:bg-neutral-800 dark:text-white"
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="absolute bottom-1">
        <Dropdown placement="right-end">
          <DropdownTrigger>
            <div className="flex items-center gap-3 hover:bg-gray-600 cursor-pointer px-1 py-1 rounded-md">
              <User
              className="font-medium"
                avatarProps={{
                  icon: (
                    <User2 className="w-5 h-5 text-neutral-700 dark:text-white" />
                  ),
                }}
                description={!collapsed && userDetail?.roles?.join(",")}
                name={!collapsed && userDetail?.username}
              />
              {!collapsed && (
                <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-white" />
              )}
            </div>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem>
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-neutral-700 dark:text-white">
                  {userDetail?.username}
                </p>
                <p className="text-xs text-neutral-500 dark:text-gray-400">
                  {userDetail?.email}
                </p>
              </div>
            </DropdownItem>
            <DropdownItem key="new">
              <div className="flex items-center gap-4 text-neutral-700 dark:text-gray-100">
                <UserCircle2 className="w-5 h-5" /> Profile
              </div>
            </DropdownItem>
            <DropdownItem key="copy">
              <div className="flex items-center gap-4 text-neutral-700 dark:text-gray-100">
                <LogOut className="w-5 h-5" /> Logout
              </div>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </aside>
  );
};

export default Sidebar;
