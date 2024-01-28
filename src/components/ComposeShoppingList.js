import Navbar from "./Navbar";
import "./ComposeShoppingList.css";
import {getRecipes} from "../api/api";
import React, {useEffect, useState} from "react";
import {Box, Button, Grid, List, ListItem, Paper, Tooltip, Typography} from "@mui/material";
import {Link} from "react-router-dom";

function ComposeShoppingList() {
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [totalIngredients, setTotalIngredients] = useState([]);

  const addRecipe = (recipe) => {
    setShoppingList([...shoppingList, recipe]);
    updateTotalIngredients(recipe.ingredients, 'add');
  };

  const removeRecipe = (index) => {
    const recipe = shoppingList[index];
    setShoppingList(shoppingList.filter((_, i) => i !== index));
    updateTotalIngredients(recipe.ingredients, 'remove');
  };

  // function threeDecimals(number) {
  //   return Math.round(number * 1000) / 1000;
  // }

  const updateTotalIngredients = (ingredients, action) => {
    const updatedIngredients = [...totalIngredients];

    ingredients.forEach(ingredient => {
      const existingIngredient = updatedIngredients.find(i => i.id === ingredient.id);
      if (action === 'add') {
        if (!existingIngredient) {
          updatedIngredients.push({
            id: ingredient.id,
            name: ingredient.name,
            category: ingredient.category,
            quantity: ingredient.quantity,
            unit: ingredient.unit
          })
        } else {
          existingIngredient.quantity += ingredient.quantity
        }
      }
      if (action === 'remove' && existingIngredient) {
        existingIngredient.quantity -= ingredient.quantity
      }
    });
    console.log({entries: groupBy(updatedIngredients, "category")});
    setTotalIngredients(updatedIngredients.filter(i => i.quantity > 0));
  };

  useEffect(() => {
    getRecipes().then(r => setRecipes(r))
  }, []);

  const createTooltip = (recipe) => {
    return (
      <React.Fragment>
        {recipe.videoUrl ?
          <Typography><Link to={recipe.videoUrl} target="_blank">link do instrukcji</Link></Typography> : ""}
        <div>
          {recipe.ingredients.map(ing => <div key={ing.name}>{ing.quantity}x - {ing.name}</div>)}
        </div>
      </React.Fragment>
    );
  }

  function changeQuantity(ingredientId, change) {
    return () => {
      totalIngredients.find(i => i.id === ingredientId).quantity += change
      setTotalIngredients([...totalIngredients])
    };
  }

  const groupBy = (list, by) => list.reduce((group, item) => {
    const value = item[by]
    group[value] = group[value] ?? [];
    group[value].push(item);
    return group;
  }, {});

  function generateList(totalIngredients) {
    //todo: refactor it into state that rerenders only on "lista zakupów" change
    let finalString = '';
    for (const [category, ingredients] of Object.entries(groupBy(totalIngredients, "category"))) {
      finalString += category.charAt(0).toUpperCase() + category.slice(1) + "\n";
      for (const ingredient of ingredients) {
        finalString += "\t" + ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1) + ` x ${ingredient.quantity}${ingredient.unit}\n`;
      }
    }
    return finalString;
  }

  return (
    <div>
      <Navbar/>
      <Box className="container" sx={{bgcolor: 'antiquewhite', p: 3}}>
        <Grid container spacing={3}>
          <Grid item xs={5}>
            <Paper elevation={3} sx={{p: 2}}>
              <Typography variant="h6" gutterBottom>Dostępne Przepisy</Typography>
              <List>
                {recipes.map((recipe, index) => (
                  <ListItem key={index}>
                    <Tooltip title={createTooltip(recipe)} arrow>
                      <Typography>{recipe.name}</Typography>
                    </Tooltip>
                    <Box sx={{'margin-left': 'auto'}}>
                      <Button variant="contained" color="primary" onClick={() => addRecipe(recipe)}>Add</Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper elevation={3} sx={{p: 2}}>
              <Typography variant="h6" gutterBottom>Menu</Typography>
              <List>
                {shoppingList.map((recipe, index) => (
                  <ListItem key={index}>
                    <Typography>
                      {recipe.name}
                    </Typography>
                    <Box sx={{'margin-left': 'auto'}}>
                      <Button variant="contained" color="secondary" onClick={() => removeRecipe(index)}>Remove</Button>
                    </Box>
                    {recipe.videoUrl ? <div>{recipe.videoUrl}</div> : ""}
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
              {
                Object.entries(groupBy(totalIngredients, "category")).map(([key, value]) => (
                  <Box key={key}>
                    <Typography variant="subtitle1" gutterBottom>
                      {key}
                    </Typography>
                    <List>
                      {value.map(ing => (
                        <ListItem key={ing.id}>
                          <Typography>{ing.name}: {ing.quantity} {ing.unit}</Typography>
                          <Box sx={{'margin-left': 'auto'}}>
                            <Button variant="contained" color="primary"
                                    onClick={changeQuantity(ing.id, 1)}>+1</Button>
                            <Button variant="contained" color="primary"
                                    onClick={changeQuantity(ing.id, -1)}>-1</Button>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))
              }
            </Paper>
          </Grid>
          <Typography whiteSpace={'pre-wrap'}>{generateList(totalIngredients)}</Typography>
        </Grid>
      </Box>
    </div>
  )
}

export default ComposeShoppingList;