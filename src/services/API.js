import axios from "axios";
export default {
  get: {
    fakeProducts: () => {
      return axios.get("https://fakestoreapi.com/products/1");
    },
  },
  post: {
    fakeProduct: (body) => {
      return axios.post("https://fakestoreapi.com/products", body);
    },
  },
  put: {
    fakeProduct: (body) => {
      return axios.put("https://fakestoreapi.com/products/7", body);
    },
  },
  delete: {
    fakeProduct: () => axios.delete("https://fakestoreapi.com/products/6"),
  },
};
