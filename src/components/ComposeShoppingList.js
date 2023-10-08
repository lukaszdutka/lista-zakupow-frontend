import Navbar from "./Navbar";
import "./ComposeShoppingList.css";
import {getRecipes} from "../api/api";
import React, {useEffect, useState} from "react";
import {Box, Button, Grid, List, ListItem, Paper, Tooltip, Typography} from "@mui/material";

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
      <Box className="container" sx={{bgcolor: 'antiquewhite', p: 3}}>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Paper elevation={3} sx={{p: 2}}>
              <Typography variant="h6" gutterBottom>
                Dostępne Przepisy
              </Typography>
              <List>
                {recipes.map((recipe, index) => (
                  <ListItem key={index}>
                    <Tooltip title={createTooltip(recipe)} arrow>
                      <Typography>{recipe.name}</Typography>
                    </Tooltip>
                    <Button variant="contained" color="primary" onClick={() => addRecipe(recipe)}>
                      Add
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={3} sx={{p: 2}}>
              <Typography variant="h6" gutterBottom>
                Menu
              </Typography>
              <List>
                {shoppingList.map((recipe, index) => (
                  <ListItem key={index}>
                    {recipe.name} <Button variant="contained" color="secondary" onClick={() => removeRecipe(index)}>
                    Remove
                  </Button>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={3} sx={{p: 2}}>
              <Typography variant="h6" gutterBottom>
                Lista zakupów
              </Typography>
              {Object.entries(totalIngredients).map(([category, ingredients], index) => (
                <Box key={index}>
                  <Typography variant="subtitle1" gutterBottom>
                    {category}
                  </Typography>
                  <List>
                    {Object.entries(ingredients).map(([name, quantity], i) => (
                      <ListItem key={i}>{name}: {quantity}</ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default ComposeShoppingList;