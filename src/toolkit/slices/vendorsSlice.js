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
    console.log("dshgsdjhgdsjgs",data)
    const response = await api.post(
      `/leadService/api/v1/vendor/map-assignee-to-sub-category?subCategoryId=${data?.subCategoryId}`,
      JSON.stringify(data?.data || [])
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

    builder.addCase(getVendorDetailList.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getVendorDetailList.fulfilled, (state, action) => {
      state.loading = "success";
      state.vendorsList = action?.payload;
    });
    builder.addCase(getVendorDetailList.rejected, (state, action) => {
      state.loading = "rejected";
      state.vendorsList = [];
    });

    builder.addCase(getAllVendorsRequest.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllVendorsRequest.fulfilled, (state, action) => {
      state.loading = "success";
      state.totalVendorRequestCount = action?.payload?.totalItems;
      state.allVendorsRequestList = action?.payload?.vendorsRequests;
    });
    builder.addCase(getAllVendorsRequest.rejected, (state, action) => {
      state.loading = "rejected";
      state.totalVendorRequestCount = 0;
      state.allVendorsRequestList = [];
    });
  },
});

export default VendorsSlice.reducer;
