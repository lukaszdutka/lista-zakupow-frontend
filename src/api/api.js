import {createClient} from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_API_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const recipesTable = 'recipes';
const ingredientsTable = `ingredients`;
const recipeIngredientsTable = 'recipe_ingredients';

export async function getRecipes() {
  //todo: try it:
  // const { data, error } = await supabase
  //   .from('teams')
  //   .select('teams.team_name, users.name')
  //   .innerJoin('members', 'teams.id', 'members.team_id')
  //   .innerJoin('users', 'members.user_id', 'users.id');
  const {data: recipes, error} = await supabase
    .from(recipesTable)
    .select(`
      name,
      recipe_url,
      photo_url,
      ${ingredientsTable}(id, name, category, unit, photo_url),
      ${recipeIngredientsTable}(ingredient_id, quantity)
    `);

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  const returningRecipes = recipes.map(recipe => {
      const quantities = recipe[recipeIngredientsTable];
      return {
        name: recipe.name,
        recipeUrl: recipe.recipe_url,
        photoUrl: recipe.photo_url,
        ingredients: recipe.ingredients.map(ingredient => ({
            id: ingredient.id,
            name: ingredient.name,
            category: ingredient.category,
            unit: ingredient.unit,
            quantity: quantities.find(e => e.ingredient_id === ingredient.id).quantity,
            photoUrl: ingredient.photo_url,
          })
        )
      };
    }
  )

  console.log("From backend:")
  console.log({returningRecipes})
  return returningRecipes
}

async function insertRecipe(data) {
  const recipe = {
    name: data.name,
    recipe_url: data.videoUrl,
    photo_url: null,
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
  const ingredients = data.ingredients.map(i => ({
    id: i.id || crypto.randomUUID(),
    name: i.name,
    category: i.category || "inne",
    unit: i.unit,
    photo_url: null
  }))

  console.log("trying to add:")
  console.log({ingredients})

  // Insert the ingredients
  const {
    data: returnedIngredients,
    error: ingredientsError
  } = await supabase
    .from(ingredientsTable)
    .upsert(ingredients)
    .select();

  if (ingredientsError) {
    console.log('Error inserting ingredients:', {ingredientsError});
    console.log(ingredientsError)
  }
  return returnedIngredients;
}

async function insertRecipeIngredients(ingredientIds, recipeId, quantities) {
  const recipeIngredients = ingredientIds.map((ingredientId, i) => ({
    recipe_id: recipeId,
    ingredient_id: ingredientId,
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
  const ingredientIds = returnedIngredients.map(i => i.id);
  await insertRecipeIngredients(ingredientIds, recipeId, quantities);

  console.log('Recipe and ingredients added, if no errors');
}