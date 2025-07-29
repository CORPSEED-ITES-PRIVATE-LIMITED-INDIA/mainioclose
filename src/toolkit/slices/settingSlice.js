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
      `/leadService/api/v1/lead/createComment?comment=${data?.comment}`
    );
    return respose.data;
  }
);

export const deleteComments = createAsyncThunk("deletecomments", async (id) => {
  const response = await api.delete(
    `/leadService/api/v1/lead/deleteComments?id=${id}`
  );
  return response.data;
});

export const updateComments = createAsyncThunk(
  "updateComments",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/lead/updateComments?id=${data?.id}&comment=${data?.comment}`
    );
    return response.data;
  }
);

export const getAllStatusData = createAsyncThunk(
  "getAllStatusData",
  async () => {
    const response = await api.get(`/leadService/api/v1/status/getAllStatus`);
    return response.data;
  }
);

export const createLeadStatus = createAsyncThunk(
  "createLead",
  async (createStatus) => {
    const response = await api.post(
      `/leadService/api/v1/status/CreateLeadStatus`,
      createStatus
    );
    return response.data;
  }
);

export const editLeadStatus = createAsyncThunk(
  "editLeadStatus",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/status/updateInLeadStatus`,
      data
    );
    return response.data;
  }
);

export const deleteLeadStatus = createAsyncThunk(
  "deleteLeadStatus",
  async (statusId) => {
    const response = await api.delete(
      `/leadService/api/v1/status/deleteStaus?id=${statusId}`
    );
    return response.data;
  }
);

export const getAllProductListByType = createAsyncThunk(
  "getAllProductListByType",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/product/getAllProductList?page=${data?.page}&size=${data?.size}&type=${data?.type}`
    );
    return response.data;
  }
);

export const getAllProductListCount = createAsyncThunk(
  "getAllProductListCount",
  async (data) => {
    const response = await api.get(
      `/leadService/api/v1/product/getAllProductListCount?type=${data?.type}`
    );
    return response.data;
  }
);

export const createProduct = createAsyncThunk("createProduct", async (data) => {
  const response = await api.post(
    `/leadService/api/v1/product/createProduct`,
    data
  );
  return response.data;
});

export const getSingleProductByProductId = createAsyncThunk(
  "getSingleProductByProductId",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/product/getProduct?id=${id}`
    );
    return response.data;
  }
);

export const getAllIpAddress = createAsyncThunk("allIpAddress", async () => {
  const response = await api.get(`/securityService/api/auth/getAllIpAddress`);
  return response.data;
});

export const addIpAddress = createAsyncThunk("addIpAddress", async (data) => {
  const response = await api.post(
    `/securityService/api/auth/addIpAddress?ipAddressName=${data?.ipaddress}`
  );
  return response.data;
});

export const addAmountForProduct = createAsyncThunk(
  "addAmountForProduct",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/product/addAmountInProduct`,
      data
    );
    return response.data;
  }
);

export const editAmountForProduct = createAsyncThunk(
  "editAmountForProduct",
  async (data) => {
    const response = await api.put(
      `/leadService/api/v1/product/updateAmountInProduct`,
      data
    );
    return response.data;
  }
);

export const addDocumentProduct = createAsyncThunk(
  "addDocumentProduct",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/product/addDocumentsInProduct`,
      data
    );
    return response.categoryData;
  }
);

export const addDocsInProduct = createAsyncThunk(
  "addDocsInProduct",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/product/addProductDocumentsInProduct`,
      data
    );
    return response.data;
  }
);

export const addSalesTatInProduct = createAsyncThunk(
  "addSalesTATInProduct",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/product/addSalesTat`,
      data
    );
    return response.data;
  }
);

export const getAllSalesTatInProduct = createAsyncThunk(
  "getAllSalesTatInProduct",
  async (productId) => {
    const response = await api.get(
      `/leadService/api/v1/product/getAllSalesTat?productId=${productId}`
    );
    return response.data;
  }
);

export const importProductAmountDoument = createAsyncThunk(
  "importProductAmountDoument",
  async (s3Url) => {
    const response = await api.post(
      `/leadService/api/v1/import-product-amount-csv-from-s3?s3Url=${s3Url}`
    );
    return response.data;
  }
);

export const importProductCheckListDoument = createAsyncThunk(
  "importProductCheckListDoument",
  async (s3Url) => {
    const response = await api.post(
      `/leadService/api/v1/import-product-checklist-doc-csv-from-s3?s3Url=${s3Url}`
    );
    return response.data;
  }
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

    builder.addCase(getSingleProductByProductId.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getSingleProductByProductId.fulfilled, (state, action) => {
      state.loading = "success";
      state.singleProductDetail = action.payload;
    });
    builder.addCase(getSingleProductByProductId.rejected, (state, action) => {
      state.loading = "rejected";
      state.singleProductDetail = {};
    });

    builder.addCase(getAllIpAddress.pending, (state, action) => {
      state.loading = "pending";
    });
    builder.addCase(getAllIpAddress.fulfilled, (state, action) => {
      state.loading = "success";
      state.ipAddressList = action.payload;
    });
    builder.addCase(getAllIpAddress.rejected, (state, action) => {
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
  },
});

export default SettingSlice.reducer;
