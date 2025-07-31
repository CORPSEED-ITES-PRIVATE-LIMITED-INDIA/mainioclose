import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getAllNewCompanies = createAsyncThunk(
  "getAllNewCompanies",
  async ({ userId, filterUserId, type, rating, page, size }) => {
    const response = await api.get(
      `/leadService/api/v1/company/getAllParentCompanyV2?userId=${userId}&filterUserId=${filterUserId}&type=${type}&rating=${rating}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getAllGstTypeByCompanyTypeId = createAsyncThunk(
  "getAllGstTypeById",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/state/getGstTypeById?id=${id}`
    );
    return response.data;
  }
);

export const getBusinessTypeByGstTypeId = createAsyncThunk(
  "getBusinessTypeByGstTypeId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/state/getPriceTypeByBussinessTypeId?id=${id}`
    );
    return response.data;
  }
);

export const getAllCompanyType = createAsyncThunk(
  "getAllCompanyType",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/state/getAllCompanyType`
    );
    return response.data;
  }
);

const CompanySlice = createSlice({
  name: "company",
  initialState: {
    newCompaniesList: [],
    loading: "",
    gstTypeList: {},
    businessTypeList: {},
    companyTypeList: [],
  },
  extraReducers: (builder) => {
    builder.addCase(getAllNewCompanies.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllNewCompanies.fulfilled, (state, action) => {
      state.loading = "success";
      state.newCompaniesList = action?.payload;
    });
    builder.addCase(getAllNewCompanies.rejected, (state) => {
      state.loading = "rejected";
      state.newCompaniesList = [];
    });

    builder.addCase(getAllGstTypeByCompanyTypeId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllGstTypeByCompanyTypeId.fulfilled, (state, action) => {
      state.gstTypeList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllGstTypeByCompanyTypeId.rejected, (state) => {
      state.loading = "rejected";
      state.gstTypeList = {};
    });

    builder.addCase(getBusinessTypeByGstTypeId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getBusinessTypeByGstTypeId.fulfilled, (state, action) => {
      state.businessTypeList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getBusinessTypeByGstTypeId.rejected, (state) => {
      state.loading = "rejected";
      state.businessTypeList = {};
    });

    builder.addCase(getAllCompanyType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllCompanyType.fulfilled, (state, action) => {
      state.companyTypeList = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllCompanyType.rejected, (state) => {
      state.loading = "rejected";
      state.companyTypeList = [];
    });
  },
});

export default CompanySlice.reducer;
