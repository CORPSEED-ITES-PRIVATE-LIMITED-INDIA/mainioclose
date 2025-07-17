import {
  BarChart,
  Briefcase,
  LayoutDashboard,
  Settings,
  Menu,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../public/CORPSEED.webp";

const icons = {
  LayoutDashboard,
  Briefcase,
  Settings,
  BarChart,
};

const Sidebar = ({ items, collapsed, setCollapsed }) => {
  const [openMenu, setOpenMenu] = useState({});

  const toggleMenu = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className={`relative h-screen ${
        collapsed ? "w-16" : "w-56"
      } bg-white dark:bg-black dark:text-white flex flex-col transition-all duration-300`}
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

      <nav className="p-3 space-y-1 font-medium text-neutral-700 dark:text-white">
        {items.map((item) => {
          const Icon = item.icon ? icons[item.icon] : null;
          const isOpen = openMenu[item.key];

          return (
            <div key={item.key}>
              <div
                className="flex items-center justify-between px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white cursor-pointer"
                onClick={() => (item.children ? toggleMenu(item.key) : null)}
              >
                <div className="flex items-center space-x-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {!collapsed && (
                    item?.children ? (
                      <span className="text-small">{item?.title}</span>
                    ) : (
                      <Link to={item?.url} className="dark:text-white text-small">
                        {item?.title}
                      </Link>
                    )
                  )}
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
    </aside>
  );
};

export default Sidebar;
