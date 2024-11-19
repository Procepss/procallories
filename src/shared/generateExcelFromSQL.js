import ExcelJS from "exceljs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

// Получаем путь к текущему файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function generateExcelFromSQL(result) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Продукты");

  // Определяем заголовки таблицы на основе полей
  worksheet.columns = [
    { header: "Продукт", key: "product", width: 25 },
    { header: "Граммы", key: "grams", width: 10 },
    { header: "Калории", key: "calories", width: 10 },
    { header: "Б", key: "proteins", width: 10 },
    { header: "Ж", key: "fats", width: 10 },
    { header: "У", key: "carbohydrates", width: 15 },
    { header: "Дата", key: "date", width: 20 },
  ];

  // Добавляем данные в таблицу
  result.rows.forEach((row) => {
    worksheet.addRow({
      product: row.product,
      grams: row.grams,
      calories: row.calories,
      proteins: row.proteins,
      fats: row.fats,
      carbohydrates: row.carbohydrates,
      date: new Date(row.date).toLocaleString(), // Преобразуем дату в строку
    });
  });

  // Определяем путь к файлу
  const filePath = join(dirname(__dirname), "xls", "Дневник.xlsx");

  // Проверяем, существует ли директория, и если нет, создаем её
  const dir = dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Сохраняем Excel-файл
  await workbook.xlsx.writeFile(filePath);

  return filePath; // Возвращаем полный путь к файлу
}
