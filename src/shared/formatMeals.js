// Функция для распределения продуктов по приёмам пищи и их форматирования
export function formatMeals(products) {
  const meals = {
    breakfast: [],
    lunch: [],
    dinner: [],
    night: [],
  };

  products.forEach((item) => {
    const date = new Date(item.date);
    const hours = date.getHours();

    if (hours >= 6 && hours < 11) {
      meals.breakfast.push(item);
    } else if (hours >= 12 && hours < 16) {
      meals.lunch.push(item);
    } else if (hours >= 18 && hours < 22) {
      meals.dinner.push(item);
    } else {
      meals.night.push(item); // Все, что попадает в ночной период
    }
  });

  const formatMeal = (mealArray, mealName) => {
    if (mealArray.length === 0) return `${mealName}: нет данных\n`;

    return mealArray
      .map((item) => {
        return `Продукт: ${item.product}
  Вес: ${item.grams} г
  Калории: ${item.calories} ккал
  Белки: ${item.proteins} г
  Жиры: ${item.fats} г
  Углеводы: ${item.carbohydrates} г
  Дата: ${new Date(item.date).toLocaleString()}
  `;
      })
      .join("\n");
  };

  return `
  Завтрак:

  ${formatMeal(meals.breakfast, "Завтрак")}
  
  Обед:

  ${formatMeal(meals.lunch, "Обед")}
  
  Ужин:

  ${formatMeal(meals.dinner, "Ужин")}
  
  Ночь:

  ${formatMeal(meals.night, "Ночь")}
  `;
}
