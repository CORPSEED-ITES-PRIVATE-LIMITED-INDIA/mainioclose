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
  Building2,
  BookCheck,
  BookText,
  BadgeCheck,
  PanelBottomClose,
  Building,
  BookOpenText,
  FileText,
  FileMinus,
  History,
  ChartNoAxesCombined,
  FolderKanban,
  University,
  PhoneCall,
  NotepadTextDashed,
  FileSearch2,
  NotebookText,
  BanknoteArrowDown,
  Book,
  ReceiptText,
  Scale,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import logo from "../assets/CORPSEED.webp";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { logoutFun, toggleAutoOffFeature } from "../toolkit/slices/authSlice";

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
  Factory,
  Building2,
  BookCheck,
  BookText,
  BadgeCheck,
  PanelBottomClose,
  Building,
  BookOpenText,
  FileText,
  FileMinus,
  History,
  ChartNoAxesCombined,
  FolderKanban,
  University,
  PhoneCall,
  NotepadTextDashed,
  FileSearch2,
  NotebookText,
  BanknoteArrowDown,
  ReceiptText,
  Book,
  Scale,
};

const Sidebar = ({ items, collapsed, className = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const userDetail = useSelector((state) => state.auth.currentUser);
  const [openMenu, setOpenMenu] = useState({});

  const toggleMenu = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isUrlActive = (url) =>
    !!url && location.pathname.includes(`/${url}`.replace(/\/+/g, "/"));

  useEffect(() => {
    const activeParent = items?.find((item) =>
      item?.children?.some((child) => isUrlActive(child.url)),
    );
    if (activeParent) {
      setOpenMenu((prev) => ({ ...prev, [activeParent.key]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, items]);

  return (
    <aside
      className={`h-screen shrink-0 transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-56 xl:w-60"
      } bg-white dark:bg-black dark:text-white flex flex-col border-r border-gray-200 dark:border-white/10 ${className}`}
    >
      {/* Logo */}
      <div className="h-11 shrink-0 flex items-center px-3 border-b border-gray-200 dark:border-white/10">
        <img
          src={logo}
          alt="corpseed"
          className={collapsed ? "h-6" : "h-7"}
        />
      </div>

      <nav className="p-2 space-y-0.5 font-medium text-neutral-700 dark:text-white flex-1 overflow-y-auto overflow-x-hidden">
        {items?.map((item) => {
          const Icon = item.icon ? icons[item.icon] : null;
          const isOpen = openMenu[item.key];
          const childActive = item?.children?.some((child) =>
            isUrlActive(child.url),
          );
          const selfActive = !item.children && isUrlActive(item.url);
          const isActive = selfActive || childActive;

          return (
            <div key={item.key}>
              <div
                title={collapsed ? item.title : undefined}
                className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary dark:bg-primary-500/15 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-default-100 dark:hover:bg-neutral-800"
                }`}
                onClick={() => (item.children ? toggleMenu(item.key) : null)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`}
                    />
                  )}
                  {!collapsed &&
                    (item?.children ? (
                      <span className="text-[12.5px] truncate">{item?.title}</span>
                    ) : (
                      <Link
                        to={item?.url}
                        className={`text-[12.5px] truncate ${isActive ? "text-primary" : "text-neutral-600 dark:text-neutral-300"}`}
                      >
                        {item?.title}
                      </Link>
                    ))}
                </div>
                {!collapsed && item?.children && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 text-neutral-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>

              {item?.children && isOpen && !collapsed && (
                <div className="mt-0.5 ml-5 pl-2 space-y-0.5 border-l border-gray-200 dark:border-white/10">
                  {item?.children?.map((child) => {
                    const isChildActive = isUrlActive(child.url);
                    return (
                      <Link
                        to={child.url}
                        key={child.key}
                        className={`block px-2 py-1 text-[12.5px] rounded-md truncate transition-colors ${
                          isChildActive
                            ? "bg-primary-50 text-primary font-medium dark:bg-primary-500/15 dark:text-primary-400"
                            : "text-neutral-600 dark:text-neutral-300 hover:bg-default-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {child.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="p-2 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-black">
        <Dropdown placement="right-end">
          <DropdownTrigger>
            <div className="flex items-center justify-between gap-2 bg-default-100 dark:bg-neutral-800 hover:bg-default-200 dark:hover:bg-neutral-700 cursor-pointer px-1.5 py-1 rounded-lg transition-colors">
              <User
                className="font-medium"
                classNames={{ name: "dark:text-gray-300 text-[12.5px]", description: "text-[11.5px]" }}
                avatarProps={{
                  size: "sm",
                  icon: <User2 className="w-4 h-4" />,
                }}
                description={!collapsed && userDetail?.roles?.join(",")}
                name={!collapsed && userDetail?.username}
              />
              {!collapsed && (
                <ChevronDown className="w-3.5 h-3.5 shrink-0 text-neutral-500 dark:text-white" />
              )}
            </div>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem>
              <div className="px-2 py-1">
                <p className="text-sm font-medium text-neutral-700 dark:text-white">
                  {userDetail?.username}
                </p>
                <p className="text-[12.5px] text-neutral-500 dark:text-gray-400">
                  {userDetail?.email}
                </p>
              </div>
            </DropdownItem>
            <DropdownItem key="new">
              <div className="flex items-center gap-3 text-neutral-700 dark:text-gray-100 text-sm">
                <UserCircle2 className="w-4 h-4" /> Profile
              </div>
            </DropdownItem>
            <DropdownItem
              key="logout"
              onPress={() => {
                dispatch(logoutFun());
                navigate("/login");
                dispatch(toggleAutoOffFeature({ userId, flag: false }));
              }}
            >
              <div className="flex items-center gap-3 text-neutral-700 dark:text-gray-100 text-sm">
                <LogOut className="w-4 h-4" /> Logout
              </div>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </aside>
  );
};

export default Sidebar;
