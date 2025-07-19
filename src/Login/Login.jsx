import React, { useCallback, useEffect, useState } from "react";
import "./Login.scss";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getCurrentUser,
  getDepartmentOfUser,
  handleLoadingState,
  toggleAutoOnFeature,
} from "../Toolkit/Slices/AuthSlice";
import { Button, Checkbox, Form, Input, notification, Typography } from "antd";
import { Icon } from "@iconify/react";
const { Text } = Typography;
toast.configure();

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState("");

  useEffect(() => {
    dispatch(handleLoadingState(""));
  }, [dispatch]);

  const handleLoginUsers = useCallback(
    (values) => {
      setLoading("pending");
      dispatch(getCurrentUser(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            if (resp?.payload?.id !== undefined) {
              setLoading("fulfilled");
              dispatch(getDepartmentOfUser(resp?.payload?.id)).then(
                (response) => {
                  dispatch(
                    toggleAutoOnFeature({
                      userId: resp?.payload?.id,
                      flag: true,
                    })
                  );
                  // if (resp?.payload?.roles?.includes("ADMIN")) {
                  //   navigate(`/erp/${resp?.payload?.id}/dashboard/records`);
                  // } else {
                  //   if (response.payload?.department === "Procurement") {
                  //     navigate(`/erp/${resp?.payload?.id}/vendors`);
                  //   }
                  //   if (response.payload?.department === "Human Resource") {
                  //     navigate(`/erp/${resp?.payload?.id}/hr/userlist`);
                  //   }
                  //   if (response.payload?.department === "Accounts") {
                  //     navigate(`/erp/${resp?.payload?.id}/account/companyForm`);
                  //   } else {
                  //     navigate(`/erp/${resp?.payload?.id}/sales/leads`);
                  //   }
                  // }
                }
              );
              notification.success({ message: "User logged in successfully." });
              // setTimeout(() => {
              //   window.location.reload();
              // }, 2000);
            } else {
              setLoading("ipRestricted");
              notification.error({ message: "Ip address restricted ." });
            }
          } else {
            // navigate(`/erp/login`);
            setLoading("rejected");
            notification.error({ message: "Something went wrong !." });
          }
        })
        .catch(() => {
          setLoading("rejected");
          notification.error({ message: "Something went wrong !." });
        });
    },
    [dispatch, navigate]
  );

  return (
    <div className="cm-box bg-g-light container">
      <div className="sm-box">
        <div>
          <img
            src="https://www.corpseed.com/assets/img/brands/CORPSEED.webp"
            alt="corpseed logo"
          />
          <h3
            style={{
              margin: "4px 0px 4px 14px",
              fontWeight: "bold",
              fontSize: "24px",
            }}
          >
            Sign in
          </h3>
        </div>
        <Form
          layout="vertical"
          size="large"
          style={{ width: "90%" }}
          onFinish={handleLoginUsers}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "please enter your email." }]}
          >
            <Input
              prefix={
                <Icon icon="fluent:mail-24-regular" height={24} width={24} />
              }
              onChange={() => setLoading("")}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "please enter your password." }]}
          >
            <Input.Password
              prefix={
                <Icon
                  icon="fluent:lock-closed-24-regular"
                  height={24}
                  width={24}
                />
              }
              onChange={() => setLoading("")}
              size="large"
            />
          </Form.Item>

          {loading === "rejected" ? (
            <Text type="danger"> Invalid email and password . </Text>
          ) : loading === "ipRestricted" ? (
            <Text type="danger"> Your ip address is restricted . </Text>
          ) : (
            ""
          )}

          <Form.Item valuePropName="checked">
            <Checkbox>Remember me.</Checkbox>{" "}
            <Link className="bl-clr" to="/erp/forgetpassword">
              Forget Password ?
            </Link>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading === "pending" ? true : false}
            >
              {loading === "pending" ? "Loading..." : "Submit"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
