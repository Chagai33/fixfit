
import XLSX from 'xlsx';
const workbook = XLSX.readFile('public/data/data.xlsx');
const usersSheet = workbook.Sheets['Users'];
if (!usersSheet) {
  console.log('Users sheet not found');
} else {
  const data = XLSX.utils.sheet_to_json(usersSheet);
  console.log('Users found in "Users" sheet:');
  console.log(JSON.stringify(data, null, 2));
  console.log('\nAll sheets in workbook:');
  console.log(workbook.SheetNames);
}
