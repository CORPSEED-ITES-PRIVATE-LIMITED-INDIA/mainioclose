import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getLeadsDataByMonth = createAsyncThunk(
  "getLeadsDataByMonth",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllLeadsMonthWise`,
      data,
    );
    return response.data;
  },
);

export const getConversionReport = createAsyncThunk(
  "getConversionReport",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getLeadConversionReport`,
      data,
    );
    return response.data;
  },
);

export const getDashboardUsersByHeirarchy = createAsyncThunk(
  "getDashboardUsersByHeirarchy",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/users/getAllLowerHierarchy?userId=${id}`,
    );
    return response.data;
  },
);

export const getTotalLeadCountForGraph = createAsyncThunk(
  "getTotalLeadCountForGraph",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/salesDashboard/getTotalLeadCount?currentUserId=${userId}`,
    );
    return response.data;
  },
);

export const getTotalProjectCounts = createAsyncThunk(
  "getTotalProjectCounts",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/salesDashboard/getTotalProjectCount?currentUserId=${userId}`,
    );
    return response.data;
  },
);

export const totalUserCount = createAsyncThunk(
  "totalUserCount",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/salesDashboard/getTotalUserCount?currentUserId=${userId}`,
    );
    return response.data;
  },
);

export const totalCompanyForGraph = createAsyncThunk(
  "totalCompanyForGraph",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/salesDashboard/getTotalCompanyCount?currentUserId=${userId}`,
    );
    return response.data;
  },
);

export const getLeadDataMonthWise = createAsyncThunk(
  "getLeadDataMonthWise",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllLeadsMonthWiseData`,
      data,
    );
    return response.data;
  },
);

export const getLeadsDistributionStatusWise = createAsyncThunk(
  "getLeadsDistributionStatusWise",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllLeadCountStatusWise`,
      data,
    );
    return response.data;
  },
);

export const projectMontWiseDataForGraph = createAsyncThunk(
  "projectMontWiseDataForGraph",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllProjectMonthWise`,
      data,
    );
    return response.data;
  },
);

export const getLeadCategoryWise = createAsyncThunk(
  "getLeadCategoryWise",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllTypeLeadCount`,
      data,
    );
    return response.data;
  },
);

export const getTopSellLeadsData = createAsyncThunk(
  "getTopSellLeadsData",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllTopSellLead`,
      data,
    );
    return response.data;
  },
);

export const getAllUserLeadDataMonthWise = createAsyncThunk(
  "getAllUserLeadDataMonthWise",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllUserAssignLeadsMonthWise`,
      data,
    );
    return response.data;
  },
);

export const getAllRevenueDataMonthWise = createAsyncThunk(
  "getAllRevenueDataMonthWise",
  async (data) => {
    const response = await api.post(
      `/accountService/api/v1/balanceSheet/getSalesDashboardRevenueMonthly`,
      data,
    );
    return response.data;
  },
);

const getCurrentMonthName = () => {
  return new Date().toLocaleString("en-US", { month: "long" }).toUpperCase();
};

export const getDashboardSummaryCards = createAsyncThunk(
  "dashboard/getDashboardSummaryCards",
  async ({ userId, period, fromDate, toDate }) => {
    const response = await api.get(
      `/leadService/api/v1/dashboard/summary-cards`,
      {
        params: {
          userId,
          period: period || getCurrentMonthName(), // JULY
          fromDate,
          toDate,
        },
      },
    );

    return response.data;
  },
);

export const getProjectOverviewCards = createAsyncThunk(
  "dashboard/getProjectOverviewCards",
  async ({ userId, currentMonth = true, fromDate, toDate }) => {
    const response = await api.get(
      `/operationService/api/user-dashboard/overview`,
      {
        params: {
          userId,
          currentMonth,
          fromDate,
          toDate,
        },
      },
    );

    return response.data;
  },
);

export const getUserProjectDashboard = createAsyncThunk(
  "dashboard/getUserProjectDashboard",
  async ({ userId, currentMonth = true, fromDate, toDate }) => {
    const response = await api.get(
      `/operationService/api/user-dashboard/projects`,
      {
        params: {
          userId,
          currentMonth,
          fromDate,
          toDate,
        },
      },
    );

    return response.data;
  },
);

export const getLeadsFunnel = createAsyncThunk(
  "dashboard/getLeadsFunnel",
  async ({ userId, period, fromDate, toDate }) => {
    const response = await api.get(
      `/leadService/api/v1/dashboard/leads-funnel`,
      {
        params: { userId, period, fromDate, toDate },
      },
    );

    return response.data;
  },
);

export const getLeadsBySolution = createAsyncThunk(
  "dashboard/getLeadsBySolution",
  async ({ userId, period, fromDate, toDate }) => {
    const response = await api.get(
      `/leadService/api/v1/dashboard/leads-by-solution`,
      {
        params: { userId, period, fromDate, toDate },
      },
    );

    return response.data;
  },
);

export const getTopSellingServicesDashboard = createAsyncThunk(
  "dashboard/getTopSellingServicesDashboard",
  async ({ userId, period, fromDate, toDate, limit = 5 }) => {
    const response = await api.get(
      `/accountService/api/v1/dashboard/top-selling-services`,
      {
        params: {
          userId,
          period,
          fromDate,
          toDate,
          limit,
        },
      },
    );

    return response.data;
  },
);

export const getTopConvertedLeadsDashboard = createAsyncThunk(
  "dashboard/getTopConvertedLeadsDashboard",
  async ({ userId, period, fromDate, toDate, limit = 5 }) => {
    const response = await api.get(
      `/accountService/api/v1/dashboard/top-converted-leads`,
      {
        params: {
          userId,
          period,
          fromDate,
          toDate,
          limit,
        },
      },
    );

    return response.data;
  },
);

export const getRevenueTrendDashboard = createAsyncThunk(
  "dashboard/getRevenueTrendDashboard",
  async ({ userId, months = 6 }) => {
    const response = await api.get(
      `/accountService/api/v1/dashboard/revenue-trend`,
      {
        params: {
          userId,
          months,
        },
      },
    );

    return response.data;
  },
);

export const getRevenueCardsDashboard = createAsyncThunk(
  "dashboard/getRevenueCardsDashboard",
  async ({ userId, period, fromDate, toDate }) => {
    const response = await api.get(
      `/accountService/api/v1/dashboard/revenue-cards`,
      {
        params: {
          userId,
          // period,
          fromDate,
          toDate,
        },
      },
    );

    return response.data;
  },
);

export const getPaymentSummaryDashboard = createAsyncThunk(
  "dashboard/getPaymentSummaryDashboard",
  async ({ userId, period, fromDate, toDate }) => {
    const response = await api.get(
      `/accountService/api/v1/dashboard/payment-summary`,
      {
        params: {
          userId,
          // period,
          fromDate,
          toDate,
        },
      },
    );

    return response.data;
  },
);

export const getTopCompaniesDashboard = createAsyncThunk(
  "dashboard/getTopCompaniesDashboard",
  async ({ userId, period, fromDate, toDate, limit = 5 }) => {
    const response = await api.get(
      `/accountService/api/v1/dashboard/top-companies`,
      {
        params: {
          userId,
          period,
          fromDate,
          toDate,
          limit,
        },
      },
    );

    return response.data;
  },
);

export const getRevenueByServiceDashboard = createAsyncThunk(
  "dashboard/getRevenueByServiceDashboard",
  async ({ userId, period, fromDate, toDate, limit = 5 }) => {
    const response = await api.get(
      `/accountService/api/v1/dashboard/revenue-by-service`,
      {
        params: {
          userId,
          period,
          fromDate,
          toDate,
          limit,
        },
      },
    );

    return response.data;
  },
);

export const getBillingOverview = createAsyncThunk(
  "dashboard/getBillingOverview",
  async (
    { userId, period = "MONTH", fromDate, toDate },
    { rejectWithValue },
  ) => {
    try {
      const params = {
        userId,
        period,
      };

      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await api.get(
        "/accountService/api/v1/dashboard/billing-overview",
        { params },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Failed to fetch billing overview",
      );
    }
  },
);

export const getBillingVsCollection = createAsyncThunk(
  "dashboard/getBillingVsCollection",
  async ({ userId, months = 6, fromDate, toDate }, { rejectWithValue }) => {
    try {
      const params = {
        userId,
        months,
      };

      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await api.get(
        "/accountService/api/v1/dashboard/billing-vs-collection",
        { params },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Failed to fetch billing vs collection",
      );
    }
  },
);

export const getApprovalQueueDashboard = createAsyncThunk(
  "dashboard/getApprovalQueueDashboard",
  async (
    { userId, period = "MONTH", fromDate, toDate, limit = 4 },
    { rejectWithValue },
  ) => {
    try {
      const params = {
        userId,
        period,
        limit,
      };

      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await api.get(
        "/accountService/api/v1/dashboard/approval-queue",
        { params },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Failed to fetch approval queue",
      );
    }
  },
);

export const getInvoiceStatusOverviewDashboard = createAsyncThunk(
  "dashboard/getInvoiceStatusOverviewDashboard",
  async (
    { userId, period = "MONTH", fromDate, toDate },
    { rejectWithValue },
  ) => {
    try {
      const params = {
        userId,
        period,
      };

      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await api.get(
        "/accountService/api/v1/dashboard/invoice-status-overview",
        { params },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Failed to fetch invoice status overview",
      );
    }
  },
);

export const getRecentPayments = createAsyncThunk(
  "getRecentPayments",
  async (
    { userId, period = "MONTH", fromDate, toDate, status },
    { rejectWithValue },
  ) => {
    try {
      const params = {
        userId,
        period,
      };

      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await api.get(
        "/accountService/api/v1/dashboard/recent-payments",
        { params },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Failed to fetch invoice status overview",
      );
    }
  },
);

const DashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    loading: "",
    dashboardUsers: [],
    leadDataMonthWise: [],
    conversionReport: [],
    totalLeadCountForGraph: 0,
    totalProjectCountForGraph: 0,
    totalUserCountForGraph: 0,
    totalCompanyForGraph: 0,
    leadMonthWiseData: [],
    leadStatusWiseData: [],
    projectDataForGraph: [],
    leadDataCategoryWise: [],
    topSellLeadsList: [],
    userLeadDataMonthWiseList: [],
    revenueDataList: [],
    recentPayments: [],

    // NEW
    summaryCardsData: null,
    summaryCards: {
      totalLeads: 0,
      convertedLeads: 0,
      leadConversionPercentage: 0,
      totalLeadsGrowthPercentage: 0,
      convertedLeadsGrowthPercentage: 0,
    },
    leadStatusCounts: [],
    summaryCardsLoading: "",
    summaryCardsError: null,

    projectOverviewData: null,
    projectOverviewCards: [],
    projectOverviewLoading: "",
    projectOverviewError: null,

    userProjectDashboard: null,
    userProjectDashboardLoading: "",
    userProjectDashboardError: null,

    leadsFunnelData: null,
    leadsFunnelLoading: "",
    leadsFunnelError: null,

    leadsBySolutionData: null,
    leadsBySolutionList: [],
    leadsBySolutionLoading: "",
    leadsBySolutionError: null,

    topSellingServicesDashboard: [],
    topSellingServicesDashboardLoading: "",
    topSellingServicesDashboardError: null,

    topConvertedLeadsDashboard: [],
    topConvertedLeadsDashboardLoading: "",
    topConvertedLeadsDashboardError: null,

    revenueTrendData: null,
    revenueTrendLoading: "",
    revenueTrendError: null,

    revenueCardsData: null,
    revenueCardsLoading: "",
    revenueCardsError: null,

    paymentSummaryData: null,
    paymentSummaryLoading: "",
    paymentSummaryError: null,

    topCompaniesDashboard: [],
    topCompaniesDashboardLoading: "",
    topCompaniesDashboardError: null,

    revenueByServiceDashboard: [],
    revenueByServiceDashboardLoading: "",
    revenueByServiceDashboardError: null,

    billingOverview: null,
    billingOverviewLoading: false,
    billingOverviewError: null,

    billingVsCollection: null,
    billingVsCollectionLoading: false,
    billingVsCollectionError: null,

    approvalQueueData: null,
    approvalQueueItems: [],
    approvalQueueLoading: false,
    approvalQueueError: null,

    invoiceStatusOverviewData: null,
    invoiceStatusOverviewLoading: false,
    invoiceStatusOverviewError: null,
  },
  extraReducers: (builder) => {
    builder.addCase(getLeadsDataByMonth.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getLeadsDataByMonth.fulfilled, (state, action) => {
      state.loading = "success";
      state.leadDataMonthWise = action?.payload;
    });
    builder.addCase(getLeadsDataByMonth.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getDashboardUsersByHeirarchy.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getDashboardUsersByHeirarchy.fulfilled, (state, action) => {
      state.loading = "success";
      state.dashboardUsers = action.payload;
    });
    builder.addCase(getDashboardUsersByHeirarchy.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getConversionReport.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getConversionReport.fulfilled, (state, action) => {
      state.loading = "success";
      state.conversionReport = action.payload;
    });
    builder.addCase(getConversionReport.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getTotalLeadCountForGraph.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getTotalLeadCountForGraph.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalLeadCountForGraph = action?.payload;
    });
    builder.addCase(getTotalLeadCountForGraph.rejected, (state) => {
      state.loading = "error";
    });

    builder.addCase(getTotalProjectCounts.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getTotalProjectCounts.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalProjectCountForGraph = action?.payload;
    });
    builder.addCase(getTotalProjectCounts.rejected, (state) => {
      state.loading = "error";
    });

    builder.addCase(totalUserCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(totalUserCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalUserCountForGraph = action?.payload;
    });
    builder.addCase(totalUserCount.rejected, (state) => {
      state.loading = "error";
    });

    builder.addCase(totalCompanyForGraph.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(totalCompanyForGraph.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalCompanyForGraph = action?.payload;
    });
    builder.addCase(totalCompanyForGraph.rejected, (state) => {
      state.loading = "error";
    });

    builder.addCase(getLeadDataMonthWise.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getLeadDataMonthWise.fulfilled, (state, action) => {
      state.loading = "success";
      state.leadMonthWiseData = action?.payload;
    });
    builder.addCase(getLeadDataMonthWise.rejected, (state) => {
      state.loading = "error";
    });

    builder.addCase(getLeadsDistributionStatusWise.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getLeadsDistributionStatusWise.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.leadStatusWiseData = action?.payload;
      },
    );
    builder.addCase(getLeadsDistributionStatusWise.rejected, (state) => {
      state.loading = "error";
    });

    builder.addCase(projectMontWiseDataForGraph.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(projectMontWiseDataForGraph.fulfilled, (state, action) => {
      state.loading = "success";
      state.projectDataForGraph = action?.payload;
    });
    builder.addCase(projectMontWiseDataForGraph.rejected, (state) => {
      state.loading = "error";
    });

    builder.addCase(getLeadCategoryWise.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getLeadCategoryWise.fulfilled, (state, action) => {
      state.loading = "success";
      state.leadDataCategoryWise = action?.payload;
    });
    builder.addCase(getLeadCategoryWise.rejected, (state) => {
      state.loading = "error";
    });

    builder.addCase(getTopSellLeadsData.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getTopSellLeadsData.fulfilled, (state, action) => {
      state.loading = "success";
      state.topSellLeadsList = action?.payload;
    });
    builder.addCase(getTopSellLeadsData.rejected, (state) => {
      state.loading = "error";
    });

    builder.addCase(getAllUserLeadDataMonthWise.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllUserLeadDataMonthWise.fulfilled, (state, action) => {
      state.loading = "success";
      state.userLeadDataMonthWiseList = action?.payload;
    });
    builder.addCase(getAllUserLeadDataMonthWise.rejected, (state) => {
      state.loading = "error";
    });

    builder.addCase(getAllRevenueDataMonthWise.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllRevenueDataMonthWise.fulfilled, (state, action) => {
      state.loading = "success";
      state.revenueDataList = action?.payload;
    });
    builder.addCase(getAllRevenueDataMonthWise.rejected, (state) => {
      state.loading = "error";
    });

    builder.addCase(getDashboardSummaryCards.pending, (state) => {
      state.summaryCardsLoading = "pending";
      state.summaryCardsError = null;
    });

    builder.addCase(getDashboardSummaryCards.fulfilled, (state, action) => {
      state.summaryCardsLoading = "success";

      state.summaryCardsData = action?.payload;

      state.summaryCards = action?.payload?.summaryCards || {
        totalLeads: 0,
        convertedLeads: 0,
        leadConversionPercentage: 0,
        totalLeadsGrowthPercentage: 0,
        convertedLeadsGrowthPercentage: 0,
      };

      state.leadStatusCounts = action?.payload?.statusCounts || [];
    });

    builder.addCase(getDashboardSummaryCards.rejected, (state, action) => {
      state.summaryCardsLoading = "error";
      state.summaryCardsError =
        action?.error?.message || "Something went wrong";
    });

    builder.addCase(getProjectOverviewCards.pending, (state) => {
      state.projectOverviewLoading = "pending";
      state.projectOverviewError = null;
    });

    builder.addCase(getProjectOverviewCards.fulfilled, (state, action) => {
      state.projectOverviewLoading = "success";
      state.projectOverviewData = action.payload;
      state.projectOverviewCards = action?.payload?.cards || [];
    });

    builder.addCase(getProjectOverviewCards.rejected, (state, action) => {
      state.projectOverviewLoading = "error";
      state.projectOverviewError =
        action?.error?.message || "Something went wrong";
    });

    builder.addCase(getUserProjectDashboard.pending, (state) => {
      state.userProjectDashboardLoading = "pending";
      state.userProjectDashboardError = null;
    });

    builder.addCase(getUserProjectDashboard.fulfilled, (state, action) => {
      state.userProjectDashboardLoading = "success";
      state.userProjectDashboard = action.payload;
    });

    builder.addCase(getUserProjectDashboard.rejected, (state, action) => {
      state.userProjectDashboardLoading = "error";
      state.userProjectDashboardError =
        action?.error?.message || "Something went wrong";
    });

    builder.addCase(getLeadsFunnel.pending, (state) => {
      state.leadsFunnelLoading = "pending";
      state.leadsFunnelError = null;
    });

    builder.addCase(getLeadsFunnel.fulfilled, (state, action) => {
      state.leadsFunnelLoading = "success";
      state.leadsFunnelData = action.payload;
    });

    builder.addCase(getLeadsFunnel.rejected, (state, action) => {
      state.leadsFunnelLoading = "error";
      state.leadsFunnelError = action?.error?.message || "Something went wrong";
    });

    builder.addCase(getLeadsBySolution.pending, (state) => {
      state.leadsBySolutionLoading = "pending";
      state.leadsBySolutionError = null;
    });

    builder.addCase(getLeadsBySolution.fulfilled, (state, action) => {
      state.leadsBySolutionLoading = "success";
      state.leadsBySolutionData = action.payload;
      state.leadsBySolutionList = action?.payload?.solutions || [];
    });

    builder.addCase(getLeadsBySolution.rejected, (state, action) => {
      state.leadsBySolutionLoading = "error";
      state.leadsBySolutionError =
        action?.error?.message || "Something went wrong";
    });

    builder.addCase(getTopSellingServicesDashboard.pending, (state) => {
      state.topSellingServicesDashboardLoading = "pending";
      state.topSellingServicesDashboardError = null;
    });

    builder.addCase(
      getTopSellingServicesDashboard.fulfilled,
      (state, action) => {
        state.topSellingServicesDashboardLoading = "success";
        state.topSellingServicesDashboard =
          action?.payload?.topSellingServices || [];
      },
    );

    builder.addCase(
      getTopSellingServicesDashboard.rejected,
      (state, action) => {
        state.topSellingServicesDashboardLoading = "error";
        state.topSellingServicesDashboardError =
          action?.error?.message || "Something went wrong";
      },
    );

    builder.addCase(getTopConvertedLeadsDashboard.pending, (state) => {
      state.topConvertedLeadsDashboardLoading = "pending";
      state.topConvertedLeadsDashboardError = null;
    });

    builder.addCase(
      getTopConvertedLeadsDashboard.fulfilled,
      (state, action) => {
        state.topConvertedLeadsDashboardLoading = "success";
        state.topConvertedLeadsDashboard =
          action?.payload?.topConvertedLeads || [];
      },
    );

    builder.addCase(getTopConvertedLeadsDashboard.rejected, (state, action) => {
      state.topConvertedLeadsDashboardLoading = "error";
      state.topConvertedLeadsDashboardError =
        action?.error?.message || "Something went wrong";
    });

    builder.addCase(getRevenueTrendDashboard.pending, (state) => {
      state.revenueTrendLoading = "pending";
      state.revenueTrendError = null;
    });

    builder.addCase(getRevenueTrendDashboard.fulfilled, (state, action) => {
      state.revenueTrendLoading = "success";
      state.revenueTrendData = action.payload;
    });

    builder.addCase(getRevenueTrendDashboard.rejected, (state, action) => {
      state.revenueTrendLoading = "error";
      state.revenueTrendError =
        action?.error?.message || "Something went wrong";
    });

    builder.addCase(getRevenueCardsDashboard.pending, (state) => {
      state.revenueCardsLoading = "pending";
      state.revenueCardsError = null;
    });

    builder.addCase(getRevenueCardsDashboard.fulfilled, (state, action) => {
      state.revenueCardsLoading = "success";
      state.revenueCardsData = action.payload;
    });

    builder.addCase(getRevenueCardsDashboard.rejected, (state, action) => {
      state.revenueCardsLoading = "error";
      state.revenueCardsError =
        action?.error?.message || "Something went wrong";
    });

    builder.addCase(getPaymentSummaryDashboard.pending, (state) => {
      state.paymentSummaryLoading = "pending";
      state.paymentSummaryError = null;
    });

    builder.addCase(getPaymentSummaryDashboard.fulfilled, (state, action) => {
      state.paymentSummaryLoading = "success";
      state.paymentSummaryData = action.payload;
    });

    builder.addCase(getPaymentSummaryDashboard.rejected, (state, action) => {
      state.paymentSummaryLoading = "error";
      state.paymentSummaryError =
        action?.error?.message || "Something went wrong";
    });

    builder.addCase(getTopCompaniesDashboard.pending, (state) => {
      state.topCompaniesDashboardLoading = "pending";
      state.topCompaniesDashboardError = null;
    });

    builder.addCase(getTopCompaniesDashboard.fulfilled, (state, action) => {
      state.topCompaniesDashboardLoading = "success";
      state.topCompaniesDashboard = action?.payload?.topCompanies || [];
    });

    builder.addCase(getTopCompaniesDashboard.rejected, (state, action) => {
      state.topCompaniesDashboardLoading = "error";
      state.topCompaniesDashboardError =
        action?.error?.message || "Something went wrong";
    });

    builder.addCase(getRevenueByServiceDashboard.pending, (state) => {
      state.revenueByServiceDashboardLoading = "pending";
      state.revenueByServiceDashboardError = null;
    });

    builder.addCase(getRevenueByServiceDashboard.fulfilled, (state, action) => {
      state.revenueByServiceDashboardLoading = "success";
      state.revenueByServiceDashboard =
        action?.payload?.revenueByServices || [];
    });

    builder.addCase(getRevenueByServiceDashboard.rejected, (state, action) => {
      state.revenueByServiceDashboardLoading = "error";
      state.revenueByServiceDashboardError =
        action?.error?.message || "Something went wrong";
    });

    builder.addCase(getBillingOverview.pending, (state) => {
      state.billingOverviewLoading = true;
      state.billingOverviewError = null;
    });
    builder.addCase(getBillingOverview.fulfilled, (state, action) => {
      state.billingOverviewLoading = false;
      state.billingOverview = action.payload;
    });
    builder.addCase(getBillingOverview.rejected, (state, action) => {
      state.billingOverviewLoading = false;
      state.billingOverviewError =
        action.payload || "Failed to fetch billing overview";
    });

    builder.addCase(getBillingVsCollection.pending, (state) => {
      state.billingVsCollectionLoading = true;
      state.billingVsCollectionError = null;
    });

    builder.addCase(getBillingVsCollection.fulfilled, (state, action) => {
      state.billingVsCollectionLoading = false;
      state.billingVsCollection = action.payload;
    });

    builder.addCase(getBillingVsCollection.rejected, (state, action) => {
      state.billingVsCollectionLoading = false;
      state.billingVsCollectionError =
        action.payload || "Failed to fetch billing vs collection";
    });

    builder.addCase(getApprovalQueueDashboard.pending, (state) => {
      state.approvalQueueLoading = true;
      state.approvalQueueError = null;
    });

    builder.addCase(getApprovalQueueDashboard.fulfilled, (state, action) => {
      state.approvalQueueLoading = false;
      state.approvalQueueData = action.payload;
      state.approvalQueueItems = action?.payload?.items || [];
    });

    builder.addCase(getApprovalQueueDashboard.rejected, (state, action) => {
      state.approvalQueueLoading = false;
      state.approvalQueueError =
        action.payload || "Failed to fetch approval queue";
    });

    builder.addCase(getInvoiceStatusOverviewDashboard.pending, (state) => {
      state.invoiceStatusOverviewLoading = true;
      state.invoiceStatusOverviewError = null;
    });

    builder.addCase(
      getInvoiceStatusOverviewDashboard.fulfilled,
      (state, action) => {
        state.invoiceStatusOverviewLoading = false;
        state.invoiceStatusOverviewData = action.payload;
      },
    );

    builder.addCase(
      getInvoiceStatusOverviewDashboard.rejected,
      (state, action) => {
        state.invoiceStatusOverviewLoading = false;
        state.invoiceStatusOverviewError =
          action.payload || "Failed to fetch invoice status overview";
      },
    );
  },
});

export default DashboardSlice.reducer;
