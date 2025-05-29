import React, { useEffect } from "react";
import "./TopNav.scss";
import EnquirySend from "./EnquirySend";
import ProfileDrawer from "./ProfileDrawer";
import { Flex, notification, Switch, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  getAutomationStatus,
  handleToggleAutomation,
} from "../Toolkit/Slices/AuthSlice";
import { getHighestPriorityRole } from "../Main/Common/Commons";
const { Text } = Typography;

const TopNav = () => {
  const dispatch = useDispatch();
  const autoStatus = useSelector((state) => state.auth.automationStatus);
  const currentRoles = useSelector((state) => state?.auth?.roles);

  useEffect(() => {
    dispatch(getAutomationStatus());
  }, [dispatch]);

  const handleAutomation = (e) => {
    dispatch(handleToggleAutomation())
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({
            message: "Automation updated successfully !.",
          });
          dispatch(getAutomationStatus());
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  return (
    <div className="top-navbar">
      <div className="top-search-box"></div>
      <div className="top-nav-right-container">
        {getHighestPriorityRole(currentRoles) === "ADMIN" && (
          <Flex align="center" gap={8}>
            <Switch onChange={handleAutomation} value={autoStatus?.status}  />
            <Text>Automation</Text>
          </Flex>
        )}

        <EnquirySend />
        <ProfileDrawer />
      </div>
    </div>
  );
};

export default TopNav;
