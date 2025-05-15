import React, { useEffect, useRef, useState } from "react";
import "./MainPage.scss";
import SideBar from "./SideBar";
import { Outlet, useNavigate, useParams } from "react-router";
import TopNav from "../components/TopNav";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getDepartmentOfUser, logoutFun } from "../Toolkit/Slices/AuthSlice";
import { Layout, Menu, theme } from "antd";
import { getAllLeadUser } from "../Toolkit/Slices/LeadSlice";
const { Header, Sider, Content } = Layout;
toast.configure();

const MAX_INACTIVITY_TIME = 60 * 60 * 1000;
const CHECK_INTERVAL = 1000;

const MainPage = () => {
  const { userid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const lastActiveRef = useRef(Date.now());
  const items = SideBar();
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const resetInactivityTimer = () => {
    lastActiveRef.current = Date.now();
  };

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer)
    );

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActiveRef.current;

      if (timeSinceLastActivity >= MAX_INACTIVITY_TIME) {
        dispatch(logoutFun());
        navigate("/erp/login");
        toast.success("Logout Succesfully");
        lastActiveRef.current = Date.now();
      }
    }, CHECK_INTERVAL);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer)
      );
      clearInterval(intervalRef.current);
    };
  }, [dispatch,navigate]);

  useEffect(() => {
    dispatch(getDepartmentOfUser(userid));
    dispatch(getAllLeadUser(userid));
  }, [dispatch, userid]);

  const pathname = window.location.pathname;

  const getPathKey = () => {
    const parts = pathname.split("/");
    const lastWord = parts[parts.length - 1];
    return lastWord;
  };

  const getSecondLastKey = () => {
    const parts = pathname.split("/");
    const lastWord = parts[parts.length - 2];
    return lastWord;
  };

  const getThirdLastKey = () => {
    const parts = pathname.split("/");
    const lastWord = parts[parts.length - 3];
    return lastWord;
  };

  const [openKeys, setOpenKeys] = useState(getSecondLastKey());

  // useEffect(() => {
  //   const key = getSecondLastKey();
  //   setOpenKeys(key);
  // }, []);

  console.log("fkdjbsdkjfkj", [openKeys]);

  return (
    <>
      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{
            maxHeight: '95vh',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="custom-scroll"
        >
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            defaultSelectedKeys={[
              getSecondLastKey() === "accountSetting"
                ? "accountSetting"
                : getSecondLastKey() === "erpSetting"
                ? "erpSetting"
                : getSecondLastKey() === "organizations"
                ? "organizations"
                : getThirdLastKey() === "setting"
                ? "setting"
                : getPathKey(),
            ]}
            defaultOpenKeys={[openKeys]}
            mode="inline"
            items={items}
            onOpenChange={(e) => setOpenKeys(e[e?.length - 1])}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              height: "45px",
            }}
          >
            <TopNav />
          </Header>
          <Content
            style={{
              margin: "0 16px",
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default MainPage;
