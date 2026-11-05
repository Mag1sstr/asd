import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  ICartResponse,
  ICommets,
  ICreateReviewBody,
  ILoginBody,
  ILoginResponse,
  IOrderBody,
  IOrdersData,
  IProduct,
  IProductsParams,
  IProductsResponse,
  IRegisterBody,
  IItems,
  ICategory,
  INews,
  IProductInput,
  IUser,
  IInquiry,
} from "../types/interfaces";
import type { RootState } from "../store/store";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const api = createApi({
  reducerPath: "api",
  tagTypes: ["Cart", "Review", "Product", "Category", "News", "Order"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders(headers, { getState }) {
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProducts: builder.query<IProductsResponse, IProductsParams>({
      query: (params) => ({
        url: "/products",
        params,
      }),
      providesTags: ["Product"],
    }),
    getBrands: builder.query<IItems[], void>({ query: () => "/brands" }),
    getModels: builder.query<IItems[], number>({
      query: (id) => ({ url: "/models", params: { brandId: id } }),
    }),
    getGenerations: builder.query<IItems[], number>({
      query: (id) => ({ url: "/generations", params: { modelId: id } }),
    }),
    getCategories: builder.query<ICategory[], void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation<ICategory, Partial<ICategory>>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<
      ICategory,
      { id: number; body: Partial<ICategory> }
    >({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),
    getNews: builder.query<INews[], void>({
      query: () => "/news",
      providesTags: ["News"],
    }),
    getInquiries: builder.query<IInquiry[], void>({
      query: () => "/inquiries",
    }),
    createInquiry: builder.mutation<
      { id: number; saved: boolean; notified: boolean },
      { name: string; tel: string; email: string; message: string }
    >({ query: (body) => ({ url: "/inquiries", method: "POST", body }) }),
    getSingleNews: builder.query<INews, number>({
      query: (id) => `/news/${id}`,
      providesTags: ["News"],
    }),
    createNews: builder.mutation<INews, Partial<INews>>({
      query: (body) => ({ url: "/news", method: "POST", body }),
      invalidatesTags: ["News"],
    }),
    updateNews: builder.mutation<INews, { id: number; body: Partial<INews> }>({
      query: ({ id, body }) => ({ url: `/news/${id}`, method: "PUT", body }),
      invalidatesTags: ["News"],
    }),
    deleteNews: builder.mutation<void, number>({
      query: (id) => ({ url: `/news/${id}`, method: "DELETE" }),
      invalidatesTags: ["News"],
    }),
    createProduct: builder.mutation<IProduct, IProductInput>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<
      IProduct,
      { id: number; body: Partial<IProductInput> }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),
    uploadImage: builder.mutation<{ url: string }, FormData>({
      query: (body) => ({ url: "/uploads", method: "POST", body }),
    }),
    getSingleProduct: builder.query<IProduct, string | number | null>({
      query: (id) => ({
        url: `/products/${id}`,
      }),
      providesTags: ["Product"],
    }),
    getReviews: builder.query<ICommets[], string>({
      query: (id) => ({
        url: "/reviews",
        params: { productId: id },
      }),
      providesTags: () => [{ type: "Review" }],
    }),
    getCart: builder.query<ICartResponse, null>({
      query: () => ({
        url: "/cart",
      }),
      providesTags: () => [
        {
          type: "Cart",
        },
      ],
    }),
    getOrders: builder.query<IOrdersData[], null>({
      query: () => ({
        url: "/orders",
      }),
      providesTags: ["Order"],
    }),
    getReviewCheck: builder.query<boolean, string>({
      query: (id) => ({
        url: `/reviews/exists?productId=${id}`,
      }),
      providesTags: () => [{ type: "Review" }],
    }),

    addToCart: builder.mutation<null, { productId: number; count: number }>({
      query: ({ productId, count }) => ({
        method: "POST",
        url: "/cart/items",
        body: { productId, count },
      }),
      invalidatesTags: () => [
        {
          type: "Cart",
        },
      ],
    }),
    increaseCartItem: builder.mutation<null, number>({
      query: (id) => ({
        method: "PATCH",
        url: `/cart/items/${id}`,
        body: { delta: 1 },
      }),
      invalidatesTags: () => [{ type: "Cart" }],
    }),
    decreaseCartItem: builder.mutation<null, number>({
      query: (id) => ({
        method: "PATCH",
        url: `/cart/items/${id}`,
        body: { delta: -1 },
      }),
      invalidatesTags: () => [{ type: "Cart" }],
    }),
    deleteCartItem: builder.mutation<null, number>({
      query: (id) => ({
        method: "DELETE",
        url: `/cart/items/${id}`,
      }),
      invalidatesTags: () => [{ type: "Cart" }],
    }),

    registerUser: builder.mutation<
      { user: import("../types/interfaces").IUser },
      IRegisterBody
    >({
      query: ({ first_name, last_name, email, password }) => ({
        method: "POST",
        url: "/registration",
        body: {
          first_name,
          last_name,
          email,
          password,
        },
      }),
    }),
    loginUser: builder.mutation<ILoginResponse, ILoginBody>({
      query: ({ email, password }) => ({
        method: "POST",
        url: "/auth/token",
        body: {
          email,
          password,
        },
      }),
    }),
    getUser: builder.query<IUser, void>({ query: () => "/auth/user" }),

    createOrder: builder.mutation<number, IOrderBody>({
      query: (body) => ({
        method: "POST",
        url: "/orders",
        body,
      }),
      invalidatesTags: ["Cart", "Order"],
    }),
    createReview: builder.mutation<null, ICreateReviewBody>({
      query: (body) => ({
        method: "POST",
        url: "/reviews",
        body,
      }),
      invalidatesTags: () => [{ type: "Review" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetBrandsQuery,
  useGetModelsQuery,
  useGetGenerationsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetNewsQuery,
  useGetInquiriesQuery,
  useCreateInquiryMutation,
  useGetSingleNewsQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadImageMutation,
  useGetSingleProductQuery,
  useGetReviewsQuery,
  useGetCartQuery,
  useGetOrdersQuery,
  useGetReviewCheckQuery,
  useAddToCartMutation,
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetUserQuery,
  useIncreaseCartItemMutation,
  useDecreaseCartItemMutation,
  useDeleteCartItemMutation,
  useCreateOrderMutation,
  useCreateReviewMutation,
} = api;
