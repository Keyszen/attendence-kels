import fs from 'fs';

const files = ['src/pages/Login.tsx', 'src/pages/EmployeeDashboard.tsx', 'src/pages/AdminDashboard.tsx'];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from-\[#B8860B\] to-\[#D4AF37\] text-black/g, 'from-[#5C1616] to-[#7A2021] text-[#E8DCC4]');
  content = content.replace(/hover:from-\[#D4AF37\] hover:to-\[#F1C40F\]/g, 'hover:from-[#7A2021] hover:to-[#9B292A]');
  content = content.replace(/#D4AF37/g, '#C8B6A6');
  content = content.replace(/rgba\(212,175,55/g, 'rgba(200,182,166');
  content = content.replace(/#B8860B/g, '#5C1616');
  content = content.replace(/#F1C40F/g, '#9B292A');
  fs.writeFileSync(file, content);
});
console.log('Done');
