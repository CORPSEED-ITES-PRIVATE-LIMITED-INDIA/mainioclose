import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const allVendorsCategory = createAsyncThunk(
  "allVendorsCatagory",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/vendor/fetch-all-vendor-category?page=1&size=1000`
    );
    return response.data;
  }
);

export const getSingleCategoryDataById = createAsyncThunk(
  "getSingleCatagoryDataById",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/vendor/fetch-vendor-category?categoryId=${id}`
    );
    return response.data;
  }
);

export const getVendorDetailList = createAsyncThunk(
  "getVendorDetail",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/vendor/find-vendor-request-by-user-id?userId=${data?.userId}&leadId=${data?.leadId}`
    );
    return response.data;
  }
);

export const addVendorsDetail = createAsyncThunk(
  "vendorsDetail",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/vendor/create-vendor-request?leadId=${data?.leadId}&userId=${data?.userId}`,
      data?.data
    );
    return response.data;
  }
);

export const getAllVendorsRequest = createAsyncThunk(
  "getAllVendorsRequest",
  async ({ userId, page, size }) => {
    const response = await api.get(
      `/leadService/api/v1/vendor/find-all-vendor-request?userId=${userId}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const createVendorsCategory = createAsyncThunk(
  "createVendorsCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/vendor/create-vendor-category?userId=${data?.userId}&categoryName=${data?.categoryName}`
    );
    return response.data;
  }
);

export const updateVendorsCategory = createAsyncThunk(
  "updateVendorsCategory",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/vendor/update-vendor-category?userId=${data?.userId}&categoryId=${data?.categoryId}&newCategoryName=${data?.categoryName}`
    );
    return response.data;
  }
);

export const createVendorsSubCategory = createAsyncThunk(
  "createVendorsCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/vendor/create-vendor-sub-category?userId=${data?.userId}`,
      data
    );
    return response.data;
  }
);

export const updateVendorsSubCategory = createAsyncThunk(
  "updateVendorsSubCategory",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/vendor/update-vendor-sub-category?userId=${data?.userId}&categoryId=${data?.categoryId}&subCategoryId=${data?.subCategoryId}&newSubCategoryName=${data?.subCategoryName}&vendorCategoryResearchTat=${data?.vendorCategoryResearchTat}&vendorCompletionTat=${data?.vendorCompletionTat}`
    );
    return response.data;
  }
);

export const updateProcurementUsers = createAsyncThunk(
  "updateProcurementUsers",
  async (data) => {
    console.log("dshgsdjhgdsjgs", data);
    const response = await api.post(
      `/leadService/api/v1/vendor/map-assignee-to-sub-category?subCategoryId=${data?.subCategoryId}`,
      JSON.stringify(data?.data || [])
    );
    return response.data;
  }
);

export const getAllVendorsStatus = createAsyncThunk(
  "getAllVendorsStatus",
  async () => {
    const response = await api.get(`/leadService/api/v1/vendor-status-all`);
    return response.data;
  }
);

export const getvendorHistoryByLeadId = createAsyncThunk(
  "getvendorHistoryByLeadId",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/vendor/find-update-request-history?userId=${data?.userId}&leadId=${data?.leadId}&vendorRequestId=${data?.vendorRequestId}`
    );
    return response.data;
  }
);

export const cancelVendorsRequest = createAsyncThunk(
  "cancelVendorsRequest",
  async ({ vendorRequestId, userId, cancelReason }) => {
    const response = await api.delete(
      `/leadService/api/v1/vendor/cancel-vendor-request?vendorRequestId=${vendorRequestId}&userId=${userId}&cancelReason=${cancelReason}`
    );
    return response.data;
  }
);

export const updateVendorStatus = createAsyncThunk(
  "updateVendorStatus",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/vendor/update-vendor-request?vendorId=${data?.vendorId}&userId=${data?.userId}&leadId=${data?.leadId}`,
      data?.data
    );
    return response.data;
  }
);

export const sendVendorsProposal = createAsyncThunk(
  "vendorsProposal",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/vendor/send-quotation?leadId=${data?.leadId}&userId=${data?.userId}&vendorRequestId=${data?.vendorRequestId}`,
      data?.data
    );
    return response.data;
  }
);

export const searchInVendorsList = createAsyncThunk(
  `searchInVendorsList`,
  async ({ userId, searchInput }) => {
    const response = await api.get(
      `/leadService/api/v1/vendor/vendor-search?userId=${userId}&searchInput=${searchInput}`
    );
    return response.data;
  }
);

export const vendorsExportReportFilteration = createAsyncThunk(
  "vendorsExportReportFilteration",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/vendor/vendor-report`,
      data
    );
    return response.data;
  }
);

export const getAllVendorsEstimate = createAsyncThunk(
  "getAllVendorsEstimate",
  async ({ userId, page, size }) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getAllEstimateForProcurement?userId=${userId}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getVendorsEstimateCount = createAsyncThunk(
  "getVendorsEstimateCount",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getAllEstimateForProcurementForCount?userId=${userId}`
    );
    return response.data;
  }
);

export const updatePaymentForVendorPayment = createAsyncThunk(
  "updatePaymentForVendorPayment",
  async ({ userId, estimateId, status }) => {
    const response = await api.put(
      `/leadService/api/v1/leadEstimate/markedEstimateSource?userId=${userId}&estimateId=${estimateId}&status=${status}`
    );
    return response.data;
  }
);

export const getVendorPaymentHistory = createAsyncThunk(
  "getVendorPaymentHistory",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllVendorPaymentRegisterHistoryById?id=${id}`
    );
    return response.data;
  }
);

const VendorsSlice = createSlice({
  name: "vendors",
  initialState: {
    vendorsCategoryList: [],
    loading: "",
    singleCategoryDetail: {},
    vendorsList: [],
    totalVendorRequestCount: 0,
    allVendorsRequestList: [],
    vendorsStatus: [],
    singleVendorHistoryList: [],
    vendorsExportData: [],
    vendorEstimateList: [],
    vendorEstimateCount: 0,
    vendorPaymentHistory: [],
  },
  extraReducers: (builder) => {
    builder.addCase(allVendorsCategory.pending, (state) => {
      state.loading = "pending";
      state.vendorsCategoryList = [];
    });
    builder.addCase(allVendorsCategory.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorsCategoryList = action.payload;
    });
    builder.addCase(allVendorsCategory.rejected, (state) => {
      state.loading = "rejected";
      state.vendorsCategoryList = [];
    });

    builder.addCase(getSingleCategoryDataById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getSingleCategoryDataById.fulfilled, (state, action) => {
      state.loading = "success";
      state.singleCategoryDetail = action?.payload;
    });
    builder.addCase(getSingleCategoryDataById.rejected, (state) => {
      state.loading = "rejected";
      state.singleCategoryDetail = {};
    });

    builder.addCase(getVendorDetailList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getVendorDetailList.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorsList = action?.payload;
    });
    builder.addCase(getVendorDetailList.rejected, (state) => {
      state.loading = "rejected";
      state.vendorsList = [];
    });

    builder.addCase(getAllVendorsRequest.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllVendorsRequest.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalVendorRequestCount = action?.payload?.totalItems;
      state.allVendorsRequestList = action?.payload?.vendorsRequests;
    });
    builder.addCase(getAllVendorsRequest.rejected, (state) => {
      state.loading = "rejected";
      state.totalVendorRequestCount = 0;
      state.allVendorsRequestList = [];
    });

    builder.addCase(searchInVendorsList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchInVendorsList.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalVendorRequestCount = action?.payload?.totalItems;
      state.allVendorsRequestList = action?.payload?.vendorsRequests;
    });
    builder.addCase(searchInVendorsList.rejected, (state) => {
      state.loading = "rejected";
      state.totalVendorRequestCount = 0;
      state.allVendorsRequestList = [];
    });

    builder.addCase(getAllVendorsStatus.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllVendorsStatus.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorsStatus = action?.payload;
    });
    builder.addCase(getAllVendorsStatus.rejected, (state) => {
      state.loading = "rejected";
      state.vendorsStatus = [];
    });

    builder.addCase(getvendorHistoryByLeadId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getvendorHistoryByLeadId.fulfilled, (state, action) => {
      state.loading = "success";
      state.singleVendorHistoryList = action?.payload;
    });
    builder.addCase(getvendorHistoryByLeadId.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(vendorsExportReportFilteration.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      vendorsExportReportFilteration.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.vendorsExportData = action?.payload?.vendorReports;
      }
    );
    builder.addCase(vendorsExportReportFilteration.rejected, (state) => {
      state.loading = "rejected";
      state.vendorsExportData = [];
    });

    builder.addCase(getAllVendorsEstimate.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllVendorsEstimate.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorEstimateList = action?.payload;
    });
    builder.addCase(getAllVendorsEstimate.rejected, (state) => {
      state.loading = "rejected";
      state.vendorEstimateList = [];
    });

    builder.addCase(getVendorsEstimateCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getVendorsEstimateCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorEstimateCount = action?.payload;
    });
    builder.addCase(getVendorsEstimateCount.rejected, (state) => {
      state.loading = "rejected";
      state.vendorEstimateCount = 0;
    });

    builder.addCase(getVendorPaymentHistory.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getVendorPaymentHistory.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorPaymentHistory = action?.payload;
    });
    builder.addCase(getVendorPaymentHistory.rejected, (state) => {
      state.loading = "rejected";
      state.vendorPaymentHistory = [];
    });
  },
});

export default VendorsSlice.reducer;
