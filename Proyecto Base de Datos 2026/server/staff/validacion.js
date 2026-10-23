"use strict";
                                                                           
function parseDate(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error(`${label} inválida`);
  const [y,m,d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y,m-1,d));
  if (date.getUTCFullYear()!==y || date.getUTCMonth()!==m-1 || date.getUTCDate()!==d) throw Error(`${label} inválida`);
  return date;
}
function differenceInYears(birth,onDate) {
  const b = typeof birth==='string'?parseDate(birth,'Fecha de nacimiento'):birth;
  const t = typeof onDate==='string'?parseDate(onDate,'Fecha de contratación'):onDate;
  let years=t.getUTCFullYear()-b.getUTCFullYear();
  if(t.getUTCMonth()<b.getUTCMonth() || (t.getUTCMonth()===b.getUTCMonth()&&t.getUTCDate()<b.getUTCDate())) years--;
  return years;
}
function validateHire(birth,start,today) {
  const b = parseDate(birth,'Fecha de nacimiento'), s = parseDate(start,'Fecha de contratación'), now=parseDate(today,'Fecha actual');
  if(b>now) throw Error('La fecha de nacimiento no puede estar en el futuro');
  if(s>now) throw Error('La fecha de contratación no puede estar en el futuro');
  if(differenceInYears(b,s)<18) throw Error('Solo se permite contratar personas de 18 años o más en la fecha de contratación');
  return differenceInYears(b,now);
}
module.exports={parseDate,differenceInYears,validateHire};
