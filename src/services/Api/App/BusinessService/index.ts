import { urls } from "../../../../constants/Url";

export const fetchBusinessDetails = async (storeURL:string) => {
    try {
      const response = await fetch(`${storeURL + urls.businessDetails}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }