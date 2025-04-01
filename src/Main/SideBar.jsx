import React, { useEffect } from "react";
import "./SideBar.scss";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUserProfilePhoto } from "../Toolkit/Slices/UserProfileSlice";
import { Icon } from "@iconify/react";
import {
  SIDE_BAR_ICON_HEIGHT,
  SIDE_BAR_ICON_WIDTH,
} from "../components/Constants";
import { getHighestPriorityRole } from "./Common/Commons";
toast.configure();

const SideBar = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const currentRoles = useSelector((state) => state?.auth?.roles);
  const currentUserDetail = useSelector(
    (state) => state.auth.getDepartmentDetail
  );
  const currentUserId = useSelector((state) => state.auth?.currentUser?.id);

  console.log("jfghjksdfhkjdhfdf", currentRoles);

  useEffect(() => {
    if (currentUserId !== undefined) {
      dispatch(getUserProfilePhoto(currentUserId));
    }
  }, [dispatch, currentUserId]);

  const items = [
    {
      label: "Dashboard",
      icon: (
        <Icon
          icon="fluent:top-speed-24-regular"
          height={SIDE_BAR_ICON_HEIGHT}
          width={SIDE_BAR_ICON_WIDTH}
        />
      ),
      key: "dashboard",
      children: [
        ...(getHighestPriorityRole(currentRoles) !== "ADMIN"
          ? [
              {
                label: <Link to={`${userid}/dashboard/tickets`}>Tickets</Link>,
                key: "tickets",
              },
              {
                label: <Link to={`${userid}/dashboard/manager`}>Approval</Link>,
                key: "manager",
              },
            ]
          : getHighestPriorityRole(currentRoles) !== "ADMIN" &&
            currentUserDetail?.department === "HR"
          ? [
              {
                label: <Link to={`${userid}/dashboard/users`}>Users</Link>,
                key: "users",
              },
              {
                label: <Link to={`${userid}/dashboard/tickets`}>Tickets</Link>,
                key: "tickets",
              },
              {
                label: <Link to={`${userid}/dashboard/manager`}>Approval</Link>,
                key: "manager",
              },
            ]
          : getHighestPriorityRole(currentRoles) === "ADMIN"
          ? [
              {
                label: (
                  <Link to={`${userid}/dashboard/records`}>
                    Record dashboard
                  </Link>
                ),
                key: "records",
              },
              {
                label: <Link to={`${userid}/dashboard/users`}>Users</Link>,
                key: "users",
              },
              {
                label: <Link to={`${userid}/dashboard/tickets`}>Tickets</Link>,
                key: "tickets",
              },
              {
                label: <Link to={`${userid}/dashboard/manager`}>Approval</Link>,
                key: "manager",
              },
            ]
          : []),
      ],
    },
    ...((currentUserDetail?.department === "Sales" ||
      currentUserDetail?.department === "Quality Team") &&
    getHighestPriorityRole(currentRoles) !== "ADMIN"
      ? [
          {
            label: "Sales",
            key: "sales",
            icon: (
              <Icon
                icon="fluent:briefcase-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
            children: [
              ...(currentUserDetail?.department === "Sales" &&
              getHighestPriorityRole(currentRoles) !== "ADMIN"
                ? [
                    {
                      label: <Link to={`${userid}/sales/leads`}>Leads</Link>,
                      key: "leads",
                    },
                    {
                      label: <Link to={`${userid}/sales/inbox`}>Inbox</Link>,
                      key: "inbox",
                    },
                    {
                      label: (
                        <Link to={`${userid}/sales/vendors-request`}>
                          Vendors request
                        </Link>
                      ),
                      key: "vendors-request",
                    },
                    {
                      label: (
                        <Link to={`${userid}/sales/company`}>Company</Link>
                      ),
                      key: "company",
                    },
                    {
                      label: (
                        <Link to={`${userid}/sales/newcompanies`}>
                          New company
                        </Link>
                      ),
                      key: "newcompanies",
                    },
                    {
                      label: (
                        <Link to={`${userid}/sales/project`}>Project</Link>
                      ),
                      key: "project",
                    },
                    {
                      label: (
                        <Link to={`${userid}/sales/lead-form`}>Lead form</Link>
                      ),
                      key: "lead-form",
                    },
                    {
                      label: (
                        <Link to={`${userid}/sales/estimate`}>Estimate</Link>
                      ),
                      key: "estimate",
                    },
                    {
                      label: (
                        <Link to={`${userid}/sales/proposal`}>Proposal</Link>
                      ),
                      key: "proposal",
                    },
                    {
                      label: (
                        <Link to={`${userid}/sales/paymentRegister`}>
                          Payment register
                        </Link>
                      ),
                      key: "paymentRegister",
                    },
                  ]
                : currentUserDetail?.department === "Quality Team" &&
                  getHighestPriorityRole(currentRoles) !== "ADMIN"
                ? [
                    {
                      label: <Link to={`${userid}/sales/leads`}>Leads</Link>,
                      key: "leads",
                    },
                    {
                      label: <Link to={`${userid}/sales/inbox`}>Inbox</Link>,
                      key: "inbox",
                    },
                  ]
                : []),
            ],
          },
        ]
      : getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            label: "Sales",
            key: "sales",
            icon: (
              <Icon
                icon="fluent:briefcase-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
            children: [
              {
                label: <Link to={`${userid}/sales/leads`}>Leads</Link>,
                key: "leads",
              },
              {
                label: <Link to={`${userid}/sales/inbox`}>Inbox</Link>,
                key: "inbox",
              },
              // {
              //   label: <Link to={`${userid}/sales/vendors-request`}>Vendors request</Link>,
              //   key: "vendors-request",
              // },
              {
                label: <Link to={`${userid}/sales/company`}>Company</Link>,
                key: "company",
              },
              {
                label: (
                  <Link to={`${userid}/sales/newcompanies`}>New company</Link>
                ),
                key: "newcompanies",
              },
              {
                label: <Link to={`${userid}/sales/project`}>Project</Link>,
                key: "project",
              },
              {
                label: <Link to={`${userid}/sales/lead-form`}>Lead form</Link>,
                key: "lead-form",
              },
              {
                label: <Link to={`${userid}/sales/estimate`}>Estimate</Link>,
                key: "estimate",
              },
              {
                label: <Link to={`${userid}/sales/proposal`}>Proposal</Link>,
                key: "proposal",
              },
              {
                label: (
                  <Link to={`${userid}/sales/paymentsRegister`}>
                    Payment register
                  </Link>
                ),
                key: "paymentsRegister",
              },
            ],
          },
        ]
      : currentUserDetail?.department === "Quality Team" &&
        getHighestPriorityRole(currentRoles) !== "ADMIN"
      ? {
          label: "Sales",
          key: "sales",
          icon: (
            <Icon
              icon="fluent:briefcase-24-regular"
              height={SIDE_BAR_ICON_HEIGHT}
              width={SIDE_BAR_ICON_WIDTH}
            />
          ),
          children: [
            {
              label: <Link to={`${userid}/sales/leads`}>Leads</Link>,
              key: "leads",
            },
            {
              label: <Link to={`${userid}/sales/inbox`}>Inbox</Link>,
              key: "inbox",
            },
          ],
        }
      : []),
    ...(getHighestPriorityRole(currentRoles) !== "ADMIN" &&
    currentUserDetail?.department === "Sales"
      ? [
          {
            label: <Link to={`/erp/${userid}/compliance`}>Compliances</Link>,
            key: "compliance",
            icon: (
              <Icon
                icon="fluent:calendar-person-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
          },
        ]
      : getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            label: <Link to={`/erp/${userid}/compliance`}>Compliances</Link>,
            key: "compliance",
            icon: (
              <Icon
                icon="fluent:calendar-person-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
          },
        ]
      : []),
    ...(getHighestPriorityRole(currentRoles) !== "ADMIN" &&
    currentUserDetail?.department === "HR"
      ? [
          {
            label: "HR",
            key: "hr",
            icon: (
              <Icon
                icon="fluent:credit-card-person-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
            children: [
              {
                label: (
                  <Link to={`/erp/${userid}/hr/userlist`}> User list</Link>
                ),
                key: "userlist",
              },
              {
                label: (
                  <Link to={`/erp/${userid}/hr/approveUser`}>
                    {" "}
                    Approval list
                  </Link>
                ),
                key: "approveUser",
              },
            ],
          },
        ]
      : getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            label: "HR",
            key: "hr",
            icon: (
              <Icon
                icon="fluent:credit-card-person-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
            children: [
              {
                label: (
                  <Link to={`/erp/${userid}/hr/userlist`}> User list</Link>
                ),
                key: "userlist",
              },
              {
                label: (
                  <Link to={`/erp/${userid}/hr/approveUser`}>
                    {" "}
                    Approval list
                  </Link>
                ),
                key: "approveUser",
              },
              {
                label: (
                  <Link to={`/erp/${userid}/hr/userservice`}>Rating list</Link>
                ),
                key: "userservice",
              },
            ],
          },
        ]
      : []),
    ...(currentUserDetail?.department === "Accounts" &&
    getHighestPriorityRole(currentRoles) !== "ADMIN"
      ? [
          {
            label: "Accounts",
            key: "account",
            icon: (
              <Icon
                icon="fluent:inprivate-account-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
            children: [
              // {
              //   label: (
              //     <Link to={`/erp/${userid}/account/accountlist`}>
              //       Accounts list
              //     </Link>
              //   ),
              //   key: "accountlist",
              // },
              {
                label: (
                  <Link to={`/erp/${userid}/account/companyForm`}>
                    {" "}
                    Company form
                  </Link>
                ),
                key: "companyForm",
              },
              {
                label: (
                  <Link to={`/erp/${userid}/account/companySearch`}>
                    {" "}
                    Company search
                  </Link>
                ),
                key: "companySearch",
              },
              // {
              //   key: "ledger",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/ledger`}
              //     >
              //       Ledger
              //     </Link>
              //   ),
              // },
              // {
              //   key: "voucher",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/voucher`}
              //     >
              //       Voucher
              //     </Link>
              //   ),
              // },
              // {
              //   key: "dailybook",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/dailybook`}
              //     >
              //       Daily book
              //     </Link>
              //   ),
              // },
              // {
              //   key: "bankStatement",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/bankStatement`}
              //     >
              //       Bank statement
              //     </Link>
              //   ),
              // },
              // {
              //   key: "paymentRegister",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/paymentRegister`}
              //     >
              //       Payment register
              //     </Link>
              //   ),
              // },
              // {
              //   key: "tds",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/tds`}
              //     >
              //       TDS
              //     </Link>
              //   ),
              // },
            ],
          },
        ]
      : getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            label: "Accounts",
            key: "account",
            icon: (
              <Icon
                icon="fluent:inprivate-account-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
            children: [
              // {
              //   label: (
              //     <Link to={`/erp/${userid}/account/accountlist`}>
              //       Accounts list
              //     </Link>
              //   ),
              //   key: "accountlist",
              // },
              {
                label: (
                  <Link to={`/erp/${userid}/account/companyForm`}>
                    {" "}
                    Company form
                  </Link>
                ),
                key: "companyForm",
              },
              {
                label: (
                  <Link to={`/erp/${userid}/account/companySearch`}>
                    {" "}
                    Company search
                  </Link>
                ),
                key: "companySearch",
              },
              {
                key: "organizations",
                label: (
                  <Link
                    className="link-four"
                    to={`/erp/${userid}/account/organizations`}
                  >
                    Organizations
                  </Link>
                ),
              },
              // {
              //   key: "ledger",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/ledger`}
              //     >
              //       Ledger
              //     </Link>
              //   ),
              // },
              // {
              //   key: "voucher",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/voucher`}
              //     >
              //       Voucher
              //     </Link>
              //   ),
              // },
              // {
              //   key: "dailybook",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/dailybook`}
              //     >
              //       Daily book
              //     </Link>
              //   ),
              // },
              // {
              //   key: "bankStatement",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/bankStatement`}
              //     >
              //       Bank statement
              //     </Link>
              //   ),
              // },
              // {
              //   key: "paymentRegister",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/paymentRegister`}
              //     >
              //       Payment register
              //     </Link>
              //   ),
              // },
              // {
              //   key: "tds",
              //   label: (
              //     <Link
              //       className="link-four"
              //       to={`/erp/${userid}/account/tds`}
              //     >
              //       TDS
              //     </Link>
              //   ),
              // },
            ],
          },
        ]
      : []),
    ...(currentUserDetail?.department === "Quality Team" &&
    getHighestPriorityRole(currentRoles) !== "ADMIN"
      ? [
          {
            label: "Quality",
            key: "quality",
            icon: (
              <Icon
                icon="fluent:beaker-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
            children: [
              {
                label: <Link to={`${userid}/quality/ivr`}>Ivr</Link>,
                key: "ivr",
              },
            ],
          },
        ]
      : getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            label: "Quality",
            key: "quality",
            icon: (
              <Icon
                icon="fluent:beaker-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
            children: [
              {
                label: <Link to={`${userid}/quality/ivr`}>Ivr</Link>,
                key: "ivr",
              },
            ],
          },
        ]
      : []),
    ...(getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            label: "Industries",
            key: "industries",
            icon: (
              <Icon
                icon="fluent:building-desktop-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
            children: [
              {
                label: (
                  <Link to={`/erp/${userid}/industries/industry`}>
                    Industry
                  </Link>
                ),
                key: "industry",
              },
              {
                label: (
                  <Link to={`/erp/${userid}/industries/industryData`}>
                    Industry data
                  </Link>
                ),
                key: "industryData",
              },
              {
                label: (
                  <Link to={`/erp/${userid}/industries/subindustry`}>
                    Sub industry
                  </Link>
                ),
                key: "subindustry",
              },
              {
                label: (
                  <Link to={`/erp/${userid}/industries/subsubindustry`}>
                    Sub sub industry
                  </Link>
                ),
                key: "subsubindustry",
              },
            ],
          },
        ]
      : []),

    ...(getHighestPriorityRole(currentRoles) === "ADMIN" ||
    currentUserDetail?.department === "Procurement"
      ? [
          {
            label: <Link to={`/erp/${userid}/vendors`}>Vendor's request</Link>,
            key: "vendors",
            icon: (
              <Icon
                icon="fluent:people-community-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
          },
        ]
      : []),

    ...(getHighestPriorityRole(currentRoles) === "ADMIN"
      ? [
          {
            label: "Setting",
            key: "setting",
            icon: (
              <Icon
                icon="fluent:settings-24-regular"
                height={SIDE_BAR_ICON_HEIGHT}
                width={SIDE_BAR_ICON_WIDTH}
              />
            ),
            children: [
              {
                label: (
                  <Link to={`/erp/${userid}/setting/erpSetting/leadStatus`}>
                    Erp setting
                  </Link>
                ),
                key: "erpSetting",
              },
              {
                label: (
                  <Link
                    to={`/erp/${userid}/setting/accountSetting/voucherType`}
                  >
                    Account setting
                  </Link>
                ),
                key: "accountSetting",
              },
            ],
          },
        ]
      : []),
  ];

  return items;
};

export default SideBar;
