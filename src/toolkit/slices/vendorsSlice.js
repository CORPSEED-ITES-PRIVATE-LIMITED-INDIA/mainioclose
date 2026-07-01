import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const allVendorsCategory = createAsyncThunk(
  "allVendorsCatagory",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/vendor/fetch-all-vendor-category?page=1&size=1000`,
    );
    return response.data;
  },
);

export const getSingleCategoryDataById = createAsyncThunk(
  "getSingleCatagoryDataById",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/vendor/fetch-vendor-category?categoryId=${id}`,
    );
    return response.data;
  },
);

export const getVendorDetailList = createAsyncThunk(
  "getVendorDetail",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/vendor/find-vendor-request-by-user-id?userId=${data?.userId}&leadId=${data?.leadId}`,
    );
    return response.data;
  },
);

export const addVendorsDetail = createAsyncThunk(
  "vendorsDetail",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/vendor/create-vendor-request?leadId=${data?.leadId}&userId=${data?.userId}`,
      data?.data,
    );
    return response.data;
  },
);

export const getAllVendorsRequest = createAsyncThunk(
  "getAllVendorsRequest",
  async ({ userId, page, size }) => {
    const response = await api.get(
      `/leadService/api/v1/vendor/find-all-vendor-request?userId=${userId}&page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const createVendorsCategory = createAsyncThunk(
  "createVendorsCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/vendor/create-vendor-category?userId=${data?.userId}&categoryName=${data?.categoryName}`,
    );
    return response.data;
  },
);

export const updateVendorsCategory = createAsyncThunk(
  "updateVendorsCategory",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/vendor/update-vendor-category?userId=${data?.userId}&categoryId=${data?.categoryId}&newCategoryName=${data?.categoryName}`,
    );
    return response.data;
  },
);

export const createVendorsSubCategory = createAsyncThunk(
  "createVendorsCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/vendor/create-vendor-sub-category?userId=${data?.userId}`,
      data,
    );
    return response.data;
  },
);

export const updateVendorsSubCategory = createAsyncThunk(
  "updateVendorsSubCategory",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/vendor/update-vendor-sub-category?userId=${data?.userId}&categoryId=${data?.categoryId}&subCategoryId=${data?.subCategoryId}&newSubCategoryName=${data?.subCategoryName}&vendorCategoryResearchTat=${data?.vendorCategoryResearchTat}&vendorCompletionTat=${data?.vendorCompletionTat}`,
    );
    return response.data;
  },
);

export const updateProcurementUsers = createAsyncThunk(
  "updateProcurementUsers",
  async (data) => {
    console.log("dshgsdjhgdsjgs", data);
    const response = await api.post(
      `/leadService/api/v1/vendor/map-assignee-to-sub-category?subCategoryId=${data?.subCategoryId}`,
      JSON.stringify(data?.data || []),
    );
    return response.data;
  },
);

export const getAllVendorsStatus = createAsyncThunk(
  "getAllVendorsStatus",
  async () => {
    const response = await api.get(`/leadService/api/v1/vendor-status-all`);
    return response.data;
  },
);

export const getvendorHistoryByLeadId = createAsyncThunk(
  "getvendorHistoryByLeadId",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/vendor/find-update-request-history?userId=${data?.userId}&leadId=${data?.leadId}&vendorRequestId=${data?.vendorRequestId}`,
    );
    return response.data;
  },
);

export const getVendorDetailByVendorId = createAsyncThunk(
  "getVendorDetailByVendorId",
  async ({ userId, vendorId }) => {
    const response = await api.get(
      `/leadService/api/v1/details-with-history?userId=${userId}&vendorId=${vendorId}`,
    );
    return response.data;
  },
);

export const cancelVendorsRequest = createAsyncThunk(
  "cancelVendorsRequest",
  async ({ vendorRequestId, userId, cancelReason }) => {
    const response = await api.delete(
      `/leadService/api/v1/vendor/cancel-vendor-request?vendorRequestId=${vendorRequestId}&userId=${userId}&cancelReason=${cancelReason}`,
    );
    return response.data;
  },
);

export const updateVendorStatus = createAsyncThunk(
  "updateVendorStatus",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/vendor/update-vendor-request?vendorId=${data?.vendorId}&userId=${data?.userId}&leadId=${data?.leadId}`,
      data?.data,
    );
    return response.data;
  },
);

export const sendVendorsProposal = createAsyncThunk(
  "vendorsProposal",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/vendor/send-quotation?leadId=${data?.leadId}&userId=${data?.userId}&vendorRequestId=${data?.vendorRequestId}`,
      data?.data,
    );
    return response.data;
  },
);

export const searchInVendorsList = createAsyncThunk(
  `searchInVendorsList`,
  async ({ userId, searchInput }) => {
    const response = await api.get(
      `/leadService/api/v1/vendor/vendor-search?userId=${userId}&searchInput=${searchInput}`,
    );
    return response.data;
  },
);

export const vendorsExportReportFilteration = createAsyncThunk(
  "vendorsExportReportFilteration",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/vendor/vendor-report`,
      data,
    );
    return response.data;
  },
);

export const getAllVendorsEstimate = createAsyncThunk(
  "getAllVendorsEstimate",
  async ({ userId, page, size }) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getAllEstimateForProcurement?userId=${userId}&page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getVendorsEstimateCount = createAsyncThunk(
  "getVendorsEstimateCount",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getAllEstimateForProcurementForCount?userId=${userId}`,
    );
    return response.data;
  },
);

export const updatePaymentForVendorPayment = createAsyncThunk(
  "updatePaymentForVendorPayment",
  async ({ userId, estimateId, status }) => {
    const response = await api.put(
      `/leadService/api/v1/leadEstimate/markedEstimateSource?userId=${userId}&estimateId=${estimateId}&status=${status}`,
    );
    return response.data;
  },
);

export const getVendorPaymentHistory = createAsyncThunk(
  "getVendorPaymentHistory",
  async (id) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllVendorPaymentRegisterHistoryById?id=${id}`,
    );
    return response.data;
  },
);

export const updateVendorPaymentFromAccounts = createAsyncThunk(
  "updateVendorPaymentFromAccounts",
  async (data) => {
    const response = await api.put(
      `/accountService/api/v1/paymentRegister/addAmountByAccountTeam`,
      data,
    );
    return response.data;
  },
);

export const getVendorPaymentRegisterInAdmin = createAsyncThunk(
  "getVendorPaymentRegisterInAdmin",
  async ({ page, size, status }) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllVendorPaymentRegisterForAdmin?page=${page}&size=${size}&status=${status}`,
    );
    return response.data;
  },
);

export const getVendorPaymentCountInAdmin = createAsyncThunk(
  "getVendorPaymentCountInAdmin",
  async (status) => {
    const response = await api.get(
      `/accountService/api/v1/paymentRegister/getAllVendorPaymentRegisterCountForAdmin?status=${status}`,
    );
    return response.data;
  },
);

export const changeProcurementAssignee = createAsyncThunk(
  "changeProcurementAssignee",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/vendor/edit-vendor-details-request?updatedById=${data?.updatedById}&assigneeToId=${data?.assigneeToId}`,
      data?.data,
    );
    return response.data;
  },
);

export const createVendor = createAsyncThunk(
  "createVendor",
  async ({ data, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/vendors?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getAllVendors = createAsyncThunk(
  "getAllVendors",
  async ({ page, size, search, userId }) => {
    const response = await api.get(
      `/operationService/api/vendors?userId=${userId}&page=${page}&size=${size}&keyword=${search}`,
    );
    return response.data;
  },
);

export const updateVendor = createAsyncThunk(
  "vendors/updateVendor",
  async ({ id, data, userId }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/vendors/${id}?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong while updating vendor",
        },
      );
    }
  },
);

export const deleteVendor = createAsyncThunk(
  "vendors/deleteVendor",
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/operationService/api/vendors/${id}?userId=${userId}`,
      );
      return {
        id,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong while deleting vendor",
        },
      );
    }
  },
);

export const getVendorDetailInProject = createAsyncThunk(
  "getVendorDetailInProject",
  async ({ procurementAssignmentId }) => {
    const response = await api.get(
      `/operationService/api/procurement-assignments/${procurementAssignmentId}`,
    );
    return response.data;
  },
);

export const getProductVendorsByProductId = createAsyncThunk(
  "operation/getProductVendorsByProductId",
  async (
    { productId, userId, status, page = 1, size = 10 },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get("/operationService/api/rfq", {
        params: {
          productId,
          userId,
          status,
          page,
          size,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch RFQ vendors",
      );
    }
  },
);

export const createVendorAgainstProduct = createAsyncThunk(
  "operation/createVendorAgainstProduct",
  async ({ productId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/products/${productId}/vendors`,
        data,
        {
          params: {
            userId,
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to create RFQ",
      );
    }
  },
);

export const createRFQ = createAsyncThunk(
  "createRFQ",
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/rfq?userId=${userId}`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  },
);

export const sendRfqToVendors = createAsyncThunk(
  "sendRfqToVendors",
  async ({ rfqId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/rfq/${rfqId}/send-to-vendors?userId=${userId}`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  },
);

export const createQuotation = createAsyncThunk(
  "operation/createQuotation",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/operationService/api/quotation", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to create quotation",
      );
    }
  },
);

export const getAllQuotations = createAsyncThunk(
  "operation/getAllQuotations",
  async (rfqId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/quotation/rfq/${rfqId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to fetch quotations",
      );
    }
  },
);

export const getRFQVendorsByRfqId = createAsyncThunk(
  "operation/getRFQVendorsByRfqId",
  async (rfqId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/rfq/${rfqId}/vendors`,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch RFQ vendors",
      );
    }
  },
);

export const getRFQById = createAsyncThunk(
  "getRFQVendorsById",
  async (rfqId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/operationService/api/rfq/${rfqId}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch RFQ vendors",
      );
    }
  },
);
export const getVendorsByVendorIdandRFQId = createAsyncThunk(
  "getVendorsByVendorIdandRFQId",
  async ({ vendorId, rfqId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/rfq/${rfqId}/vendors/${vendorId}`,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch RFQ vendors",
      );
    }
  },
);
export const createVendorFinalization = createAsyncThunk(
  "getVendorsByVendorIdandRFQId",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/vendor-finalizations`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch RFQ vendors",
      );
    }
  },
);
export const sendVendorOnboardingForm = createAsyncThunk(
  "sendVendorOnboardingForm",
  async ({ data, vendorFinalizationId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/vendor-onboarding/send-form/${vendorFinalizationId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch RFQ vendors",
      );
    }
  },
);
export const getVendorFinalizationById = createAsyncThunk(
  "getVendorFinalizationById",
  async ({ data, vendorFinalizationId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/vendor-finalizations/${vendorFinalizationId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch RFQ vendors",
      );
    }
  },
);
export const getVendorFinalizationByRfqId = createAsyncThunk(
  "getVendorFinalizationByRfqId",
  async ({ data, rfqId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/vendor-finalizations/rfq/${rfqId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch RFQ vendors",
      );
    }
  },
);
export const createLegalRequest = createAsyncThunk(
  "createLegalRequest",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/vendor-quotation-legal-requests`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch RFQ vendors",
      );
    }
  },
);
export const updateRFQVendorMapping = createAsyncThunk(
  "updateRFQVendorMapping",
  async ({ rfqId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/rfq/${rfqId}?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch RFQ vendors",
      );
    }
  },
);

export const getVendorsBasedOnService = createAsyncThunk(
  "getVendorsBasedOnService",
  async ({ productId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/products/${productId}/vendors/list?userId=${userId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch vendors based on service",
      );
    }
  },
);

export const getVendorsDashboardSummaryByProductId = createAsyncThunk(
  "getVendorsDashboardSummaryByProductId",
  async (productId) => {
    const response = await api.get(
      `/operationService/api/product-vendor-dashboard/${productId}/summary`,
    );
    return response.data;
  },
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
    vendorPaymentListForAdmin: [],
    vendorPaymentCountForAdmin: 0,
    vendorDetail: {},
    vendorList: [],
    vendorDetailInProject: {},
    rfqVendors: [],
    rfqVendorsLoading: false,
    rfqVendorsError: null,
    vendorListBasedOnService: [],
    vendorSummary: {},
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
      },
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

    builder.addCase(getVendorPaymentRegisterInAdmin.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getVendorPaymentRegisterInAdmin.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.vendorPaymentListForAdmin = action?.payload;
      },
    );
    builder.addCase(getVendorPaymentRegisterInAdmin.rejected, (state) => {
      state.loading = "rejected";
      state.vendorPaymentListForAdmin = [];
    });

    builder.addCase(getVendorPaymentCountInAdmin.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getVendorPaymentCountInAdmin.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorPaymentCountForAdmin = action?.payload;
    });
    builder.addCase(getVendorPaymentCountInAdmin.rejected, (state) => {
      state.loading = "rejected";
      state.vendorPaymentCountForAdmin = 0;
    });

    builder.addCase(getVendorDetailByVendorId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getVendorDetailByVendorId.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorDetail = action?.payload;
    });
    builder.addCase(getVendorDetailByVendorId.rejected, (state) => {
      state.loading = "rejected";
      state.vendorDetail = {};
    });

    builder.addCase(getAllVendors.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllVendors.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorList = action?.payload;
    });
    builder.addCase(getAllVendors.rejected, (state) => {
      state.loading = "rejected";
      state.vendorList = [];
    });

    builder.addCase(getVendorDetailInProject.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getVendorDetailInProject.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorDetailInProject = action?.payload;
    });
    builder.addCase(getVendorDetailInProject.rejected, (state) => {
      state.loading = "rejected";
      state.vendorDetailInProject = {};
    });

    builder.addCase(getRFQVendorsByRfqId.pending, (state) => {
      state.rfqVendorsLoading = true;
      state.rfqVendorsError = null;
    });

    builder.addCase(getRFQVendorsByRfqId.fulfilled, (state, action) => {
      state.rfqVendorsLoading = false;
      state.rfqVendors = Array.isArray(action.payload) ? action.payload : [];
    });

    builder.addCase(getRFQVendorsByRfqId.rejected, (state, action) => {
      state.rfqVendorsLoading = false;
      state.rfqVendors = [];
      state.rfqVendorsError = action.payload;
    });

    builder.addCase(getVendorsBasedOnService.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getVendorsBasedOnService.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorListBasedOnService = Array.isArray(action.payload)
        ? action.payload
        : [];
    });

    builder.addCase(getVendorsBasedOnService.rejected, (state, action) => {
      state.loading = "rejected";
      state.vendorListBasedOnService = [];
    });

    builder.addCase(getVendorsDashboardSummaryByProductId.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(
      getVendorsDashboardSummaryByProductId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.vendorSummary = action.payload;
      },
    );

    builder.addCase(
      getVendorsDashboardSummaryByProductId.rejected,
      (state, action) => {
        state.loading = "rejected";
        state.vendorSummary = {};
      },
    );
  },
});

export default VendorsSlice.reducer;
