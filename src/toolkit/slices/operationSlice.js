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

export const createMileStone = createAsyncThunk(
  "createMileStone",
  async (data) => {
    const response = await api.post(`/api/milestones`, data);
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
  async ({ projectId, userId }) => {
    const response = await api.get(
      `/api/projects/${projectId}/milestones?userId=${userId}`
    );
    return response.data;
  }
);

export const getRequiredDocumentsByProductId = createAsyncThunk(
  "getRequiredDocumentsByProductId",
  async ({ userId, productId, projectId }) => {
    const response = await api.get(
      `/api/required-documents/project/${projectId}/product/${productId}?userId=${userId}`
    );
    return response.data;
  }
);

export const updateMilestoneAssignment = createAsyncThunk(
  "updateMilestoneAssignment",
  async (assignmentId) => {
    const response = await api.put(
      `/api/milestone-assignments/${assignmentId}/status`
    );
    return response.data;
  }
);

export const updateMilestoneReAssignment = createAsyncThunk(
  "updateMilestoneReAssignment",
  async (assignmentId) => {
    const response = await api.put(
      `/api/milestone-assignments/${assignmentId}/reassign`
    );
    return response.data;
  }
);

export const createDepartmentInOPerations = createAsyncThunk(
  "createDepartmentInOPerations",
  async (data) => {
    const response = await api.post(`/api/departments`, data);
    return response.data;
  }
);

export const getProductMileStonesListByProductId = createAsyncThunk(
  "productMileStonesListByProductId",
  async ({ userId, productId }) => {
    const response = await api.get(
      `/api/product-milestone-maps/user/${userId}/product/${productId}`
    );
    return response.data;
  }
);

export const addMileStoneInProduct = createAsyncThunk(
  "addMileStoneInProduct",
  async (data) => {
    const response = await api.post(`/api/product-milestone-maps`, data);
    return response.data;
  }
);

export const updateMilestoneInProduct = createAsyncThunk(
  "updateMilestoneInProduct",
  async ({ id, data }) => {
    const response = await api.put(`/api/product-milestone-maps/${id}`, data);
    return response.data;
  }
);

export const deleteMileStoneInProduct = createAsyncThunk(
  "deleteMileStoneInProduct",
  async (id) => {
    const response = await api.delete(`/api/product-milestone-maps/${id}`);
    return response.data;
  }
);

export const createProjectsForOperations = createAsyncThunk(
  "createProjectsForOperations",
  async (data) => {
    const response = await api.post(`/api/projects`, data);
    return response.data;
  }
);

export const getAllProjectsForOperations = createAsyncThunk(
  "getAllProjectsForOperations",
  async ({ userId, page, size }) => {
    const response = await api.get(
      `/api/projects?userId=${userId}&page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const updateAssigneeForMileStone = createAsyncThunk(
  "updateAssigneeForMileStone",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/api/milestone-assignments/${data?.assignmentId}/reassign`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const updateAssignmentStatusForMileStone = createAsyncThunk(
  "updateAssignmentStatusForMileStone",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/api/milestone-assignments/${data?.assignmentId}/status`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const getDepartments = createAsyncThunk(
  "getDepartments",
  async ({ page, size }) => {
    const response = await api.get(
      `/api/departments?page=${page}&size=${size}`
    );
    return response.data;
  }
);

export const getDepartmentAutoConfig = createAsyncThunk(
  "getDepartmentAutoConfig",
  async (id) => {
    const response = await api.get(`/api/department-auto-config/${id}`);
    return response.data;
  }
);

export const updateDepartmentAutoConfig = createAsyncThunk(
  "updateDepartmentAutoConfig",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/department-auto-config/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const OperationSlice = createSlice({
  name: "operation",
  initialState: {
    loading: "",
    operationProjectList: [],
    userMappedWithProductList: [],
    mileStoneList: [],
    operationProjectDetail: [],
    requiredDoucmentListOfProduct: [],
    productMileStoneList: [],
    projectListForOperation: [],
    departmentsList: [],
    departmentAutoConfig: null,
    updatedDepartmentConfig: null,
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
    builder.addCase(
      getOperationProjectDetailById.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.operationProjectDetail = action?.payload;
      }
    );
    builder.addCase(getOperationProjectDetailById.rejected, (state) => {
      state.loading = "rejected";
      state.operationProjectDetail = [];
    });

    builder.addCase(getRequiredDocumentsByProductId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getRequiredDocumentsByProductId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.requiredDoucmentListOfProduct = action?.payload;
      }
    );
    builder.addCase(getRequiredDocumentsByProductId.rejected, (state) => {
      state.loading = "rejected";
      state.requiredDoucmentListOfProduct = [];
    });

    builder.addCase(getProductMileStonesListByProductId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getProductMileStonesListByProductId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.productMileStoneList = action?.payload;
      }
    );
    builder.addCase(getProductMileStonesListByProductId.rejected, (state) => {
      state.loading = "rejected";
      state.productMileStoneList = [];
    });

    builder.addCase(getAllProjectsForOperations.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllProjectsForOperations.fulfilled, (state, action) => {
      state.loading = "success";
      state.projectListForOperation = action?.payload;
    });
    builder.addCase(getAllProjectsForOperations.rejected, (state) => {
      state.loading = "rejected";
      state.projectListForOperation = [];
    });

    builder.addCase(getDepartments.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getDepartments.fulfilled, (state, action) => {
      state.loading = "success";
      state.departmentsList = action.payload;
    });
    builder.addCase(getDepartments.rejected, (state) => {
      state.loading = "rejected";
      state.departmentsList = [];
    });

    //new - get Departments auto-config
    builder.addCase(getDepartmentAutoConfig.pending, (state) => {
      state.loading = "pending";
    });

    builder.addCase(getDepartmentAutoConfig.fulfilled, (state, action) => {
      state.loading = "success";
      state.departmentAutoConfig = action.payload;
    });

    builder.addCase(getDepartmentAutoConfig.rejected, (state) => {
      state.loading = "rejected";
      state.departmentAutoConfig = null;
    });

    // UPDATE department auto-config
    builder.addCase(updateDepartmentAutoConfig.pending, (state) => {
      state.loading = "pending";
      state.updatedDepartmentConfig = null;
    });

    builder.addCase(updateDepartmentAutoConfig.fulfilled, (state, action) => {
      state.loading = "success";
      state.updatedDepartmentConfig = action.payload;
    });

    builder.addCase(updateDepartmentAutoConfig.rejected, (state) => {
      state.loading = "rejected";
      state.updatedDepartmentConfig = null;
    });
  },
});

export default OperationSlice.reducer;
