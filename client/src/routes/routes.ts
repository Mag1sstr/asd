export const ROUTES = {
  HOME: "/",
  PROFILE: "/profile",
  ADMIN: "/admin",
  CATALOG: "/catalog",
  PRODUCT: (id: number) => `${ROUTES.CATALOG}/${id}`,
  CART: "/cart",
  COMPANY: "/company",
  SERVICES: "/services",
  INFO: "/info",
  CONTACTS: "/contacts",
};
