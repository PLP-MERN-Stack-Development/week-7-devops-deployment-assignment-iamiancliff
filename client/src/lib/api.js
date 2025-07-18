import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


export const getBugs = async () => {
  const res = await API.get("/bugs");
  
  // Handle both possibilities:
  if (Array.isArray(res.data)) {
    return res.data; 
  } else if (Array.isArray(res.data.bugs)) {
    return res.data.bugs; 
  } else {
    throw new Error("API response format for getBugs is invalid");
  }
};


export const createBug = async (bugData) => {
  const res = await API.post("/bugs", bugData);
  return res.data;
};

export const updateBug = async (id, bugData) => {
  const res = await API.put(`/bugs/${id}`, bugData);
  return res.data;
};

export const deleteBug = async (id) => {
  const res = await API.delete(`/bugs/${id}`);
  return res.data;
};
