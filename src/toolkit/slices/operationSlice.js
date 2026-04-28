import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";
import exp from "constants";

export const createCompanyInOperations = createAsyncThunk(
  "createCompanyInOperations",
  async (data) => {
    const response = await api.post(`/operationService/api/companies`, data);
    return response.data;
  },
);

export const updateCompanyInOperations = createAsyncThunk(
  "updateCompanyInOperations",
  async (data) => {
    const response = await api.put(
      `/operationService/api/companies/${data?.companyId}`,
      data,
    );
    return response.data;
  },
);

export const getAllOperationsProject = createAsyncThunk(
  "getAllOperationsProject",
  async ({ userId, page, size }) => {
    const response = await api.get(
      `/operationService/api/projects/my-projects?userId=${userId}&page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getAllUserMappedWithProduct = createAsyncThunk(
  "getAllUserMappedWithProduct",
  async () => {
    const response = await api.get(
      `/operationService/api/user-product-mappings/list`,
    );
    return response.data;
  },
);

export const mappedUserWithProductForOperation = createAsyncThunk(
  "mappedUserWithProductForOperation",
  async (data) => {
    const response = await api.post(
      `/operationService/api/user-product-mappings`,
      data,
    );
    return response.data;
  },
);

export const getAllMilestones = createAsyncThunk(
  "getAllMilestones",
  async () => {
    const response = await api.get(`/operationService/api/milestones`);
    return response.data;
  },
);

export const createMileStone = createAsyncThunk(
  "createMileStone",
  async (data) => {
    const response = await api.post(`/operationService/api/milestones`, data);
    return response.data;
  },
);

export const createUsersInOperations = createAsyncThunk(
  "createUsersInOperations",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(`/operationService/api/users`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const updateUsersInOperations = createAsyncThunk(
  "updateUsersInOperations",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/operationService/api/users/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const addProductsInOperations = createAsyncThunk(
  "addProductsInOperations",
  async (data) => {
    const response = await api.post(`/operationService/api/products`, data);
    return response.data;
  },
);

export const updateProductsInOperations = createAsyncThunk(
  "addProductsInOperations",
  async ({ id, data }) => {
    const response = await api.put(
      `/operationService/api/products/${id}`,
      data,
    );
    return response.data;
  },
);

export const addDocumentsInProductsForOperation = createAsyncThunk(
  "addDocumentsInProductsForOperation",
  async (data) => {
    const response = await api.post(
      `/operationService/api/required-documents`,
      data,
    );
    return response.data;
  },
);

export const getOperationProjectDetailById = createAsyncThunk(
  "getOperationProjectDetailById",
  async ({ projectId, userId }) => {
    const response = await api.get(
      `/operationService/api/projects/${projectId}/milestones?userId=${userId}`,
    );
    return response.data;
  },
);

export const getRequiredDocumentsByProductId = createAsyncThunk(
  "getRequiredDocumentsByProductId",
  async ({ userId, projectId }) => {
    const response = await api.get(
      `/operationService/api/projects/${projectId}/document-checklist?userId=${userId}`,
    );
    return response.data;
  },
);

export const updateMilestoneAssignment = createAsyncThunk(
  "updateMilestoneAssignment",
  async (assignmentId) => {
    const response = await api.put(
      `/operationService/api/milestone-assignments/${assignmentId}/status`,
    );
    return response.data;
  },
);

export const updateMilestoneReAssignment = createAsyncThunk(
  "updateMilestoneReAssignment",
  async (assignmentId) => {
    const response = await api.put(
      `/operationService/api/milestone-assignments/${assignmentId}/reassign`,
    );
    return response.data;
  },
);

export const createDepartmentInOPerations = createAsyncThunk(
  "createDepartmentInOPerations",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/departments`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const createDesignationInOPerations = createAsyncThunk(
  "createDesignationInOPerations",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/designations/createDesignationName?id=${data.id}&name=${data.name}&weightValue=${data.weightValue}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const updateDesignationInOPerations = createAsyncThunk(
  "updateDesignationInOPerations",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/designations/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const getProductMileStonesListByProductId = createAsyncThunk(
  "productMileStonesListByProductId",
  async ({ userId, productId }) => {
    const response = await api.get(
      `/operationService/api/product-milestone-maps/user/${userId}/product/${productId}`,
    );
    return response.data;
  },
);

export const addMileStoneInProduct = createAsyncThunk(
  "addMileStoneInProduct",
  async (data) => {
    const response = await api.post(
      `/operationService/api/product-milestone-maps`,
      data,
    );
    return response.data;
  },
);

export const updateMilestoneInProduct = createAsyncThunk(
  "updateMilestoneInProduct",
  async ({ id, data }) => {
    const response = await api.put(
      `/operationService/api/product-milestone-maps/${id}`,
      data,
    );
    return response.data;
  },
);

export const deleteMileStoneInProduct = createAsyncThunk(
  "deleteMileStoneInProduct",
  async (id) => {
    const response = await api.delete(
      `/operationService/api/product-milestone-maps/${id}`,
    );
    return response.data;
  },
);

export const createProjectsForOperations = createAsyncThunk(
  "createProjectsForOperations",
  async (data) => {
    const response = await api.post(`/operationService/api/projects`, data);
    return response.data;
  },
);

export const getAllProjectsForOperations = createAsyncThunk(
  "getAllProjectsForOperations",
  async ({ userId, page, size }) => {
    const response = await api.get(
      `/operationService/api/projects?userId=${userId}&page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getTotalCountForOperationProjects = createAsyncThunk(
  "getTotalCountForOperationProjects",
  async (userId) => {
    const response = await api.get(
      `/operationService/api/projects/count?userId=${userId}`,
    );
    return response.data;
  },
);

export const searchByCompany = createAsyncThunk(
  "searchByCompany",
  async ({ companyName, userId }) => {
    const response = await api.get(
      `/operationService/api/projects/search/by-company?companyName=${companyName}&userId=${userId}`,
    );
    return response.data;
  },
);

export const searchByProjectNumber = createAsyncThunk(
  "searchByProjectNumber",
  async ({ projectNumber, userId }) => {
    const response = await api.get(
      `/operationService/api/projects/search/by-project-number?projectNumber=${projectNumber}&userId=${userId}`,
    );
    return response.data;
  },
);

export const searchByProjectName = createAsyncThunk(
  "searchByProjectName",
  async ({ projectName, userId }) => {
    const response = await api.get(
      `/operationService/api/projects/search/by-project-name?projectName=${projectName}&userId=${userId}`,
    );
    return response.data;
  },
);

export const searchByContactName = createAsyncThunk(
  "searchByContactName",
  async ({ contactName, userId }) => {
    const response = await api.get(
      `/operationService/api/projects/search/by-contact-name?contactName=${contactName}&userId=${userId}`,
    );
    return response.data;
  },
);

export const updateAssigneeForMileStone = createAsyncThunk(
  "updateAssigneeForMileStone",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/milestone-assignments/${data?.assignmentId}/reassign`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const updateAssignmentStatusForMileStone = createAsyncThunk(
  "updateAssignmentStatusForMileStone",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/milestone-assignments/${data?.assignmentId}/status`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const getDepartments = createAsyncThunk(
  "getDepartments",
  async ({ page, size }) => {
    const response = await api.get(
      `/operationService/api/departments?page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getDepartmentAutoConfig = createAsyncThunk(
  "getDepartmentAutoConfig",
  async (id) => {
    const response = await api.get(
      `/operationService/api/department-auto-config/${id}`,
    );
    return response.data;
  },
);

export const updateDepartmentAutoConfig = createAsyncThunk(
  "updateDepartmentAutoConfig",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/department-auto-config/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const addClientLogInCredentialForPortal = createAsyncThunk(
  "addClientLogInCredentialForPortal",
  async ({ projectId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/projects/${projectId}/portal-details?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getClientLogInCredentialDetailForPortal = createAsyncThunk(
  "getClientLogInCredentialDetailForPortal",
  async ({ projectId, userId }) => {
    try {
      const response = await api.get(
        `/operationService/api/projects/${projectId}/portal-details?userId=${userId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getHistoryByMileStoneIdAndProjectId = createAsyncThunk(
  "getHistoryByMileStoneIdAndProjectId",
  async ({ milestoneId, projectId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/projects/${projectId}/milestones/${milestoneId}/history?userId=${userId}`,
      );
      return response.data;
    } catch (error) {
      rejectWithValue(error?.response.data?.message);
    }
  },
);

export const uploadProjectsDocument = createAsyncThunk(
  "uploadProjectsDocument",
  async ({ projectId, milestoneAssignmentId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/projects/${projectId}/milestones/${milestoneAssignmentId}/documents`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const updateApplicantTypeInProject = createAsyncThunk(
  "updateApplicantTypeInProject",
  async ({ projectId, applicantTypeId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/operationService/api/projects/${projectId}/applicant-type?applicantTypeId=${applicantTypeId}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const uploadDocumentInProjects = createAsyncThunk(
  "uploadDocumentInProjects",
  async ({ projectId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/projects/${projectId}/milestones/documents`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const updateDocumentStatus = createAsyncThunk(
  "operation/updateDocumentStatus",
  async ({ documentId, data }) => {
    const response = await api.put(
      `/operationService/api/projects/documents/${documentId}/status`,
      data,
    );
    return response.data;
  },
);

export const addNoteInProject = createAsyncThunk(
  "addNoteInProject",
  async ({ projectId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/projects/${projectId}/activities/notes`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const addCommentInProject = createAsyncThunk(
  "addCommentInProject",
  async ({ projectId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/projects/${projectId}/activities/comments`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const addExpensesInProject = createAsyncThunk(
  "addExpensesInProject",
  async ({ projectId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/projects/expenses?projectId=${projectId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const getActivitiesByProjectId = createAsyncThunk(
  "getActivitiesByProjectId",
  async ({ projectId, page, size }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/projects/${projectId}/activities?page=${page}&size=${size}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const getActivitiesByTypeAndProjectId = createAsyncThunk(
  "getActivitiesByTypeAndProjectId",
  async ({ projectId, type, page, size }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/projects/${projectId}/activities/type/${type}?page=${page}&size=${size}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const getActivitiesByDateRangeAndProjectId = createAsyncThunk(
  "getActivitiesByDateRangeAndProjectId",
  async (
    { projectId, page, size, startDate, endDate },
    { rejectWithValue },
  ) => {
    try {
      let url = `/operationService/api/projects/${projectId}/activities/date-range?page=${page}&size=${size}`;
      if (startDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const importServiceCheckListDocument = createAsyncThunk(
  "importServiceCheckListDocument",
  async ({ fileUrl, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/product-required-documents/import-required-document?s3Url=${fileUrl}&createdBy=${userId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const cancelProjectByUnbilledNumberInOperations = createAsyncThunk(
  "cancelProjectByUnbilledNumberInOperations",
  async (unbilledNumber, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/projects/cancel/${unbilledNumber}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const getExpenseListByUserId = createAsyncThunk(
  "getExpenseListByUserId",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/projects/expenses/getExpensesList?userId=${userId}&approvalStatus=${status}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response);
    }
  },
);

export const approvedAndDisapprovedExpense = createAsyncThunk(
  "approvedAndDisapprovedExpense",
  async ({ projectId, userId, expenseId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/projects/expenses/approve?projectId=${projectId}&userId=${userId}&expenseId=${expenseId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const mapDesignationWithDepartmentInOperations = createAsyncThunk(
  "mapDesignationWithDepartmentInOperations",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/designations/map-to-department`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const createLegalSuportRequest = createAsyncThunk(
  "createLegalSuportRequest",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/legal-request/create`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const getAllLegalSupportRequestsForFilter = createAsyncThunk(
  "getAllLegalSupportRequestsForFilter",
  async (
    {
      page,
      size,
      status,
      projectId,
      assignedTo,
      createdBy,
      projectName,
      milestoneName,
      startDate,
      endDate,
    },
    { rejectWithValue },
  ) => {
    try {
      const params = {
        page,
        size,
      };

      if (
        status !== undefined &&
        status !== null &&
        status !== "" &&
        status !== "ALL"
      ) {
        params.status = status;
      }

      if (projectId !== undefined && projectId !== null && projectId !== "") {
        params.projectId = projectId;
      }

      if (
        assignedTo !== undefined &&
        assignedTo !== null &&
        assignedTo !== ""
      ) {
        params.assignedTo = assignedTo;
      }

      if (createdBy !== undefined && createdBy !== null && createdBy !== "") {
        params.createdBy = createdBy;
      }

      if (projectName?.trim()) {
        params.projectName = projectName.trim();
      }

      if (milestoneName?.trim()) {
        params.milestoneName = milestoneName.trim();
      }

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      const response = await api.get(
        "/operationService/api/legal-request/AllFilter",
        { params },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch legal support requests",
      );
    }
  },
);

export const updateLegalRequestStatus = createAsyncThunk(
  "updateLegalRequestStatus",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/operationService/api/legal-request/${id}/status`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to update legal request status",
      );
    }
  },
);

export const OperationSlice = createSlice({
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
    clientLoginCredential: {},
    mileStoneEventHistory: {},
    projectCount: 0,
    activitiesByProjectId: {},
    expenseList: [],
    legalRequestList: [],
    legalRequestCount: 0,
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
      },
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
      },
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
      },
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

    builder.addCase(getTotalCountForOperationProjects.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getTotalCountForOperationProjects.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.projectCount = action?.payload;
      },
    );
    builder.addCase(getTotalCountForOperationProjects.rejected, (state) => {
      state.loading = "rejected";
      state.projectCount = 0;
    });

    builder.addCase(searchByCompany.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchByCompany.fulfilled, (state, action) => {
      state.loading = "success";
      state.projectListForOperation = action?.payload;
    });
    builder.addCase(searchByCompany.rejected, (state) => {
      state.loading = "rejected";
      state.projectListForOperation = [];
    });

    builder.addCase(searchByContactName.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchByContactName.fulfilled, (state, action) => {
      state.loading = "success";
      state.projectListForOperation = action?.payload;
    });
    builder.addCase(searchByContactName.rejected, (state) => {
      state.loading = "rejected";
      state.projectListForOperation = [];
    });

    builder.addCase(searchByProjectName.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchByProjectName.fulfilled, (state, action) => {
      state.loading = "success";
      state.projectListForOperation = action?.payload;
    });
    builder.addCase(searchByProjectName.rejected, (state) => {
      state.loading = "rejected";
      state.projectListForOperation = [];
    });

    builder.addCase(searchByProjectNumber.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchByProjectNumber.fulfilled, (state, action) => {
      state.loading = "success";
      state.projectListForOperation = action?.payload;
    });
    builder.addCase(searchByProjectNumber.rejected, (state) => {
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

    builder.addCase(
      getClientLogInCredentialDetailForPortal.pending,
      (state) => {
        state.loading = "pending";
      },
    );
    builder.addCase(
      getClientLogInCredentialDetailForPortal.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.clientLoginCredential = action.payload;
      },
    );
    builder.addCase(
      getClientLogInCredentialDetailForPortal.rejected,
      (state) => {
        state.loading = "rejected";
        state.clientLoginCredential = {};
      },
    );

    builder.addCase(getHistoryByMileStoneIdAndProjectId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getHistoryByMileStoneIdAndProjectId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.mileStoneEventHistory = action.payload;
      },
    );
    builder.addCase(getHistoryByMileStoneIdAndProjectId.rejected, (state) => {
      state.loading = "rejected";
      state.mileStoneEventHistory = {};
    });

    builder.addCase(getActivitiesByProjectId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getActivitiesByProjectId.fulfilled, (state, action) => {
      state.loading = "success";
      state.activitiesByProjectId = action.payload;
    });
    builder.addCase(getActivitiesByProjectId.rejected, (state) => {
      state.loading = "rejected";
      state.activitiesByProjectId = {};
    });

    builder.addCase(getActivitiesByTypeAndProjectId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getActivitiesByTypeAndProjectId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.activitiesByProjectId = action.payload;
      },
    );
    builder.addCase(getActivitiesByTypeAndProjectId.rejected, (state) => {
      state.loading = "rejected";
      state.activitiesByProjectId = {};
    });

    builder.addCase(getActivitiesByDateRangeAndProjectId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getActivitiesByDateRangeAndProjectId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.activitiesByProjectId = action.payload;
      },
    );
    builder.addCase(getActivitiesByDateRangeAndProjectId.rejected, (state) => {
      state.loading = "rejected";
      state.activitiesByProjectId = {};
    });

    builder.addCase(getExpenseListByUserId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getExpenseListByUserId.fulfilled, (state, action) => {
      state.loading = "success";
      state.expenseList = action.payload;
    });
    builder.addCase(getExpenseListByUserId.rejected, (state) => {
      state.loading = "rejected";
      state.expenseList = [];
    });

    builder.addCase(getAllLegalSupportRequestsForFilter.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllLegalSupportRequestsForFilter.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.legalRequestList = action.payload?.content;
        state.legalRequestCount = action.payload?.totalElements;
      },
    );
    builder.addCase(getAllLegalSupportRequestsForFilter.rejected, (state) => {
      state.loading = "rejected";
      state.legalRequestList = [];
    });
  },
});

export default OperationSlice.reducer;
