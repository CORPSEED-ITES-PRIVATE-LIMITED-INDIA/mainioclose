import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const allVendorsCategory = createAsyncThunk(
  "allVendorsCatagory",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/vendor/fetch-all-vendor-category?page=1&size=200`
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

const VendorsSlice = createSlice({
  name: "vendors",
  initialState: {
    vendorsCategoryList: [],
    loading: "",
    singleCategoryDetail: {},
    vendorsList: [],
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
  },
});

export default VendorsSlice.reducer;
