import React, { useCallback, useEffect, useState } from "react";
import {
  getAllChildLeads,
  getAllContactDetails,
  getAllOppurtunities,
  getAllProductWithCattegory,
  getAllTaskData,
  getAllTaskStatus,
  getCompanyDetailsByLeadId,
  getCompanyUnitsById,
  getDocumentsByLeadName,
  getEstimateByLeadId,
  getProductListByLeadName,
  getProposalByLeadId,
  getVendorDetailList,
  handleViewHistory,
} from "../../../Toolkit/Slices/LeadSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { Drawer, notification, Tabs } from "antd";
import LeadDetailsPage from "../Inbox/LeadDetailsPage";
import { getAllHistory } from "../../../Toolkit/Slices/HistorySlice";
import SingleLeadTaskList from "./SingleLeadTaskList";
import { LeadActivityPage } from "./LeadActivityPage";
import LeadHistory from "./LeadHistory";
import Vendors from "../../Vendors/Vendors";
import LeadChilds from "./LeadChilds";
import LeadEstimate from "./LeadEstimate";
import { getAllSlugList } from "../../../Toolkit/Slices/LeadSlugSlice";
import { getAllProductData } from "../../../Toolkit/Slices/ProductSlice";
import { getAllUrlList } from "../../../Toolkit/Slices/LeadUrlSlice";
import Proposal from "./Proposal";
import { getAllUsers } from "../../../Toolkit/Slices/UsersSlice";

const LeadsDetailsMainPage = React.memo(
  ({ children, leadId, data, allMultiFilterData, setSearchText }) => {
    const dispatch = useDispatch();
    const { userid } = useParams();
    const singleLeadResponseData = useSelector(
      (state) => state.leads.singleLeadResponseData
    );
    const [openDrawer, setOpenDrawer] = useState(false);
    const [currLeadId, setCurrLeadId] = useState(null);
    const [tabKey, setTabKey] = useState("leadDetail");

    useEffect(() => {
      setCurrLeadId(leadId);
    }, [leadId]);

    const items = useCallback(() => {
      return [
        {
          label: `Lead details`,
          key: "leadDetail",
          children: <LeadDetailsPage leadid={currLeadId} />,
        },
        ...(singleLeadResponseData?.parent === true
          ? [
              {
                label: `Lead child's`,
                key: "leadChilds",
                children: <LeadChilds leadid={currLeadId} />,
              },
            ]
          : []),
        {
          label: `Activities `,
          key: "activities",
          children: <LeadActivityPage leadid={currLeadId} />,
        },
        {
          label: `Vendors`,
          key: "vendors",
          children: <Vendors leadId={currLeadId} />,
        },
        {
          label: `All task`,
          key: "allTask",
          children: <SingleLeadTaskList />,
        },
        {
          label: `History`,
          key: "history",
          children: <LeadHistory leadid={currLeadId} />,
        },
        {
          label: "Proposal",
          key: "proposal",
          children: <Proposal leadid={currLeadId} />,
        },
        {
          label: "Estimate",
          key: "estimate",
          children: <LeadEstimate leadid={currLeadId} />,
        },
      ];
    }, [currLeadId, singleLeadResponseData]);

    console.log("dsjkfsdfkjgbsdkjf", data);

    const handleOnChange = useCallback(
      (e) => {
        setTabKey(e);
        if (e === "history") {
          dispatch(getAllHistory({ id: currLeadId }));
        }
        if (e === "allTask") {
          dispatch(getAllTaskData(currLeadId));
        }
        if (e === "leadChilds") {
          dispatch(getAllChildLeads(singleLeadResponseData?.leadName));
        }
        if (e === "vendors") {
          dispatch(getVendorDetailList({ leadId, userid }));
        }
        if (e === "activities") {
          dispatch(getAllTaskStatus());
          dispatch(getAllOppurtunities());
          dispatch(getAllProductWithCattegory());
        }
        if (e === "estimate") {
          dispatch(getAllProductData());
          dispatch(
            getProductListByLeadName(singleLeadResponseData?.originalName)
          );
          dispatch(getAllContactDetails());
          dispatch(
            getCompanyDetailsByLeadId(data?.id ? data?.id : data?.leadId)
          ).then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              if (Object.keys(resp.payload)?.length > 0) {
                if (resp.payload.assignee?.id != userid) {
                  notification.warning({
                    message: `This lead is already assigned to "${resp?.payload?.assignee?.fullName}" for company id "${resp?.payload?.id}" company name " ${resp?.payload?.name}"`,
                  });
                }
              }
            }
          });
          dispatch(getEstimateByLeadId(data?.id ? data?.id : data?.leadId));
        }
        if (e === "proposal") {
          dispatch(getAllProductData());
          dispatch(getAllContactDetails());
          dispatch(getProposalByLeadId(data?.id ? data?.id : data?.leadId));
          dispatch(
            getProductListByLeadName(singleLeadResponseData?.originalName)
          );
          dispatch(
            getCompanyDetailsByLeadId(data?.id ? data?.id : data?.leadId)
          ).then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              if (Object.keys(resp.payload)?.length > 0) {
                if (resp.payload.assignee?.id != userid) {
                  notification.warning({
                    message: `This lead is already assigned to "${resp?.payload?.assignee?.fullName}" for company id "${resp?.payload?.id}" company name " ${resp?.payload?.name}"`,
                  });
                } else {
                  dispatch(getCompanyUnitsById(resp?.payload?.id));
                }
              } else {
              }
            } else {
            }
          });
        }
      },
      [dispatch, currLeadId, singleLeadResponseData, userid, leadId]
    );

    const handleCloseDrawer = useCallback(() => {
      setOpenDrawer(false);
      setCurrLeadId(null);
      // if (allMultiFilterData) {
      //   dispatch(getAllLeads(allMultiFilterData))
      // }
      // if (typeof setSearchText === "function") {
      //   setSearchText((prev) => "")
      // }
    }, []);

    return (
      <>
        <Link
          className="link-heading"
          onClick={() => {
            if (allMultiFilterData) {
              dispatch(
                handleViewHistory({ leadId: leadId, userid: userid })
              ).then((resp) => {
                if (resp.meta.requestStatus === "fulfilled") {
                  // dispatch(getAllLeads(allMultiFilterData))
                }
              });
            } else {
              dispatch(handleViewHistory({ leadId: leadId, userid: userid }));
            }
            setCurrLeadId(leadId);
            setOpenDrawer(true);
            dispatch(getAllSlugList());
            dispatch(getAllUrlList());
            dispatch(getDocumentsByLeadName(data?.originalName));
            setTabKey("leadDetail");
            dispatch(getAllUsers());
          }}
        >
          {children}
        </Link>
        <Drawer
          open={openDrawer}
          onClose={handleCloseDrawer}
          width={"80%"}
          closeIcon={null}
          bodyStyle={{ padding: 12 }}
        >
          <Tabs
            defaultActiveKey="leadDetail"
            size="small"
            activeKey={tabKey}
            items={items()}
            onChange={handleOnChange}
          />
        </Drawer>
      </>
    );
  }
);

export default LeadsDetailsMainPage;
