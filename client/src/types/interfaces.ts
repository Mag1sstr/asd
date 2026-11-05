export interface IProductData {
  id: number;
  name: string;
  code?: string;
  price: number;
  available: number;
  manufacturer?: string;
  description: string;
  category: {
    name: string;
  };
  image_url?: string | null;
}
export interface IItems {
  name: string;
  id: number;
}
export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  isAdmin?: boolean;
}
export interface IProduct {
  available: number;
  description: string;
  name: string;
  code: string;
  manufacturer: string;
  price: number;
  id: number;
  brand: {
    name: string;
  };
  model: {
    name: string;
  };
  generation: {
    name: string;
  };
  image_url?: string | null;
}
export interface IProductInput {
  name: string;
  price: number;
  available: number;
  code: string;
  manufacturer: string;
  description: string;
  categoryId?: number | null;
  brandId?: number | null;
  modelId?: number | null;
  generationId?: number | null;
  imageUrl?: string | null;
}
export interface ICategory {
  id: number;
  name: string;
  parent_id?: number | null;
  parentId?: number | null;
}
export interface INews {
  id: number;
  title: string;
  content: string;
  image_url?: string | null;
  created_at: string;
}
export interface IInquiry {
  id: number;
  name: string;
  tel: string;
  email: string;
  message: string;
  created_at: string;
}
export interface ICommets {
  id: number;
  review: string;
  user: {
    firstName: string;
    lastName: string;
  };
}
export interface ICart {
  count: number;
  product: {
    name: string;
    price: number;
    code: string;
    id: number;
  };
}

export interface IOrdersData {
  id: number;
  created_at: number;
  items: {
    count: number;
    product: {
      name: string;
      id: number;
      price: number;
      code: string;
    };
  }[];
}

export interface IStages {
  name: string;
  component?: React.ReactNode;
}

export interface IRegisterBody {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}
export interface ILoginBody {
  email: string;
  password: string;
}
export interface IOrderBody {
  phone: string;
  area: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
}

export interface ILoginResponse {
  access_token: string;
  token_type?: string;
}
export interface ICartResponse {
  user: IUser;
  items: ICart[];
}

export interface IContactsValues {
  name: string;
  surname: string;
  email: string;
  tel: string;
  patronymic: string;
}
export interface IDeliveryValues {
  area: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
}
export interface ICreateReviewBody {
  product_id: number | string;
  review: string;
}

export interface IProductsResponse {
  items: IProductData[];
  totalPages: number;
}
export interface IProductsParams {
  page: number;
  size: number;
  available?: number;
  brandId?: number;
  modelId?: number;
  generationId?: number;
  search?: string;
}
