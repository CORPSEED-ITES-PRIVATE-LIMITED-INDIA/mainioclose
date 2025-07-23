import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getAllSlugList = createAsyncThunk("getSlugList", async () => {
  const response = await api.get(`/leadService/api/v1/slug/getAllSlug`);
  return response.data;
});

export const getAllComments = createAsyncThunk("getAllComments", async () => {
  const response = await api.get(`/leadService/api/v1/lead/getAllComments`);
  return response.data;
});

export const SettingSlice = createSlice({
  name: "auth",
  initialState: {
    slugList: [],
    loading: "",
    allComments: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllSlugList.pending, (state) => {
      state.loading = "pending";
      state.slugList = [];
    });
    builder.addCase(getAllSlugList.fulfilled, (state, action) => {
      state.loading = "success";
      state.slugList = action.payload;
    });
    builder.addCase(getAllSlugList.rejected, (state) => {
      state.loading = "rejected";
      state.slugList = [];
    });

    builder.addCase(getAllComments.pending, (state) => {
      state.loading = "pending";
      state.allComments = [];
    });
    builder.addCase(getAllComments.fulfilled, (state, action) => {
      state.allComments = action.payload;
      state.loading = "success";
    });
    builder.addCase(getAllComments.rejected, (state) => {
      state.loading = "rejected";
      state.allComments = [];
    });
  },
});

export default SettingSlice.reducer;
