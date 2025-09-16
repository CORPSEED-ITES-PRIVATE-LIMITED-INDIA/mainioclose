import { useDispatch } from "react-redux";
import { getLeadDataMonthWise } from "../toolkit/slices/dashboardSlice";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const LeadDashboardDetail = () => {
  const { monthDate, userId } = useParams();
  const dispatch = useDispatch();
  const [yearStr, monthName] = monthDate?.split("-");


  useEffect(() => {
    if (monthDate) {
      const year = parseInt(yearStr);
      const monthIndex = dayjs().month(monthName).month();
      const startOfMonth = dayjs()
        .year(year)
        .month(monthIndex)
        .startOf("month");
      const endOfMonth = dayjs().year(year).month(monthIndex).endOf("month");
      const data = {
        toDate: startOfMonth,
        fromDate: endOfMonth,
        filter: "",
        currentUserId: userId,
        userId: userId,
      };


      dispatch(getLeadDataMonthWise(data));
    }
  }, [dispatch, monthDate]);
  return <div>LeadDashboardDetail</div>;
};

export default LeadDashboardDetail;
