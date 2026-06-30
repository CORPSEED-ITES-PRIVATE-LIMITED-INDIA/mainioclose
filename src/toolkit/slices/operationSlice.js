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
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/user-product-mappings/list`,
      );

      return response.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Failed to fetch user product mappings",
        },
      );
    }
  },
);

export const getGroupedUserMappedWithProduct = createAsyncThunk(
  "getGroupedUserMappedWithProduct",
  async (groupBy = "user", { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/user-product-mappings/grouped`,
        {
          params: { groupBy },
        },
      );

      return response.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Failed to fetch grouped user product mappings",
        },
      );
    }
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

export const updateMileStone = createAsyncThunk(
  "updateMileStone",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/milestones/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to update milestone",
      );
    }
  },
);

export const deleteMileStone = createAsyncThunk(
  "deleteMileStone",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/operationService/api/milestones/${id}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to delete milestone",
      );
    }
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

export const updateOperationDepartment = createAsyncThunk(
  "updateOperationDepartment",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/departments/${id}`,
        payload,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to update operation department",
      );
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
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/product-milestone-maps`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const updateMilestoneInProduct = createAsyncThunk(
  "updateMilestoneInProduct",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/product-milestone-maps/${id}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const deleteMileStoneInProduct = createAsyncThunk(
  "deleteMileStoneInProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/operationService/api/product-milestone-maps/${id}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
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
  async ({ userId, page, size, statuses }) => {
    const response = await api.get(
      `/operationService/api/projects?userId=${userId}&page=${page}&size=${size}&statuses=${statuses}`,
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

export const approveOrRejectClientPortalDetails = createAsyncThunk(
  "operation/approveOrRejectClientPortalDetails",
  async ({ projectId, detailId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/projects/${projectId}/portal-details/${detailId}/approve`,
        data,
        {
          params: { userId },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to update portal status",
      );
    }
  },
);

export const updateClientPortalLoginDetails = createAsyncThunk(
  "operation/updateClientPortalLoginDetails",
  async ({ projectId, detailId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/projects/${projectId}/portal-details/${detailId}`,
        data,
        {
          params: { userId },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to update portal login details",
      );
    }
  },
);

export const deleteClientPortalLoginDetails = createAsyncThunk(
  "operation/deleteClientPortalLoginDetails",
  async ({ projectId, detailId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/operationService/api/projects/${projectId}/portal-details/${detailId}`,
        {
          params: { userId },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to delete portal login details",
      );
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

export const replaceDocumentInProjects = createAsyncThunk(
  "replaceDocumentInProjects",
  async ({ documentId, projectId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/projects/${projectId}/documents/${documentId}/replace`,
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
      return rejectWithValue(error);
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
export const getProcurementOrderByPurchaseId = createAsyncThunk(
  "getProcurementOrderByPurchaseId",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/purchase-orders/byProjectId/${projectId}`,
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch purchase orders",
      );
    }
  },
);

export const getAllLegalSupportRequestsForFilter = createAsyncThunk(
  "getAllLegalSupportRequestsForFilter",
  async ({ userId, page = 1, size = 10, status } = {}, { rejectWithValue }) => {
    try {
      const params = {
        userId: Number(userId),
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

      const response = await api.get("/operationService/api/legal-requests", {
        params,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data ||
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
        `/operationService/api/legal-requests/${id}/status`,
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

export const getServicePaymentTermBasedOnMilestone = createAsyncThunk(
  "getServicePaymentTermBasedOnMilestone",
  async (productId) => {
    const response = await api.get(
      `/operationService/api/product-milestone-maps/product/${productId}`,
    );
    return response.data;
  },
);

export const mapVendorWithProjectInOperations = createAsyncThunk(
  "mapVendorWithProjectInOperations",
  async ({ data, procurementAssignmentId }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/procurement-assignments/${procurementAssignmentId}/vendor`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message);
    }
  },
);

export const createProcurementPurchaseOrder = createAsyncThunk(
  "procurement/createPurchaseOrder",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/operationService/api/purchase-orders",
        payload,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          error?.message ||
          "Unable to create purchase order",
      );
    }
  },
);

export const createProcurementPaymentRequestByOrderId = createAsyncThunk(
  "procurement/createProcurementPaymentRequestByOrderId",
  async ({ procurementOrderId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/procurement-payment-requests/procurement-order/${procurementOrderId}`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to create procurement payment request",
      );
    }
  },
);

export const updateProcurementPaymentRequestByOrderId = createAsyncThunk(
  "procurement/updateProcurementPaymentRequestByOrderId",
  async ({ procurementOrderId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/purchase-orders/${procurementOrderId}/updateStatus`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to create procurement payment request",
      );
    }
  },
);

export const getProcurementPaymentRequestByOrderId = createAsyncThunk(
  "getProcurementPaymentRequestByOrderId",
  async ({ procurementOrderId, page, size }) => {
    const response = await api.get(
      `/operationService/api/procurement-payment-requests/byPurchaseOrderId/${procurementOrderId}?page=${page - 1}&size=${size}`,
    );
    return response.data;
  },
);

export const createLegalRequest = createAsyncThunk(
  "operation/createLegalRequest",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/operationService/api/legal-requests",
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to create legal request",
      );
    }
  },
);

export const createUserProductMapping = createAsyncThunk(
  "operation/createUserProductMapping",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/user-product-mappings`,
        payload,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  },
);

// PUT update mapping
export const updateUserProductMapping = createAsyncThunk(
  "operation/updateUserProductMapping",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/user-product-mappings/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  },
);

// DELETE mapping
export const deleteUserProductMapping = createAsyncThunk(
  "operation/deleteUserProductMapping",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/operationService/api/user-product-mappings/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  },
);
export const addVendorQuotation = createAsyncThunk(
  "addVendorQuotation",
  async ({ procurementAssignmentId, body }, { rejectWithValue }) => {
    try {
      await api.post(
        `/operationService/api/procurement-assignments/${procurementAssignmentId}/vendor-quotations`,
        body,
      );
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  },
);

export const getAllCompanyDocumentsByCompanyIdAndUnitId = createAsyncThunk(
  "getAllCompanyDocumentsByCompanyIdAndUnitId",
  async ({ companyId, companyUnitId }) => {
    try {
      const response = await api.get(
        `/operationService/api/projects/company-documents?companyId=${companyId}&companyUnitId=${companyUnitId}`,
      );
      return response.data;
    } catch (err) {
      return err;
    }
  },
);
export const getUsersByDepartment = createAsyncThunk(
  "getUsersByDepartment",
  async ({ id }) => {
    try {
      const response = await api.get(
        `/operationService/api/departments/${id}/users`,
      );
      return response.data;
    } catch (err) {
      return err;
    }
  },
);
export const getAllVendorQuotationLegalRequests = createAsyncThunk(
  "getAllVendorQuotationLegalRequests",
  async () => {
    try {
      const response = await api.get(
        `/operationService/api/vendor-quotation-legal-requests`,
      );
      return response.data;
    } catch (err) {
      return err;
    }
  },
);

export const checkDocumentExpiryByUrl = createAsyncThunk(
  "operation/checkDocumentExpiryByUrl",
  async ({ fileUrl }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/document-expiry/check-url`,
        null,
        {
          params: { fileUrl },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to check document expiry date",
      );
    }
  },
);
export const sendAgreementToProcurement = createAsyncThunk(
  "sendAgreementToProcurement",
  async ({ id, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/vendor-quotation-legal-requests/${id}/send-to-procurement?userId=${userId}`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to send agreement to procurement",
      );
    }
  },
);
export const agreementDecisionForVendorLegalRequest = createAsyncThunk(
  "agreementDecisionForVendorLegalRequest",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/vendor-quotation-legal-requests/${id}/decision`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to send milestone back for rework",
      );
    }
  },
);

export const sendBackToPreviousMilestone = createAsyncThunk(
  "operation/sendBackToPreviousMilestone",
  async ({ assignmentId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/milestone-assignments/${assignmentId}/send-back-to-previous`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to send milestone back for rework",
      );
    }
  },
);

export const getSalesProjectStatusDashboard = createAsyncThunk(
  "operation/getSalesProjectStatusDashboard",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = {
        userId: params.userId,
        salesPersonId: params.salesPersonId,
        status:
          params.status && params.status !== "ALL" ? params.status : undefined,
        search: params.search?.trim() || undefined,
        page: params.page || 1,
        size: params.size || 10,
      };

      const response = await api.get(
        "/operationService/api/projects/sales-status-dashboard",
        { params: queryParams },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to fetch sales projects",
      );
    }
  },
);

export const sendAgreementToVendor = createAsyncThunk(
  "sendAgreementToVendor",
  async ({ body, quotationId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/quotation/${quotationId}/send-agreement-to-vendor?userId=${userId}`,
        body,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to send agreement to vendor",
      );
    }
  },
);

export const createProjectReopenRequest = createAsyncThunk(
  "operation/createProjectReopenRequest",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/operationService/api/project-reopen-requests",
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to create project reopen request",
      );
    }
  },
);

export const getProjectMilestoneAssignmentOptions = createAsyncThunk(
  "operation/getProjectMilestoneAssignmentOptions",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/projects/${projectId}/milestone-assignment-options`,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to fetch milestone assignment options",
      );
    }
  },
);

export const getPendingResponsibleManagerReopenRequests = createAsyncThunk(
  "operation/getPendingResponsibleManagerReopenRequests",
  async (managerId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/project-reopen-requests/pending/responsible-manager/${managerId}`,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          "Failed to fetch responsible manager reopen requests",
      );
    }
  },
);

export const updateResponsibleManagerReopenDecision = createAsyncThunk(
  "operation/updateResponsibleManagerReopenDecision",
  async ({ requestId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/project-reopen-requests/${requestId}/responsible-manager-decision`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          "Failed to update responsible manager decision",
      );
    }
  },
);
export const sendVendorDetailsToAccounts = createAsyncThunk(
  "sendVendorDetailsToAccounts",
  async ({ finalizationId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/operationService/api/vendor-finalizations/${finalizationId}/send-to-accounts`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ||
          "Failed to Send Vendor Details to Accounts",
      );
    }
  },
);

export const startOperationChat = createAsyncThunk(
  "operationChat/startOperationChat",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/operationService/api/chats/start",
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to start chat",
      );
    }
  },
);

export const sendOperationChatMessage = createAsyncThunk(
  "operationChat/sendOperationChatMessage",
  async ({ conversationId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/chats/${conversationId}/messages`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to send chat message",
      );
    }
  },
);

export const getOperationChatMessages = createAsyncThunk(
  "operationChat/getOperationChatMessages",
  async (
    { conversationId, userId, page = 0, size = 30 },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(
        `/operationService/api/chats/${conversationId}/messages`,
        {
          params: {
            userId,
            page,
            size,
          },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch chat messages",
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
    servicePaymentTerm: [],
    procurementOrderByPurchaseIdList: [],
    procurementOrderByPurchaseIdLoading: false,
    procurementOrderByPurchaseIdError: null,
    paymentRequestByPoId: {},
    compnyDocumentListByCompanyIdAndUnitId: [],
    departmentUsers: [],
    vendorLegalRequests: [],
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
      state.userProductMappingLoading = "pending";
    });

    builder.addCase(getAllUserMappedWithProduct.fulfilled, (state, action) => {
      state.userProductMappingLoading = "success";
      state.userMappedWithProductList = action?.payload || [];
    });

    builder.addCase(getAllUserMappedWithProduct.rejected, (state) => {
      state.userProductMappingLoading = "rejected";
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
      state.mileStoneEventHistory = {};
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

    builder.addCase(getServicePaymentTermBasedOnMilestone.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getServicePaymentTermBasedOnMilestone.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.servicePaymentTerm = action.payload;
      },
    );
    builder.addCase(getServicePaymentTermBasedOnMilestone.rejected, (state) => {
      state.loading = "rejected";
      state.servicePaymentTerm = [];
    });

    builder.addCase(getProcurementOrderByPurchaseId.pending, (state) => {
      state.procurementOrderByPurchaseIdLoading = true;
      state.procurementOrderByPurchaseIdError = null;
    });
    builder.addCase(
      getProcurementOrderByPurchaseId.fulfilled,
      (state, action) => {
        state.procurementOrderByPurchaseIdLoading = false;
        state.procurementOrderByPurchaseIdList = action.payload;
      },
    );
    builder.addCase(
      getProcurementOrderByPurchaseId.rejected,
      (state, action) => {
        state.procurementOrderByPurchaseIdLoading = false;
        state.procurementOrderByPurchaseIdError = action.payload;
      },
    );

    builder.addCase(getProcurementPaymentRequestByOrderId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getProcurementPaymentRequestByOrderId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.paymentRequestByPoId = action.payload;
      },
    );
    builder.addCase(
      getProcurementPaymentRequestByOrderId.rejected,
      (state, action) => {
        state.loading = "rejected";
      },
    );

    builder.addCase(
      getAllCompanyDocumentsByCompanyIdAndUnitId.pending,
      (state) => {
        state.loading = "pending";
      },
    );
    builder.addCase(
      getAllCompanyDocumentsByCompanyIdAndUnitId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.compnyDocumentListByCompanyIdAndUnitId = action.payload;
      },
    );
    builder.addCase(
      getAllCompanyDocumentsByCompanyIdAndUnitId.rejected,
      (state, action) => {
        state.loading = "rejected";
      },
    );
    builder.addCase(getUsersByDepartment.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getUsersByDepartment.fulfilled, (state, action) => {
      state.loading = "success";
      state.departmentUsers = action.payload;
    });
    builder.addCase(getUsersByDepartment.rejected, (state, action) => {
      state.loading = "rejected";
    });
    builder.addCase(getAllVendorQuotationLegalRequests.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllVendorQuotationLegalRequests.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.vendorLegalRequests = action.payload;
      },
    );
    builder.addCase(
      getAllVendorQuotationLegalRequests.rejected,
      (state, action) => {
        state.loading = "rejected";
      },
    );
  },
});

export default OperationSlice.reducer;
