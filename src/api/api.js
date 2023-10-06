import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

export async function getRecipes() {
  const response = await axios.get(`${API_BASE_URL}/recipe`);
  const data = response.data;
  console.log("From backend:")
  console.log({data})
  return data
}

export async function addRecipe(recipe) {
  const body = {
    name: recipe.name,
    videoUrl: recipe.videoUrl,
    ingredients: recipe.ingredients.map(i => ({
      name: i.name,
      quantity: i.quantity,
      category: i.category || "inne",
      isRarelyBought: i.isRarelyBought || false
    }))
  };
  console.log({body})
  await axios.post(`${API_BASE_URL}/recipe`, body)
}