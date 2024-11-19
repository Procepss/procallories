export const getCalcMessage = (data) => {
  const { product, grams, calories, proteins, fats, carbohydrates } = data;

  return `Запись сделана в ваш дневник, шеф!
    
    Продукт: ${product}
    Кол-во: ${grams} г
    Белки: ${proteins} г
    Жиры: ${fats} г
    Углеводы: ${carbohydrates} г
    Калории: ${calories}`;
};
