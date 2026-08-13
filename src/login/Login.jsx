import { useCallback, useEffect, useState } from "react";
import { Form, Input, Button, addToast } from "@heroui/react";
import logo from "../assets/CORPSEED.webp";
import {
  getCurrentUser,
  getDepartmentOfUser,
  toggleAutoOnFeature,
} from "../toolkit/slices/authSlice";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState();

  const handleLoginUsers = useCallback(
    (values) => {
      setLoading("pending");
      dispatch(getCurrentUser(values))
        .then((resp) => {
          console.log("resp 11111", resp);
          if (resp.meta.requestStatus === "fulfilled") {
            if (resp?.payload?.id !== undefined) {
              // localStorage.setItem("userDetail", JSON.stringify(resp?.payload));
              sessionStorage.setItem(
                "userDetail",
                JSON.stringify(resp?.payload),
              );
              setLoading("fulfilled");
              dispatch(getDepartmentOfUser(resp?.payload?.id)).then(
                (response) => {
                  console.log("Department detail resp 11111", response);
                  dispatch(
                    toggleAutoOnFeature({
                      userId: resp?.payload?.id,
                      flag: true,
                    }),
                  );
                  const department = response?.payload?.department
                    ?.trim()
                    ?.toLowerCase();

                  if (resp?.payload?.roles?.includes("ADMIN")) {
                    console.log("dsjkhgkjsgkjdghj 1111", response);
                    navigate(`/erp/${resp?.payload?.id}/dashboard`);
                  } else {
                    if (department === "sales") {
                      console.log("dsjkhgkjsgkjdghj 2222", response);
                      navigate(`/erp/${resp?.payload?.id}/sales/dashboard`);
                      return;
                    }

                    if (department === "procurement") {
                      console.log("dsjkhgkjsgkjdghj 2222", response);
                      navigate(
                        `/erp/${resp?.payload?.id}/procurement/vendors-requests`,
                      );
                      return;
                    }

                    if (department === "human resource") {
                      console.log("dsjkhgkjsgkjdghj 33333", response);
                      navigate(`/erp/${resp?.payload?.id}/hr/usersList`);
                      return;
                    }

                    if (department === "quality team") {
                      console.log("dsjkhgkjsgkjdghj 2222", response);
                      navigate(`/erp/${resp?.payload?.id}/quality/dashboard`);
                      return;
                    }

                    if (department === "accounts") {
                      console.log("dsjkhgkjsgkjdghj 44444", response);
                      navigate(`/erp/${resp?.payload?.id}/accounts/dashboard`);
                      return;
                    }

                    if (
                      department === "crt" ||
                      department === "legal" ||
                      department === "technical" ||
                      department === "liaisoning" ||
                      department === "crt test" ||
                      department === "operations" ||
                      department === "liasoning test" ||
                      department === "filing"
                    ) {
                      console.log("dsjkhgkjsgkjdghj 44444", response);
                      navigate(`/erp/${resp?.payload?.id}/operation/projects`);
                      return;
                    }
                  }
                },
              );
              addToast({
                title: "SUCCESS",
                description: "User logged in successfully !.",
                color: "success",
              });
            } else {
              setLoading("ipRestricted");
              addToast({
                title: "RESTRICTED",
                description: "Ip address restricted !.",
                color: "danger",
              });
            }
          } else {
            navigate(`/login`);
            setLoading("rejected");
            addToast({
              title:
                `${resp?.payload?.error} ${resp?.payload?.status || ""}` ||
                "Login failed !.",
              description: resp?.payload?.message,
              color: "danger",
            });
          }
        })
        .catch(() => {
          setLoading("rejected");
          addToast({
            title: "ERROR",
            description: "Something went wrong !.",
            color: "danger",
          });
        });
    },
    [dispatch, navigate],
  );

  useEffect(() => {
    const userDetail = sessionStorage.getItem("userDetail");

    if (userDetail) {
      const user = JSON.parse(userDetail);
      if (user?.id) {
        navigate(`/erp/${user.id}/dashboard`);
      }
    }
  }, [navigate]);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-[30%] flex flex-col items-center gap-4 shadow-lg px-8 py-12 rounded-lg dark:bg-gray-700">
        <span className="text-xl font-bold text-neutral-800 dark:text-white">
          <img src={logo} alt="corpseed" style={{ height: "68px" }} />
        </span>
        <Form
          className="w-full max-w-lg flex flex-col gap-8"
          onReset={() => setAction("reset")}
          onSubmit={(e) => {
            e.preventDefault();
            let data = Object.fromEntries(new FormData(e.currentTarget));
            handleLoginUsers(data);
          }}
        >
          <Input
            isRequired
            errorMessage="Please enter a valid email"
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder="Enter your email"
            type="email"
          />

          <Input
            isRequired
            errorMessage="Please enter a valid password"
            label="Password"
            labelPlacement="outside"
            name="password"
            placeholder="Enter your password"
            type="password"
          />
          <Link to={"/forgotPassword"} className="text-primary my-1">
            Forgot password ?
          </Link>
          <div className="flex justify-center gap-2 w-full">
            <Button
              color="primary"
              type="submit"
              isLoading={loading === "pending"}
              className="w-full"
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
