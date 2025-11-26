import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../httpRequest";
import { ca } from "zod/v4/locales";

export const getAllProductCategoryById = createAsyncThunk(
  "getAllProductCategoryById",
  async (businessArragmentId) => {
    const response = await api.get(
      `/leadService/api/v1/productCategory/getAllProductCategoryByBusinessArragmentId?businessArragmentId=${businessArragmentId}`
    );
    return response.data;
  }
);

export const getAllBusinessArrangement = createAsyncThunk(
  "getAllBusinessArrangement",
  async (productId) => {
    const response = await api.get(
      `/leadService/api/v1/businessArrangment/getAllBusinessArrangmentByProductId?productId=${productId}`
    );
    return response.data;
  }
);

export const getAllProductSubCategoryListByCategoryId = createAsyncThunk(
  "getAllProductSubCategoryList",
  async (id) => {
    const response = await api.get(
      `/leadService/api/v1/productSubCategory/getAllProductSubCategoryByProductCategoryId?productCategoryId=${id}`
    );
    return response.data;
  }
);

export const getProductListByLeadName = createAsyncThunk(
  "getProductListByLeadName",
  async (name) => {
    const response = await api.get(
      `/leadService/api/v1/product/getProductByName?name=${name}`
    );
    return response.data;
  }
);

export const createProductCategory = createAsyncThunk(
  "createProductCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/productCategory/createProductCategory`,
      data
    );
    return response.data;
  }
);

export const editProductCategory = createAsyncThunk(
  "editProductCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/productCategory/editProductCategory`,
      data
    );
    return response.data;
  }
);

export const createProductSubCategory = createAsyncThunk(
  "createProductSubCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/productSubCategory/createProductSubCategory`,
      data
    );
    return response.data;
  }
);

export const editProductSubCategory = createAsyncThunk(
  "editProductSubCategory",
  async (data) => {
    const response = await api.post(
      `/leadService/api/v1/productSubCategory/editProductSubCategory`,
      data
    );
    return response.data;
  }
);

export const toggleForRoundOffValue = createAsyncThunk(
  "toggleForRoundOffValue",
  async (id) => {
    const response = await api.put(
      `/leadService/api/v1/productSubCategory/roundValueOnAndOff?id=${id}`
    );
    return response.data;
  }
);

export const createDocumentsForProduct = createAsyncThunk(
  "createDocumentsForProduct",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/product-required-documents`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const getAllDocumentsForProduct = createAsyncThunk(
  "getAllDocumentsForProduct",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/product-required-documents?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const mapDocumentToProduct = createAsyncThunk(
  "mapDocumentToProduct",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/products/${data?.productId}/documents/map`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const getAllDocumentCheckListByProductId = createAsyncThunk(
  "getAllDocumentCheckListByProductId",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/products/${productId}/documents/requirements`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
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

    builder.addCase(getAllBusinessArrangement.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getAllBusinessArrangement.fulfilled, (state, action) => {
      state.loading = "success";
      state.businessArrangementList = action.payload;
    });
    builder.addCase(getAllBusinessArrangement.rejected, (state) => {
      state.loading = "rejected";
      state.businessArrangementList = [];
    });

    builder.addCase(
      getAllProductSubCategoryListByCategoryId.pending,
      (state) => {
        state.loading = "pending";
      }
    );
    builder.addCase(
      getAllProductSubCategoryListByCategoryId.fulfilled,
      (state, action) => {
        state.loading = "success";
        state.productSubcategoryList = action.payload;
      }
    );
    builder.addCase(
      getAllProductSubCategoryListByCategoryId.rejected,
      (state) => {
        state.loading = "rejected";
        state.productSubcategoryList = [];
      }
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
    builder.addCase(getAllDocumentCheckListByProductId.fulfilled, (state, action) => {
      state.loading = "success";
      state.allDocumentCheckListForProduct = action?.payload?.productDocumentMappingResponseDtos;
    });
    builder.addCase(getAllDocumentCheckListByProductId.rejected, (state, action) => {
      state.loading = "rejected";
      state.allDocumentCheckListForProduct = [];
    });
  },
});

export default ProductSlice.reducer;
