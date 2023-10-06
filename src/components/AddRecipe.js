import Navbar from "./Navbar";
import React, {useEffect, useState} from "react";
import {addRecipe, getRecipes} from "../api/api";
import {Autocomplete, Button, Checkbox, FormControl, FormControlLabel, TextField} from "@mui/material";

function AddRecipe() {
  const [recipe, setRecipe] = useState({
    name: '',
    videoUrl: '',
    ingredients: [{name: '', quantity: '1.0', category: '', isRarelyBought: false}],
  })
  const [suggestions, setSuggestions] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [nameToCategory, setNameToCategory] = useState({})

  const handleInputChange = (e, index) => {
    console.log(e.target.value)
    console.log(e.target.name)
    const {name, value} = e.target;
    const list = [...recipe.ingredients];
    if (value === "on") {
      list[index][name] = false;
    } else if (value === "off") {
      list[index][name] = true;
    } else {
      list[index][name] = value;
    }
    setRecipe({...recipe, ingredients: list,});
  };

  const handleAddIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, {name: '', quantity: '1.0', category: '', isRarelyBought: false}]
    });
  };

  const handleRemoveIngredient = index => {
    const list = [...recipe.ingredients];
    list.splice(index, 1);
    setRecipe({...recipe, ingredients: list});
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      const recipes = await getRecipes()

      const ingredients = recipes.map(r => r.ingredients).flat();
      const ingredientNames = ingredients.map(ing => ing.name)
      const uniqueIngredientNames = [...new Set(ingredientNames)]

      const categoryNames = recipes.map(r => r.ingredients).flat().map(r => r.category)
      const uniqueCategoryNames = [...new Set(categoryNames)]
      console.log({uniqueIngredientNames, uniqueCategoryNames})

      const nameToCategory = {}
      ingredients.forEach(ing => nameToCategory[ing.name] = ing.category)

      return {
        uniqueIngredientNames: [...uniqueIngredientNames],
        uniqueCategories: [...uniqueCategoryNames],
        nameToCategory: nameToCategory
      }
    }
    fetchRecipes()
      .then(res => {
        setSuggestions(res.uniqueIngredientNames)
        setCategorySuggestions(res.uniqueCategories)
        setNameToCategory(res.nameToCategory)
      })
  }, [])

  const tryAddRecipe = async (recipe) => {
    const errors = []

    if (recipe.name === undefined || !recipe.name.trim().length) {
      errors.push("Musisz wypełnic pole 'Nazwa'!");
    }
    if (recipe.ingredients.length === 0) {
      errors.push("Przepis musi posiadac przynajmniej 1 składnik!");
    }

    recipe.ingredients.forEach((ingredient, index) => {
      if (ingredient.name === undefined || !ingredient.name.trim().length) {
        errors.push(`Brakuje nazwy jakiegoś składnika! (id=${index})`)
      }
      if (Number(ingredient.quantity) <= 0) {
        errors.push(`Jakiś składnik ma quantity mniejsze lub równe 0 (id=${index})`)
      }
      if (ingredient.category === undefined || ingredient.category.trim().length === 0) {
        errors.push(`Brakuje kategorii jakiegoś składnika! (id=${index})`)
      }
    })

    if (errors.length > 0) {
      alert(errors.map(e => "- " + e).join("\n"))
      return;
    }
    if (errors.length === 0) {
      await addRecipe(recipe)
      alert('Dodane!')
    }
  }

  return (
    <div>
      <Navbar/>
      <div className="container">
        <FormControl>
          <div>
            <h1>Przepis</h1>
            <div>
              <TextField
                label="Nazwa"
                type="text"
                error={recipe.name === undefined || !recipe.name.trim().length}
                placeholder="Nazwa przepisu"
                value={recipe.name}
                onChange={e => setRecipe({...recipe, name: e.target.value})}
              />
            </div>
            <div>
              <TextField
                label="Link (opcjonalnie)"
                type="url"
                placeholder="Link do przepisu"
                value={recipe.videoUrl}
                onChange={e => setRecipe({...recipe, videoUrl: e.target.value})}
              />
            </div>
            <h2>Składniki</h2>
            {recipe.ingredients.map((ingredient, i) => (
              <div key={i}>
                <div className="ingredient-container">
                  <Autocomplete
                    freeSolo
                    id="ingredient-name"
                    options={suggestions}
                    sx={{width: 300}}
                    onInputChange={(e, newValue) => {
                      recipe.ingredients[i].name = newValue
                      //if newValue is in IngredientsNameToCategory
                      if (nameToCategory[newValue] !== undefined) {
                        recipe.ingredients[i].category = nameToCategory[newValue]
                      } else {
                        recipe.ingredients[i].category = ''
                      }
                      setRecipe({...recipe})
                    }}
                    renderInput={(params) => <TextField
                      {...params}
                      label="Nazwa składnika"
                      error={ingredient.name === undefined || !ingredient.name.trim().length}
                      onChange={e => {
                        recipe.ingredients[i].name = e.target.value;
                        setRecipe({...recipe})
                      }}/>}
                  />
                  <TextField
                    type="number"
                    label="Ilość"
                    error={ingredient.quantity === undefined || ingredient.quantity.trim().length == 0 || isNaN(ingredient.quantity)}
                    name="quantity"
                    placeholder="tylko liczba"
                    value={ingredient.quantity}
                    onChange={e => {
                      recipe.ingredients[i].quantity = e.target.value
                      setRecipe({...recipe})
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        type="checkbox"
                        name="isRarelyBought"
                        checked={ingredient.isRarelyBought}
                        onChange={e => {
                          recipe.ingredients[i].isRarelyBought = !ingredient.isRarelyBought
                          setRecipe({...recipe})
                        }}
                      />
                    }
                    labelPlacement="start"
                    label="Rzadko kupowany?"/>
                  <Autocomplete
                    freeSolo
                    id="ingredient-category"
                    value={ingredient.category}
                    options={categorySuggestions}
                    sx={{width: 300}}
                    onInputChange={(e, newValue) => {
                      recipe.ingredients[i].category = newValue
                      setRecipe({...recipe})
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Kategoria"
                        error={ingredient.category === undefined || !ingredient.category.trim().length}
                        onChange={e => {
                          recipe.ingredients[i].category = e.target.value;
                          setRecipe({...recipe})
                        }}/>
                    )}

                  />
                  <Button variant="contained" color="error" onClick={() => handleRemoveIngredient(i)}>Remove</Button>
                </div>
              </div>
            ))}
            <Button variant="contained" onClick={handleAddIngredient}>Add Ingredient</Button>
          </div>
          <h1>Sprawdź wszystko dokładnie!</h1>
        </FormControl>
        <div className={"submitGame"}>
          <Button variant="contained" onClick={e => tryAddRecipe(recipe)}>Dodaj Przepis!</Button>
        </div>
      </div>
    </div>
  )
}

export default AddRecipe;