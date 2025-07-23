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

const CompanySlice = createSlice({
  name: "company",
  initialState: {
    newCompaniesList: [],
    loading: "",
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
  },
});

export default CompanySlice.reducer;
