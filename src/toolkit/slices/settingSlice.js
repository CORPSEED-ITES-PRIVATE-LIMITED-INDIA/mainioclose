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

export const createComments = createAsyncThunk(
  "createComments",
  async (data) => {
    const respose = await api.post(
      `/leadService/api/v1/lead/createComment?comment=${data?.comment}`,
    );
    return respose.data;
  },
);

export const deleteComments = createAsyncThunk("deletecomments", async (id) => {
  const response = await api.delete(
    `/leadService/api/v1/lead/deleteComments?id=${id}`,
  );
  return response.data;
});

export const updateComments = createAsyncThunk(
  "updateComments",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/lead/updateComments?id=${data?.id}&comment=${data?.comment}`,
    );
    return response.data;
  },
);

export const getAllStatusData = createAsyncThunk(
  "getAllStatusData",
  async () => {
    const response = await api.get(`/leadService/api/v1/status/getAllStatus`);
    return response.data;
  },
);

export const createLeadStatus = createAsyncThunk(
  "createLead",
  async (createStatus) => {
    const response = await api.post(
      `/leadService/api/v1/status/CreateLeadStatus`,
      createStatus,
    );
    return response.data;
  },
);

export const editLeadStatus = createAsyncThunk(
  "editLeadStatus",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/status/updateInLeadStatus`,
      data,
    );
    return response.data;
  },
);

export const deleteLeadStatus = createAsyncThunk(
  "deleteLeadStatus",
  async (statusId) => {
    const response = await api.delete(
      `/leadService/api/v1/status/deleteStaus?id=${statusId}`,
    );
    return response.data;
  },
);

export const getAllProductListByType = createAsyncThunk(
  "getAllProductListByType",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/product/getAllProductList?page=${data?.page}&size=${data?.size}&type=${data?.type}`,
    );
    return response.data;
  },
);

export const searchSolutionsByName = createAsyncThunk(
  "searchSolutionsByName",
  async ({ name, page, size, userId }) => {
    const response = await api.get(
      `/leadService/api/v1/searchSolutionByName?name=${name}&page=${page}&size=${size}&userId=${userId}`,
    );
    return response.data;
  },
);

export const getAllProductListCount = createAsyncThunk(
  "getAllProductListCount",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/product/getAllProductListCount?type=${data?.type}`,
    );
    return response.data;
  },
);

export const createProduct = createAsyncThunk("createProduct", async (data) => {
  const response = await api.post(
    `/leadService/api/v1/product/createProduct`,
    data,
  );
  return response.data;
});

export const createBusinessArrangement = createAsyncThunk(
  "createBusinessArrangement",
  async ({ solutionId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/leadService/api/v1/product-solutions/${solutionId}/tiers?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const updateBusinessArrangement = createAsyncThunk(
  "updateBusinessArrangement",
  async ({ solutionId, tierId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/leadService/api/v1/product-solutions/${solutionId}/tiers/${tierId}?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const deleteBusinessArrangement = createAsyncThunk(
  "deleteBusinessArrangement",
  async ({ solutionId, tierId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/leadService/api/v1/product-solutions/${solutionId}/tiers/${tierId}?userId=${userId}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const deleteProduct = createAsyncThunk("deleteProduct", async (data) => {
  const response = await api.put(
    `/leadService/api/v1/lead/deleteProductInLead?leadId=${data?.leadid}&serviceId=${data?.serviceId}&userId=${data?.userid}`,
  );
  return response.data;
});

export const getSingleProductByProductId = createAsyncThunk(
  "getSingleProductByProductId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/product/getProduct?id=${id}`,
    );
    return response.data;
  },
);

export const getAllIpAddress = createAsyncThunk("allIpAddress", async () => {
  const response = await api.get(`/securityService/api/auth/getAllIpAddress`);
  return response.data;
});

export const addIpAddress = createAsyncThunk("addIpAddress", async (data) => {
  const response = await api.post(
    `/securityService/api/auth/addIpAddress?ipAddressName=${data?.ipaddress}`,
  );
  return response.data;
});

export const addAmountForProduct = createAsyncThunk(
  "addAmountForProduct",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/product/addAmountInProduct`,
      data,
    );
    return response.data;
  },
);

export const updatePriceInServiceTypeSolution = createAsyncThunk(
  "updatePriceInServiceTypeSolution",
  async ({ userId, solutionId, feeId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/leadService/api/v1/service-solutions/${solutionId}/fees/${feeId}?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const addPriceInServiceTypeSolution = createAsyncThunk(
  "addPriceInServiceTypeSolution",
  async ({ userId, solutionId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/leadService/api/v1/service-solutions/${solutionId}/fees?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const deletePriceServiceTypeSolution = createAsyncThunk(
  "deletePriceServiceTypeSolution",
  async ({ solutionId, feeId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/leadService/api/v1/service-solutions/${solutionId}/fees/${feeId}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const addDocsInProduct = createAsyncThunk(
  "addDocsInProduct",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/product/addProductDocumentsInProduct`,
      data,
    );
    return response.data;
  },
);

export const addSalesTatInProduct = createAsyncThunk(
  "addSalesTATInProduct",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/product/addSalesTat`,
      data,
    );
    return response.data;
  },
);

export const getAllSalesTatInProduct = createAsyncThunk(
  "getAllSalesTatInProduct",
  async (productId) => {
    const response = await api.get(
      `/leadService/api/v1/product/getAllSalesTat?productId=${productId}`,
    );
    return response.data;
  },
);

export const importProductAmountDoument = createAsyncThunk(
  "importProductAmountDoument",
  async (s3Url) => {
    const response = await api.post(
      `/leadService/api/v1/import-product-amount-csv-from-s3?s3Url=${s3Url}`,
    );
    return response.data;
  },
);

export const importProductCheckListDoument = createAsyncThunk(
  "importProductCheckListDoument",
  async (s3Url) => {
    const response = await api.post(
      `/leadService/api/v1/import-product-checklist-doc-csv-from-s3?s3Url=${s3Url}`,
    );
    return response.data;
  },
);

export const getClientDesiginationList = createAsyncThunk(
  "getClientDesiginationList",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/clientDesignation/getAllClientDesignation`,
    );
    return response.data;
  },
);

export const createSlug = createAsyncThunk("createSlug", async (data) => {
  const response = await api.post(
    `/leadService/api/v1/slug/createSlug?name=${data?.name}`,
  );
  return response.data;
});

export const editSulg = createAsyncThunk("editSlug", async (data) => {
  const response = await api.put(
    `/leadService/api/v1/slug/updateSlug?name=${data?.name}&id=${data?.id}`,
  );
  return response.data;
});

export const getAllSlugs = createAsyncThunk(
  "getAllSlugs",
  async ({ size, page }) => {
    const response = await api.get(
      `/leadService/api/v1/slug/getSlug?pageSize=${size}&pageNo=${page}`,
    );
    return response.data;
  },
);

export const searchSlugList = createAsyncThunk(
  "searchSlugList",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/slug/getGlobalSlug?name=${name}`,
    );
    return response.data;
  },
);

export const getAllSlugCount = createAsyncThunk(
  "allTotalSlugCount",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/urls/getTotalSlugCount`,
    );
    return response.data;
  },
);

export const createPlantSetup = createAsyncThunk(
  "createPlantSetup",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/slug/createPlantSetUp`,
      data,
    );
    return response.data;
  },
);

export const getAllUrlsList = createAsyncThunk(
  "getAllUrlsList",
  async ({ page, size }) => {
    const showLeadUrl = await api.get(
      `/leadService/api/v1/urls/getUrls?pageSize=${size}&pageNo=${page}`,
    );
    return showLeadUrl?.data;
  },
);

export const getAllUrlCount = createAsyncThunk("getTotalUrlCount", async () => {
  const response = await api.get(`/leadService/api/v1/urls/getTotalUrlsCount`);
  return response.data;
});

export const searchLeadUrlList = createAsyncThunk(
  "searchLeadUrlList",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/urls/getGlobalSearchUrls?name=${name}`,
    );
    return response.data;
  },
);

export const createUrl = createAsyncThunk("createUrl", async (data) => {
  const createLeadUrl = await api.post(
    `/leadService/api/v1/urls/createUrls`,
    data,
  );
  return createLeadUrl?.data;
});

export const editUrls = createAsyncThunk("editUrls", async (data) => {
  const respose = await api.put("/leadService/api/v1/urls/updateUrls", data);
  return respose.data;
});

export const convertUrlsToProduct = createAsyncThunk(
  "convertUrlsToProduct",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/product/importProductByUrls`,
      data,
    );
    return response.data;
  },
);

export const getAllDepartment = createAsyncThunk(
  "getAllDepartment",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/designation/getAllDepartment`,
    );
    return response.data;
  },
);

export const createDepartment = createAsyncThunk(
  "createDepartment",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/designation/createDepartment?name=${data?.name}`,
    );
    return response.data;
  },
);

export const getAllDesiginations = createAsyncThunk(
  "allDesiginations",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/designation/getAllDesignation`,
    );
    return response.data;
  },
);

export const createDesiginationByDepartmentId = createAsyncThunk(
  "createDesiginationByDepartmentId",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/designation/createDepartmentInDesignation`,
      data,
    );
    return response.data;
  },
);

export const addStatusInDepartment = createAsyncThunk(
  "addStatusInDepartment",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/status/addStatusInDepartment`,
      data,
    );
    return response.data;
  },
);

export const createDesigination = createAsyncThunk(
  "createDesination",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/designation/createDesignation?name=${data?.name}&weight=${data?.weight}`,
    );
    return response.data;
  },
);

export const getAllProposalAndEmailTemplates = createAsyncThunk(
  "getAllProposalAndEmailTemplates",
  async () => {
    const response = await api.get(
      `/leadService/api/v1/leadEstimate/getAllProposalTempalte`,
    );
    return response.data;
  },
);

export const createProposalTemplate = createAsyncThunk(
  "createProposalTemplate",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/leadEstimate/createProposalTempalte`,
      data,
    );
    return response.data;
  },
);

export const editProposalAndEmailTemplate = createAsyncThunk(
  "editProposalAndEmailTemplate",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/leadEstimate/editProposalTempalte`,
      data,
    );
    return response.data;
  },
);

export const addApplicantType = createAsyncThunk(
  "addApplicantType",
  async (data) => {
    const response = await api.post(`/api/applicant-types`, data);
    return response.data;
  },
);

export const getApplicantTypeList = createAsyncThunk(
  "getApplicantTypeList",
  async ({ page, size }) => {
    const response = await api.get(
      `/api/applicant-types?page=${page}&size=${size}`,
    );
    return response.data;
  },
);

export const getAllSolutionsByType = createAsyncThunk(
  "getAllSolutionsByType",
  async ({ page, size, userId, type }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/leadService/api/v1/getAllSolutionForSolutionPage?page=${page}&size=${size}&userId=${userId}&type=${type}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const getAllSolutionCountByType = createAsyncThunk(
  "getAllSolutionCountByType",
  async ({ userId, type }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/leadService/api/v1/getActiveSolutionCount?userId=${userId}&type=${type}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const createSolution = createAsyncThunk(
  "createSolution",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(`/leadService/api/v1/`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const updateSolution = createAsyncThunk(
  "updateSolution",
  async ({ id, data, userId }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/leadService/api/v1/updateSolution?id=${id}&userId=${userId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const getSolutionPriceListById = createAsyncThunk(
  "getSolutionPriceListById",
  async ({ solutionId, userId }) => {
    const response = await api.get(
      `/leadService/api/v1/service-solutions/${solutionId}/fees?userId=${userId}`,
    );
    return response.data;
  },
);

export const getSolutionDetailByName = createAsyncThunk(
  "getSolutionDetailByName",
  async ({ name, userId }) => {
    const response = await api.get(
      `/leadService/api/v1/getSolutionByName?name=${name}&userId=${userId}`,
    );
    return response.data;
  },
);

export const getAllPaymentType = createAsyncThunk(
  "getAllPaymentType",
  async () => {
    const response = await api.get(`/api/payment-types`);
    return response.data;
  },
);

export const getAllSolutionList = createAsyncThunk(
  "getAllSolutionList",
  async (userId) => {
    const response = await api.get(
      `leadService/api/v1/getAllSolution?userId=${userId}`,
    );
    return response.data;
  },
);

export const SettingSlice = createSlice({
  name: "setting",
  initialState: {
    slugList: [],
    loading: "",
    allComments: [],
    statusList: [],
    productList: [],
    ipAddressList: [],
    productListCount: 0,
    singleProductDetail: {},
    salesTatList: [],
    clientDesiginationList: [],
    slugListWithPage: [],
    slugCount: 0,
    urlsList: [],
    urlCount: 0,
    departmentList: [],
    designationList: [],
    templateAndMailList: [],
    applicantTypeList: [],
    solutionsList: [],
    solutionsCount: 0,
    solutionPriceList: [],
    solutionDetailById: {},
    paymentTypeList: [],
    allSolutionList: [],
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

    builder.addCase(getAllStatusData.pending, (state) => {
      state.loading = "pending";
      state.statusList = [];
    });
    builder.addCase(getAllStatusData.fulfilled, (state, action) => {
      state.loading = "success";
      state.statusList = action.payload;
    });
    builder.addCase(getAllStatusData.rejected, (state) => {
      state.loading = "rejected";
      state.statusList = [];
    });

    builder.addCase(getAllProductListByType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllProductListByType.fulfilled, (state, action) => {
      state.loading = "success";
      state.productList = action.payload;
    });
    builder.addCase(getAllProductListByType.rejected, (state) => {
      state.loading = "rejected";
      state.productList = [];
    });

    builder.addCase(searchSolutionsByName.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchSolutionsByName.fulfilled, (state, action) => {
      state.loading = "success";
      state.solutionsList = action?.payload;
      state.solutionsCount = action?.payload?.length;
    });
    builder.addCase(searchSolutionsByName.rejected, (state) => {
      state.loading = "rejected";
      state.solutionsList = [];
    });

    builder.addCase(getAllProductListCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllProductListCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.productListCount = action.payload;
    });
    builder.addCase(getAllProductListCount.rejected, (state) => {
      state.loading = "rejected";
      state.productListCount = 0;
    });

    builder.addCase(getSingleProductByProductId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getSingleProductByProductId.fulfilled, (state, action) => {
      state.loading = "success";
      state.singleProductDetail = action.payload;
    });
    builder.addCase(getSingleProductByProductId.rejected, (state) => {
      state.loading = "rejected";
      state.singleProductDetail = {};
    });

    builder.addCase(getAllIpAddress.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllIpAddress.fulfilled, (state, action) => {
      state.loading = "success";
      state.ipAddressList = action.payload;
    });
    builder.addCase(getAllIpAddress.rejected, (state) => {
      state.loading = "rejected";
      state.ipAddressList = [];
    });

    builder.addCase(getAllSalesTatInProduct.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllSalesTatInProduct.fulfilled, (state, action) => {
      state.loading = "success";
      state.salesTatList = action.payload;
    });
    builder.addCase(getAllSalesTatInProduct.rejected, (state) => {
      state.loading = "rejected";
      state.salesTatList = [];
    });

    builder.addCase(getClientDesiginationList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getClientDesiginationList.fulfilled, (state, action) => {
      state.loading = "success";
      state.clientDesiginationList = action.payload;
    });
    builder.addCase(getClientDesiginationList.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllSlugs.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllSlugs.fulfilled, (state, action) => {
      state.loading = "success";
      state.slugListWithPage = action.payload;
    });
    builder.addCase(getAllSlugs.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(searchSlugList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchSlugList.fulfilled, (state, action) => {
      state.loading = "success";
      state.slugListWithPage = action.payload;
    });
    builder.addCase(searchSlugList.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllSlugCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllSlugCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.slugCount = action.payload;
    });
    builder.addCase(getAllSlugCount.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllUrlsList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllUrlsList.fulfilled, (state, action) => {
      state.loading = "success";
      state.urlsList = action.payload;
    });
    builder.addCase(getAllUrlsList.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(searchLeadUrlList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(searchLeadUrlList.fulfilled, (state, action) => {
      state.loading = "success";
      state.urlsList = action.payload;
    });
    builder.addCase(searchLeadUrlList.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllUrlCount.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllUrlCount.fulfilled, (state, action) => {
      state.loading = "success";
      state.urlCount = action.payload;
    });
    builder.addCase(getAllUrlCount.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllDepartment.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllDepartment.fulfilled, (state, action) => {
      state.loading = "success";
      state.departmentList = action.payload;
    });
    builder.addCase(getAllDepartment.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllDesiginations.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllDesiginations.fulfilled, (state, action) => {
      state.loading = "success";
      state.designationList = action.payload;
    });
    builder.addCase(getAllDesiginations.rejected, (state) => {
      state.loading = "rejected";
    });

    builder.addCase(getAllProposalAndEmailTemplates.pending, (state) => {
      state.templateAndMailList = [];
      state.loading = "pending";
    });
    builder.addCase(
      getAllProposalAndEmailTemplates.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.templateAndMailList = action?.payload;
      },
    );
    builder.addCase(getAllProposalAndEmailTemplates.rejected, (state) => {
      state.templateAndMailList = [];
      state.loading = "rejected";
    });

    builder.addCase(getApplicantTypeList.pending, (state) => {
      state.applicantTypeList = [];
      state.loading = "pending";
    });
    builder.addCase(getApplicantTypeList.fulfilled, (state, action) => {
      state.loading = "success";
      state.applicantTypeList = action?.payload;
    });
    builder.addCase(getApplicantTypeList.rejected, (state) => {
      state.applicantTypeList = [];
      state.loading = "rejected";
    });

    builder.addCase(getAllSolutionsByType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllSolutionsByType.fulfilled, (state, action) => {
      state.loading = "success";
      state.solutionsList = action.payload;
    });
    builder.addCase(getAllSolutionsByType.rejected, (state) => {
      state.loading = "rejected";
      state.solutionsList = [];
    });

    builder.addCase(getAllSolutionCountByType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllSolutionCountByType.fulfilled, (state, action) => {
      state.loading = "success";
      state.solutionsCount = action.payload;
    });
    builder.addCase(getAllSolutionCountByType.rejected, (state) => {
      state.loading = "rejected";
      state.solutionsCount = 0;
    });

    builder.addCase(getSolutionPriceListById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getSolutionPriceListById.fulfilled, (state, action) => {
      state.loading = "success";
      state.solutionPriceList = action.payload;
    });
    builder.addCase(getSolutionPriceListById.rejected, (state) => {
      state.loading = "rejected";
      state.solutionPriceList = [];
    });

    builder.addCase(getSolutionDetailByName.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getSolutionDetailByName.fulfilled, (state, action) => {
      state.loading = "success";
      state.solutionDetailById = action.payload;
    });
    builder.addCase(getSolutionDetailByName.rejected, (state) => {
      state.loading = "rejected";
      state.solutionDetailById = {};
    });

    builder.addCase(getAllPaymentType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllPaymentType.fulfilled, (state, action) => {
      state.loading = "success";
      state.paymentTypeList = action.payload;
    });
    builder.addCase(getAllPaymentType.rejected, (state) => {
      state.loading = "rejected";
      state.paymentTypeList = {};
    });

    builder.addCase(getAllSolutionList.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllSolutionList.fulfilled, (state, action) => {
      state.loading = "success";
      state.allSolutionList = action.payload;
    });
    builder.addCase(getAllSolutionList.rejected, (state) => {
      state.loading = "rejected";
      state.allSolutionList = [];
    });
  },
});

export default SettingSlice.reducer;
