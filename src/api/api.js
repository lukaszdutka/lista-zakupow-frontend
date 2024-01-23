import {createClient} from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_API_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const recipesTable = 'recipes';
const productsTable = `products`;
const recipeIngredientsTable = 'recipeingredients';

export async function getRecipes() {
  const {data: recipes, error} = await supabase
    .from(recipesTable)
    .select(`
      name,
      recipeurl,
      photourl,
      ${productsTable}(id, name, category, unit, photourl),
      ${recipeIngredientsTable}(product_id, quantity)
    `);

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  const returningRecipes = recipes.map(recipe => {
      const quantities = recipe.recipeingredients;
      return ({
        name: recipe.name,
        recipeUrl: recipe.recipeurl,
        photoUrl: recipe.photourl,
        ingredients: recipe.products.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category,
            unit: product.unit,
            quantity: quantities.find(e => e.product_id === product.id).quantity,
            photoUrl: product.photourl,
          })
        )
      });
    }
  )

  console.log("From backend:")
  console.log({returningRecipes})
  return returningRecipes
}

async function insertRecipe(data) {
  const recipe = {
    name: data.name,
    recipeurl: data.videoUrl,
    photourl: null,
  }

  const {data: recipeData, error: recipeError} = await supabase
    .from(recipesTable)
    .insert([recipe])
    .select();

  if (recipeError) {
    console.error('Error inserting recipe:', {recipeError});
  }
  return recipeData[0].id;
}

async function upsertIngredients(data) {
  //name, category, unit, photourl
  const ingredients = data.ingredients.map(i => ({
    name: i.name,
    category: i.category || "inne",
    unit: i.unit,
    photourl: null
  }))

  // Insert the ingredients
  const {data: returnedIngredients, error: ingredientsError} = await supabase
    .from('products')
    .upsert(ingredients)
    .select();

  if (ingredientsError) {
    console.log('Error inserting ingredients:', {ingredientsError});
    console.log(ingredientsError)
  }
  return returnedIngredients;
}

async function insertRecipeIngredients(returnedIngredients, recipeId, quantities) {
  const recipeIngredients = returnedIngredients.map((ingredient, i) => ({
    recipe_id: recipeId,
    product_id: ingredient.id,
    quantity: quantities[i],
  }))

  const {error: recipeIngredientsError} = await supabase
    .from(recipeIngredientsTable)
    .insert(recipeIngredients)

  if (recipeIngredientsError) {
    console.log('Error inserting recipeIngredientsError:', {recipeIngredientsError});
    console.log(recipeIngredientsError)
  }
}

export async function addRecipe(data) {
  const recipeId = await insertRecipe(data);
  const returnedIngredients = await upsertIngredients(data);
  const quantities = data.ingredients.map(i => i.quantity)
  await insertRecipeIngredients(returnedIngredients, recipeId, quantities);

  console.log('Recipe and ingredients added successfully');
}