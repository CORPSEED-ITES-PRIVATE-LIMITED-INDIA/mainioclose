import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const createCompanyInOperations = createAsyncThunk(
  "createCompanyInOperations",
  async (data) => {
    const response = await api.post(`/api/companies`, data);
    return response.data;
  }
);

export const updateCompanyInOperations = createAsyncThunk(
  "updateCompanyInOperations",
  async (data) => {
    const response = await api.put(`/api/companies/${data?.companyId}`, data);
    return response.data;
  }
);

export const getAllOperationsProject = createAsyncThunk(
  "getAllOperationsProject",
  async ({ userId, page, size }) => {
    const response = await api.get(
      `/api/projects/my-projects?userId=${userId}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getAllUserMappedWithProduct = createAsyncThunk(
  "getAllUserMappedWithProduct",
  async () => {
    const response = await api.get(`/api/user-product-mappings/list`);
    return response.data;
  }
);

export const mappedUserWithProductForOperation = createAsyncThunk(
  "mappedUserWithProductForOperation",
  async (data) => {
    const response = await api.post(`/api/user-product-mappings`, data);
    return response.data;
  }
);

export const getAllMilestones = createAsyncThunk(
  "getAllMilestones",
  async () => {
    const response = await api.get(`/api/milestones`);
    return response.data;
  }
);

export const createUsersInOperations = createAsyncThunk(
  "createUsersInOperations",
  async (data) => {
    const response = await api.post(`/api/users`, data);
    return response.data;
  }
);

export const addProductsInOperations = createAsyncThunk(
  "addProductsInOperations",
  async (data) => {
    const response = await api.post(`/api/products`, data);
    return response.data;
  }
);

export const addDocumentsInProductsForOperation = createAsyncThunk(
  "addDocumentsInProductsForOperation",
  async (data) => {
    const response = await api.post(`/api/required-documents`, data);
    return response.data;
  }
);

export const getOperationProjectDetailById = createAsyncThunk(
  "getOperationProjectDetailById",
  async ({projectId,userId}) => {
    const response = await api.get(`/api/projects/${projectId}/milestones?userId=${userId}`);
    return response.data;
  }
);

const OperationSlice = createSlice({
  name: "operation",
  initialState: {
    loading: "",
    operationProjectList: [],
    userMappedWithProductList: [],
    mileStoneList: [],
    operationProjectDetail:[]
  },
  extraReducers: (builder) => {
    builder.addCase(getAllOperationsProject.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllOperationsProject.fulfilled, (state, action) => {
      state.loading = "success";
      state.operationProjectList = action?.payload;
    });
    builder.addCase(getAllOperationsProject.rejected, (state) => {
      state.loading = "rejected";
      state.operationProjectList = [];
    });

    builder.addCase(getAllUserMappedWithProduct.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllUserMappedWithProduct.fulfilled, (state, action) => {
      state.loading = "success";
      state.userMappedWithProductList = action?.payload;
    });
    builder.addCase(getAllUserMappedWithProduct.rejected, (state) => {
      state.loading = "rejected";
      state.userMappedWithProductList = [];
    });

    builder.addCase(getAllMilestones.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllMilestones.fulfilled, (state, action) => {
      state.loading = "success";
      state.mileStoneList = action?.payload;
    });
    builder.addCase(getAllMilestones.rejected, (state) => {
      state.loading = "rejected";
      state.mileStoneList = [];
    });

    builder.addCase(getOperationProjectDetailById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getOperationProjectDetailById.fulfilled, (state, action) => {
      state.loading = "success";
      state.operationProjectDetail = action?.payload;
    });
    builder.addCase(getOperationProjectDetailById.rejected, (state) => {
      state.loading = "rejected";
      state.operationProjectDetail = [];
    });
  },
});

export default OperationSlice.reducer;
