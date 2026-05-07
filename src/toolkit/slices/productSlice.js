import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";

export const getAllProductCategoryById = createAsyncThunk(
  "getAllProductCategoryById",
  async ({ solutionId, tierId, userId }) => {
    const response = await api.get(
      `/leadService/api/v1/product-solutions/${solutionId}/tiers/${tierId}/roles?userId=${userId}`,
    );
    return response.data;
  },
);

export const getAllBusinessArrangementBySolutionId = createAsyncThunk(
  "getAllBusinessArrangementBySolutionId",
  async ({ solutionId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/leadService/api/v1/product-solutions/${solutionId}/tiers?userId=${userId}`,
      );
      return response.data;
    } catch (err) {
      rejectWithValue(err?.response);
    }
  },
);

export const getAllProductSubCategoryListByCategoryId = createAsyncThunk(
  "getAllProductSubCategoryList",
  async ({ productRoleId, userId }) => {
    const response = await api.get(
      `/leadService/api/v1/product-solutions/product-roles/${productRoleId}/fee-rules?userId=${userId}`,
    );
    return response.data;
  },
);

export const getProductListByLeadName = createAsyncThunk(
  "getProductListByLeadName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/product/getProductByName?name=${name}`,
    );
    return response.data;
  },
);

export const createProductCategory = createAsyncThunk(
  "createProductCategory",
  async ({ solutionId, tierId, userId, data }) => {
    const response = await api.post(
      `/leadService/api/v1/product-solutions/${solutionId}/tiers/${tierId}/roles?userId=${userId}`,
      data,
    );
    return response.data;
  },
);

export const editProductCategory = createAsyncThunk(
  "editProductCategory",
  async ({ solutionId, tierId, roleId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/leadService/api/v1/product-solutions/${solutionId}/tiers/${tierId}/roles/${roleId}?userId=${userId}`,
        data,
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || {
          message: err?.message || "Unable to update category",
        },
      );
    }
  },
);

export const deleteProductCategory = createAsyncThunk(
  "deleteProductCategory",
  async ({ solutionId, tierId, roleId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/leadService/api/v1/product-solutions/${solutionId}/tiers/${tierId}/roles/${roleId}?userId=${userId}`,
      );

      return response.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || {
          message: err?.message || "Unable to delete category",
        },
      );
    }
  },
);

export const createProductSubCategory = createAsyncThunk(
  "createProductSubCategory",
  async ({ productRoleId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/leadService/api/v1/product-solutions/product-roles/${productRoleId}/fee-rules?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const editProductSubCategory = createAsyncThunk(
  "editProductSubCategory",
  async ({ productRoleId, ruleId, userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/leadService/api/v1/product-solutions/product-roles/${productRoleId}/fee-rules/${ruleId}?userId=${userId}`,
        data,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const deleteProductSubCategory = createAsyncThunk(
  "deleteProductSubCategory",
  async ({ tierId, productRoleId, ruleId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/leadService/api/v1/product-solutions/product-roles/${productRoleId}/fee-rules/${ruleId}?userId=${userId}`,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response);
    }
  },
);

export const toggleForRoundOffValue = createAsyncThunk(
  "toggleForRoundOffValue",
  async (id) => {
    const response = await api.put(
      `/leadService/api/v1/productSubCategory/roundValueOnAndOff?id=${id}`,
    );
    return response.data;
  },
);

export const createDocumentsForProduct = createAsyncThunk(
  "createDocumentsForProduct",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/product-required-documents`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const getAllDocumentsForProduct = createAsyncThunk(
  "getAllDocumentsForProduct",
  async ({ page, size, userId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/product-required-documents/active/${userId}?page=${page}&size=${size}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const mapDocumentToProduct = createAsyncThunk(
  "mapDocumentToProduct",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/operationService/api/products/${data?.productId}/documents/map`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const getAllDocumentCheckListByProductId = createAsyncThunk(
  "getAllDocumentCheckListByProductId",
  async ({ productId, applicantTypeId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/operationService/api/products/${productId}/documents?applicantTypeId=${applicantTypeId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const getAllSolutionsByUserId = createAsyncThunk(
  "getAllSolutionsByUserId",
  async (userId) => {
    const response = await api.get(
      `/leadService/api/v1/solutions?userId=${userId}`,
    );
    return response.data;
  },
);

const ProductSlice = createSlice({
  name: "product",
  initialState: {
    loading: "",
    productCategoryList: [],
    businessArrangementList: [],
    productSubcategoryList: [],
    productDataByLeadName: {},
    allDocumentList: [],
    allDocumentCheckListForProduct: [],
    solutionServiceFeeDetails: [],
    solutionListByUserId: [],
  },
  extraReducers: (builder) => {
    builder.addCase(getAllProductCategoryById.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllProductCategoryById.fulfilled, (state, action) => {
      state.loading = "success";
      state.productCategoryList = action.payload;
    });
    builder.addCase(getAllProductCategoryById.rejected, (state) => {
      state.loading = "rejected";
      state.productCategoryList = [];
    });

    builder.addCase(getAllBusinessArrangementBySolutionId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllBusinessArrangementBySolutionId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.businessArrangementList = action.payload;
      },
    );
    builder.addCase(getAllBusinessArrangementBySolutionId.rejected, (state) => {
      state.loading = "rejected";
      state.businessArrangementList = [];
    });

    builder.addCase(
      getAllProductSubCategoryListByCategoryId.pending,
      (state) => {
        state.loading = "pending";
      },
    );
    builder.addCase(
      getAllProductSubCategoryListByCategoryId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.productSubcategoryList = action.payload;
      },
    );
    builder.addCase(
      getAllProductSubCategoryListByCategoryId.rejected,
      (state) => {
        state.loading = "rejected";
        state.productSubcategoryList = [];
      },
    );

    builder.addCase(getProductListByLeadName.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getProductListByLeadName.fulfilled, (state, action) => {
      state.loading = "success";
      state.productDataByLeadName = action?.payload;
    });
    builder.addCase(getProductListByLeadName.rejected, (state, action) => {
      state.loading = "rejected";
      state.productDataByLeadName = {};
    });

    builder.addCase(getAllDocumentsForProduct.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllDocumentsForProduct.fulfilled, (state, action) => {
      state.loading = "success";
      state.allDocumentList = action?.payload;
    });
    builder.addCase(getAllDocumentsForProduct.rejected, (state, action) => {
      state.loading = "rejected";
      state.allDocumentList = [];
    });

    builder.addCase(getAllDocumentCheckListByProductId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(
      getAllDocumentCheckListByProductId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.allDocumentCheckListForProduct = action?.payload;
      },
    );
    builder.addCase(
      getAllDocumentCheckListByProductId.rejected,
      (state, action) => {
        state.loading = "rejected";
        state.allDocumentCheckListForProduct = [];
      },
    );

    builder.addCase(getAllSolutionsByUserId.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllSolutionsByUserId.fulfilled, (state, action) => {
      state.loading = "success";
      state.solutionListByUserId = action?.payload;
    });
    builder.addCase(getAllSolutionsByUserId.rejected, (state, action) => {
      state.loading = "rejected";
      state.solutionListByUserId = [];
    });
  },
});

export default ProductSlice.reducer;
