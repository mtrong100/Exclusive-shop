import { queryParams } from "@/constanst";
import {
  loadingCategories,
  storeCategories,
} from "@/redux/slices/categorySlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getCategories } from "@/services/categoryService";
import { useEffect } from "react";

export default function useGetcategories() {
  const dispatch = useAppDispatch();
  const { isLoading, categories } = useAppSelector((state) => state.category);

  useEffect(() => {
    async function fetchCategories() {
      try {
        dispatch(loadingCategories(true));
        const data = await getCategories(queryParams.PAGE, 100);
        dispatch(storeCategories(data?.docs));
      } catch (error) {
        console.log(error);
        dispatch(loadingCategories(false));
        dispatch(storeCategories([]));
      }
    }
    fetchCategories();
  }, [dispatch]);

  return { isLoading, categories };
}
