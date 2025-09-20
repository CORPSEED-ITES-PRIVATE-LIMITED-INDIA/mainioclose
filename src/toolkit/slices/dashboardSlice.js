import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getLeadsDataByMonth = createAsyncThunk(
  "getLeadsDataByMonth",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllLeadsMonthWise`,
      data
    );
    return response.data;
  }
);

export const getConversionReport = createAsyncThunk(
  "getConversionReport",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getLeadConversionReport`,
      data
    );
    return response.data;
  }
);

export const getDashboardUsersByHeirarchy = createAsyncThunk(
  "getDashboardUsersByHeirarchy",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/users/getAllLowerHierarchy?userId=${id}`
    );
    return response.data;
  }
);

export const getTotalLeadCountForGraph = createAsyncThunk(
  "getTotalLeadCountForGraph",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/salesDashboard/getTotalLeadCount?currentUserId=${userId}`
    );
    return response.data;
  }
);

export const getTotalProjectCounts = createAsyncThunk(
  "getTotalProjectCounts",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/salesDashboard/getTotalProjectCount?currentUserId=${userId}`
    );
    return response.data;
  }
);

export const totalUserCount = createAsyncThunk("totalUserCount", async (userId) => {
  const response = await api.get(
    `/leadService/api/v1/salesDashboard/getTotalUserCount?currentUserId=${userId}`
  );
  return response.data;
});

export const totalCompanyForGraph = createAsyncThunk(
  "totalCompanyForGraph",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/salesDashboard/getTotalCompanyCount?currentUserId=${userId}`
    );
    return response.data;
  }
);

export const getLeadDataMonthWise = createAsyncThunk(
  "getLeadDataMonthWise",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllLeadsMonthWiseData`,
      data
    );
    return response.data;
  }
);

export const getLeadsDistributionStatusWise = createAsyncThunk(
  "getLeadsDistributionStatusWise",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllLeadCountStatusWise`,
      data
    );
    return response.data;
  }
);

export const projectMontWiseDataForGraph = createAsyncThunk(
  "projectMontWiseDataForGraph",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllProjectMonthWise`,
      data
    );
    return response.data;
  }
);

export const getLeadCategoryWise = createAsyncThunk(
  "getLeadCategoryWise",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllTypeLeadCount`,
      data
    );
    return response.data;
  }
);

export const getTopSellLeadsData = createAsyncThunk(
  "getTopSellLeadsData",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllTopSellLead`,
      data
    );
    return response.data;
  }
);

export const getAllUserLeadDataMonthWise = createAsyncThunk(
  "getAllUserLeadDataMonthWise",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/salesDashboard/getAllUserAssignLeadsMonthWise`,
      data
    );
    return response.data;
  }
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
    userLeadDataMonthWiseList:[]
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
      }
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
  },
});

export default DashboardSlice.reducer;
