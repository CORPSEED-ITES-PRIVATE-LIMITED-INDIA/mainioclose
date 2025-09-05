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
  async () => {
    const response = await api.get(
      `/leadService/api/v1/salesDashboard/getTotalLeadCount`
    );
    return response.data;
  }
);

export const getTotalProjectCounts = createAsyncThunk(
  "getTotalProjectCounts",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/salesDashboard/getTotalProjectCount`
    );
    return response.data;
  }
);

export const totalUserCount = createAsyncThunk("totalUserCount", async () => {
  const response = await api.get(
    `/leadService/api/v1/salesDashboard/getTotalUserCount`
  );
  return response.data;
});

export const totalCompanyForGraph = createAsyncThunk(
  "totalCompanyForGraph",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/salesDashboard/getTotalCompanyCount`
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
    leadMonthWiseData:[]
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

    builder.addCase(getTotalLeadCountForGraph.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getTotalLeadCountForGraph.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalLeadCountForGraph = action?.payload;
    });
    builder.addCase(getTotalLeadCountForGraph.rejected, (state, action) => {
      state.loading = "error";
    });

    builder.addCase(getTotalProjectCounts.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getTotalProjectCounts.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalProjectCountForGraph = action?.payload;
    });
    builder.addCase(getTotalProjectCounts.rejected, (state, action) => {
      state.loading = "error";
    });

    builder.addCase(totalUserCount.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(totalUserCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalUserCountForGraph = action?.payload;
    });
    builder.addCase(totalUserCount.rejected, (state, action) => {
      state.loading = "error";
    });

    builder.addCase(totalCompanyForGraph.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(totalCompanyForGraph.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalCompanyForGraph = action?.payload;
    });
    builder.addCase(totalCompanyForGraph.rejected, (state, action) => {
      state.loading = "error";
    });

    builder.addCase(getLeadDataMonthWise.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getLeadDataMonthWise.fulfilled, (state, action) => {
      state.loading = "success";
      state.leadMonthWiseData = action?.payload;
    });
    builder.addCase(getLeadDataMonthWise.rejected, (state, action) => {
      state.loading = "error";
    });
  },
});

export default DashboardSlice.reducer;
