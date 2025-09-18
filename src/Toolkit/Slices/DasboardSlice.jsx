import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postQuery } from "../../API/PostQuery";
import { getQuery } from "../../API/GetQuery";

export const projectGraphData = createAsyncThunk(
  "projectGraph",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/salesDashboard/getAllProjectGraph`,
      data
    );
    return response.data;
  }
);

export const projectGraphAmount = createAsyncThunk(
  "projectGraphAmount",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/salesDashboard/getAllProjectGraphAmount`,
      data
    );
    return response.data;
  }
);

export const getAllCompanyAmountGrapgh = createAsyncThunk(
  "getAllCompanyAmountGrapgh",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/salesDashboard/getAllCompanyAmountGraph`,
      data
    );
    return response.data;
  }
);

export const getGraphDataByUser = createAsyncThunk(
  "getGraphDataByUser",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/salesDashboard/getAllAmountUserWise`,
      data
    );
    return response.data;
  }
);

export const getTotalLeadCountForGraph = createAsyncThunk(
  "getTotalLeadCountForGraph",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/salesDashboard/getTotalLeadCount`
    );
    return response.data;
  }
);

export const getTotalProjectCounts = createAsyncThunk(
  "getTotalProjectCounts",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/salesDashboard/getTotalProjectCount`
    );
    return response.data;
  }
);

export const getLeadsDataByMonth = createAsyncThunk(
  "getLeadsDataByMonth",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/salesDashboard/getAllLeadsMonthWise`,
      data
    );
    return response.data;
  }
);

export const getLeadCategoryWise = createAsyncThunk(
  "getLeadCategoryWise",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/salesDashboard/getAllTypeLeadCount`,
      data
    );
    return response.data;
  }
);

export const totalUserCount = createAsyncThunk("totalUserCount", async () => {
  const response = await getQuery(
    `/leadService/api/v1/salesDashboard/getTotalUserCount`
  );
  return response.data;
});

export const totalCompanyForGraph = createAsyncThunk(
  "totalCompanyForGraph",
  async () => {
    const response = await getQuery(
      `/leadService/api/v1/salesDashboard/getTotalCompanyCount`
    );
    return response.data;
  }
);

export const projectMontWiseDataForGraph = createAsyncThunk(
  "projectMontWiseDataForGraph",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/salesDashboard/getAllProjectMonthWise`,
      data
    );
    return response.data;
  }
);

export const getLeadsDistributionStatusWise = createAsyncThunk(
  "getLeadsDistributionStatusWise",
  async (data) => {
    const response = await postQuery(
      `/leadService/api/v1/salesDashboard/getAllLeadCountStatusWise`,
      data
    );
    return response.data;
  }
);

const DashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    projectListData: [],
    loading: "",
    projectAmountList: [],
    companyAmountList: [],
    userGraphList: [],
    totalLeadCountForGraph: 0,
    totalProjectCountForGraph: 0,
    leadDataMonthWise: [],
    leadDataCategoryWise: {},
    totalUserCountForGraph: 0,
    totalCompanyForGraph: 0,
    projectDataForGraph: [],
    leadStatusWiseData: {},
  },
  extraReducers: (builders) => {
    builders.addCase(projectGraphData.pending, (state, action) => {
      state.loading = "pending";
    });
    builders.addCase(projectGraphData.fulfilled, (state, action) => {
      state.loading = "success";
      state.projectListData = action?.payload?.reverse();
    });
    builders.addCase(projectGraphData.rejected, (state, action) => {
      state.loading = "error";
    });

    builders.addCase(projectGraphAmount.pending, (state, action) => {
      state.loading = "pending";
    });
    builders.addCase(projectGraphAmount.fulfilled, (state, action) => {
      state.loading = "success";
      state.projectAmountList = action?.payload?.reverse();
    });
    builders.addCase(projectGraphAmount.rejected, (state, action) => {
      state.loading = "error";
    });

    builders.addCase(getAllCompanyAmountGrapgh.pending, (state, action) => {
      state.loading = "pending";
    });
    builders.addCase(getAllCompanyAmountGrapgh.fulfilled, (state, action) => {
      state.loading = "success";
      state.companyAmountList = action?.payload?.reverse();
    });
    builders.addCase(getAllCompanyAmountGrapgh.rejected, (state, action) => {
      state.loading = "error";
    });

    builders.addCase(getGraphDataByUser.pending, (state, action) => {
      state.loading = "pending";
    });
    builders.addCase(getGraphDataByUser.fulfilled, (state, action) => {
      state.loading = "success";
      state.userGraphList = action?.payload?.reverse();
    });
    builders.addCase(getGraphDataByUser.rejected, (state, action) => {
      state.loading = "error";
    });

    builders.addCase(getTotalLeadCountForGraph.pending, (state, action) => {
      state.loading = "pending";
    });
    builders.addCase(getTotalLeadCountForGraph.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalLeadCountForGraph = action?.payload;
    });
    builders.addCase(getTotalLeadCountForGraph.rejected, (state, action) => {
      state.loading = "error";
    });

    builders.addCase(getTotalProjectCounts.pending, (state, action) => {
      state.loading = "pending";
    });
    builders.addCase(getTotalProjectCounts.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalProjectCountForGraph = action?.payload;
    });
    builders.addCase(getTotalProjectCounts.rejected, (state, action) => {
      state.loading = "error";
    });

    builders.addCase(getLeadsDataByMonth.pending, (state, action) => {
      state.loading = "pending";
    });
    builders.addCase(getLeadsDataByMonth.fulfilled, (state, action) => {
      state.loading = "success";
      state.leadDataMonthWise = action?.payload;
    });
    builders.addCase(getLeadsDataByMonth.rejected, (state, action) => {
      state.loading = "error";
    });

    builders.addCase(getLeadCategoryWise.pending, (state, action) => {
      state.loading = "pending";
    });
    builders.addCase(getLeadCategoryWise.fulfilled, (state, action) => {
      state.loading = "success";
      state.leadDataCategoryWise = action?.payload;
    });
    builders.addCase(getLeadCategoryWise.rejected, (state, action) => {
      state.loading = "error";
    });

    builders.addCase(totalUserCount.pending, (state, action) => {
      state.loading = "pending";
    });
    builders.addCase(totalUserCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalUserCountForGraph = action?.payload;
    });
    builders.addCase(totalUserCount.rejected, (state, action) => {
      state.loading = "error";
    });

    builders.addCase(totalCompanyForGraph.pending, (state, action) => {
      state.loading = "pending";
    });
    builders.addCase(totalCompanyForGraph.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalCompanyForGraph = action?.payload;
    });
    builders.addCase(totalCompanyForGraph.rejected, (state, action) => {
      state.loading = "error";
    });

    builders.addCase(projectMontWiseDataForGraph.pending, (state, action) => {
      state.loading = "pending";
    });
    builders.addCase(projectMontWiseDataForGraph.fulfilled, (state, action) => {
      state.loading = "success";
      state.projectDataForGraph = action?.payload;
    });
    builders.addCase(projectMontWiseDataForGraph.rejected, (state, action) => {
      state.loading = "error";
    });

    builders.addCase(
      getLeadsDistributionStatusWise.pending,
      (state, action) => {
        state.loading = "pending";
      }
    );
    builders.addCase(
      getLeadsDistributionStatusWise.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.leadStatusWiseData = action?.payload;
      }
    );
    builders.addCase(
      getLeadsDistributionStatusWise.rejected,
      (state, action) => {
        state.loading = "error";
      }
    );
  },
});

export default DashboardSlice.reducer;
