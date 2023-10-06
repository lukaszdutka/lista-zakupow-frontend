import Navbar from "./Navbar";

import "./ComposeShoppingList.css"
import {getRecipes} from "../api/api";
import React, {useEffect, useState} from "react";
import {Button, List, ListItem, Tooltip, Typography} from "@mui/material";

function ComposeShoppingList() {
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [totalIngredients, setTotalIngredients] = useState({});

  const addRecipe = (recipe) => {
    setShoppingList([...shoppingList, recipe]);
    updateTotalIngredients(recipe.ingredients, 'add');
  };

  const removeRecipe = (index) => {
    const recipe = shoppingList[index];
    setShoppingList(shoppingList.filter((_, i) => i !== index));
    updateTotalIngredients(recipe.ingredients, 'remove');
  };

  function threeDecimals(number) {
    return Math.round(number * 1000) / 1000;
  }

  const updateTotalIngredients = (ingredients, action) => {
    const updatedIngredients = {...totalIngredients};
    ingredients.forEach(ingredient => {
      if (action === 'add') {
        if (updatedIngredients[ingredient.category]) {
          updatedIngredients[ingredient.category][ingredient.name] =
            threeDecimals(Number(updatedIngredients[ingredient.category][ingredient.name] || 0) + Number(ingredient.quantity));
        } else {
          updatedIngredients[ingredient.category] = {[ingredient.name]: ingredient.quantity};
        }
      } else if (action === 'remove' && updatedIngredients[ingredient.category]) {
        updatedIngredients[ingredient.category][ingredient.name] = threeDecimals(updatedIngredients[ingredient.category][ingredient.name] - ingredient.quantity);
        if (updatedIngredients[ingredient.category][ingredient.name] <= 0) {
          delete updatedIngredients[ingredient.category][ingredient.name];
          if (JSON.stringify(updatedIngredients[ingredient.category]) === "{}") {
            delete updatedIngredients[ingredient.category]
          }
        }
      }
    });
    setTotalIngredients(updatedIngredients);
  };

  useEffect(() => {
    getRecipes().then(r => setRecipes(r))
  }, []);

  function createTooltip(recipe) {
    return (
      <React.Fragment>
        {recipe.videoUrl ? <a href={recipe.videoUrl}>instrukcja</a> : ""}
        {
          recipe.ingredients.map(ing => {
            return <div key={ing.name}>{ing.quantity}x - {ing.name}</div>
          })
        }
      </React.Fragment>
    );
  }

  return (
    <div>
      <Navbar/>
      <div className="container">
        <h1>Hosting on: https://render.com/docs/free</h1>

        <div className="row">
          <div className="column">
            <Typography variant="h6">Dostępne Przepisy</Typography>
            <List>
              {recipes.map((recipe, index) => (
                <ListItem key={index}>
                  <Tooltip title={createTooltip(recipe)} arrow>
                    <Typography>{recipe.name}</Typography>
                  </Tooltip>
                  <Button onClick={() => addRecipe(recipe)}>Add</Button>
                </ListItem>
              ))}
            </List>
          </div>
          <div className="column">

            <Typography variant="h6">Menu</Typography>
            <List>
              {shoppingList.map((recipe, index) => (
                <ListItem key={index}>
                  {recipe.name} <Button onClick={() => removeRecipe(index)}>Remove</Button>
                </ListItem>
              ))}
            </List>

          </div>
          <div className="column">

            <Typography variant="h6">Lista zakupów</Typography>
            {Object.entries(totalIngredients).map(([category, ingredients], index) => (
              <div key={index}>
                <Typography variant="subtitle1">{category}</Typography>
                <List>
                  {Object.entries(ingredients).map(([name, quantity], i) => (
                    <ListItem key={i}>{name}: {quantity}</ListItem>
                  ))}
                </List>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComposeShoppingList;