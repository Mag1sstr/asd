import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IItems } from "../../types/interfaces";
import type { AppDispatch } from "../store";
import { api } from "../../api/api";

interface IFiltersSlice {
  currentPage: number;
  available: number;
  brands: IItems[];
  models: IItems[];
  gens: IItems[];
  brandId: number;
  modelId: number;
  genId: number;
  rangeValue: { min: number; max: number };
}

const initialState: IFiltersSlice = {
  currentPage: 1,
  available: 0,
  brands: [],
  models: [],
  gens: [],
  modelId: 0,
  brandId: 0,
  genId: 0,
  rangeValue: { min: 0, max: 0 },
};

export const filtersSlice = createSlice({
  name: "filtersSlice",
  initialState,
  reducers: {
    setRange(state, action: PayloadAction<{ min: number; max: number }>) {
      state.rangeValue = action.payload;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    setAvailable(state, action) {
      state.available = action.payload;
    },
    setBrands(state, action) {
      state.brands = action.payload;
    },
    setModels(state, action) {
      state.models = action.payload;
    },
    setGens(state, action) {
      state.gens = action.payload;
    },
    setBrandId(state, action) {
      state.brandId = action.payload;
    },
    setModelId(state, action) {
      state.modelId = action.payload;
    },
    setGenId(state, action) {
      state.genId = action.payload;
    },
  },
});

export function getBrands() {
  return function (dispatch: AppDispatch) {
    dispatch(api.endpoints.getBrands.initiate()).unwrap().then((items) => dispatch(setBrands(items)));
  };
}

export function brandChange(id: number) {
  return function (dispatch: AppDispatch) {
    if (id === -1) {
      dispatch(setBrandId(0));
      dispatch(setModelId(0));
      dispatch(setGenId(0));

      dispatch(setModels([]));
      dispatch(setGens([]));
    } else {
      dispatch(setBrandId(id));
      dispatch(api.endpoints.getModels.initiate(id)).unwrap().then((items) => dispatch(setModels(items)));
    }
  };
}

export function modelChange(id: number) {
  return function (dispatch: AppDispatch) {
    if (id === -1) {
      dispatch(setModelId(0));
      dispatch(setGenId(0));

      dispatch(setGens([]));
    } else {
      dispatch(setModelId(id));
      dispatch(api.endpoints.getGenerations.initiate(id)).unwrap().then((items) => dispatch(setGens(items)));
    }
  };
}

export function genChange(id: number) {
  return function (dispatch: AppDispatch) {
    if (id === -1) {
      dispatch(setGenId(0));
    } else {
      dispatch(setGenId(id));
    }
  };
}

export const {
  setAvailable,
  setCurrentPage,
  setBrands,
  setGens,
  setModels,
  setBrandId,
  setGenId,
  setModelId,
  setRange,
} = filtersSlice.actions;

export default filtersSlice.reducer;
