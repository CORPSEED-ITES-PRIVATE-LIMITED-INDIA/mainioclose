import { useEffect } from "react";
import { Building2, MonitorDown, SquareChartGantt, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import {
  getDashboardUsersByHeirarchy,
  getTotalLeadCountForGraph,
  getTotalProjectCounts,
  totalCompanyForGraph,
  totalUserCount,
} from "../toolkit/slices/dashboardSlice";
import { useParams } from "react-router-dom";
import LeadDataChart from "./charts/LeadDataChart";
import LeadStatusChart from "./charts/LeadStatusChart";
import ProjectsDataChart from "./charts/ProjectsDataChart";
import ConversionStatus from "./charts/ConversionStatus";
import TopSellLeads from "./charts/TopSellLeads";
import RevenueChart from "./charts/RevenueChart";

const AdminDashboards = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const totalLeadCount = useSelector(
    (state) => state.dashboard.totalLeadCountForGraph,
  );
  const totalProjectCount = useSelector(
    (state) => state.dashboard.totalProjectCountForGraph,
  );
  const userCount = useSelector(
    (state) => state.dashboard.totalUserCountForGraph,
  );
  const companyCount = useSelector(
    (state) => state.dashboard.totalCompanyForGraph,
  );

  useEffect(() => {
    dispatch(getTotalLeadCountForGraph(userId));
    dispatch(getTotalProjectCounts(userId));
    dispatch(totalUserCount(userId));
    dispatch(totalCompanyForGraph(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    dispatch(getDashboardUsersByHeirarchy(userId));
  }, [dispatch]);

  return (
    <div className="max-h-[87vh] overflow-auto p-1">
      <div className="grid grid-cols-4 gap-4 mb-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center w-full text-muted-foreground">
              Total leads
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <h1 className="font-medium text-2xl m-0">{totalLeadCount}</h1>
            <MonitorDown />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center w-full text-muted-foreground">
              Total users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <h1 className="font-medium text-2xl m-0">{userCount}</h1>
            <Users />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center w-full text-muted-foreground">
              Total projects
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <h1 className="font-medium text-2xl m-0">{totalProjectCount}</h1>
            <SquareChartGantt />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center w-full text-muted-foreground">
              Total company
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <h1 className="font-medium text-2xl m-0">{companyCount}</h1>
            <Building2 />
          </CardContent>
        </Card>
      </div>
      <div className="grid 2xl:grid-cols-3 lg:grid-cols-2 gap-4">
        <LeadDataChart />
        <LeadStatusChart />
        <TopSellLeads />
        <ProjectsDataChart />
        <ConversionStatus />
        {/* <ConvertedLeadsDataChart /> */}
        <RevenueChart />
      </div>
    </div>
  );
};

export default AdminDashboards;
