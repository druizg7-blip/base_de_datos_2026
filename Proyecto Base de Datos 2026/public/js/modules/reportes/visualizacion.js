                                                                                     
import { escape } from '../../core/state.js';
import { dataTable } from '../../core/ui.js';
const palette = ['#141414','#434343','#686868','#989898','#c3c3c3','#dedede'];
const fmt = (n) => new Intl.NumberFormat('es-GT',{maximumFractionDigits:2}).format(Number(n)||0);
const currency = (n) => new Intl.NumberFormat('es-GT',{style:'currency',currency:'GTQ'}).format(Number(n)||0);
function keysFor(rows, reportKey) {
  const first=rows[0]||{};
  const desired = ({'ventas-sucursal':'TOTAL_VENDIDO','productos':'UNIDADES_VENDIDAS','productos-menos':'UNIDADES_VENDIDAS','clientes-region':'TOTAL_COMPRADO','vendedores-area':'TOTAL_VENDIDO','envios':'ENVIOS','cxc':'SALDO','cxp':'SALDO'})[reportKey];
  const numeric=Object.keys(first).filter(k=>typeof first[k]==='number'&&!/^ID_|^RANKING$/.test(k));
  const key=numeric.includes(desired)?desired:numeric.find(k=>/TOTAL|MONTO|UNIDADES|FACTURAS|ENVIOS|CANTIDAD|SALDO|VENTAS/.test(k))||numeric[0];
  const preferred = reportKey==='clientes-region'?['CLIENTE','REGION','PAIS']:reportKey==='productos'||reportKey==='productos-menos'?['PRODUCTO','CODIGO']:['SUCURSAL','NOMBRE','VENDEDOR','REGION','CLIENTE','PAIS','PRODUCTO'];
  const name=preferred.find(k=>typeof first[k]==='string')||Object.keys(first).find(k=>typeof first[k]==='string'&&!/FECHA|ESTADO/.test(k));
  return {key,name};
}
function visualizacion(rows, reportKey, title) {
  if(!Array.isArray(rows)||!rows.length) return '<div class="empty">Sin datos para los filtros seleccionados.</div>';
  const {key,name}=keysFor(rows,reportKey);
  if(!key||!name) return `<h2>${escape(title)}</h2>${dataTable(rows)}`;
  const items=rows.slice(0,8).map((row,i)=>({
    label:String(row[name]||'Sin nombre'),value:Math.max(0,Number(row[key])||0), color:palette[i%palette.length]
  }));
  const total=items.reduce((s,i)=>s+i.value,0);
  const max=Math.max(1,...items.map(i=>i.value));
  let angle=0;
  const gradient=items.map(item=>{
    const end=angle+(total?item.value/total*100:0), stop=`${item.color} ${angle.toFixed(3)}% ${end.toFixed(3)}%`;
    angle=end;return stop;
  }).join(',');
  const pieStyle=total?`background:conic-gradient(${gradient})`:'background:#e7e7e7';
  const monetary=/TOTAL|MONTO|SALDO|COSTO|PRECIO|INGRESO/.test(key);
  const display=n=>monetary?currency(n):fmt(n);
  return `<div class="report-sheet">
    <div class="report-top">
      <div class="report-box"><h3>Distribución · ${escape(title)}</h3><p>Participación de los resultados consultados</p><div class="report-pie-flex"><div class="report-pie" style="${pieStyle}" role="img" aria-label="Distribución según ${escape(key)}"></div><div class="report-legend">${items.map(i=>`<div><span><i style="background:${i.color}"></i>${escape(i.label.slice(0,35))}</span><strong>${total?(100*i.value/total).toFixed(1):'0'}%</strong></div>`).join('')}</div></div></div>
      <div class="report-box"><h3>Resumen</h3><div class="report-stat">${display(rows.reduce((sum,r)=>sum+(Number(r[key])||0),0))}</div><div class="report-mini">Total de ${escape(key.toLowerCase().replaceAll('_',' '))}</div><p><strong>${rows.length}</strong> registros encontrados. ${total?'La mayor participación corresponde a '+escape(items.reduce((m,i)=>i.value>m.value?i:m,items[0]).label)+'.':'No hay movimiento registrado en este periodo.'}</p></div>
    </div>
    <div class="report-bottom">
      <div class="report-box"><h3>Comparación</h3><p>${escape(key.replaceAll('_',' ').toLowerCase())} por registro</p><div class="report-columns">${items.map(i=>`<div class="report-col"><strong>${fmt(i.value)}</strong><span style="height:${Math.max(2,(i.value/max)*170)}px;background:${i.color}"></span><small title="${escape(i.label)}">${escape(i.label.slice(0,18))}</small></div>`).join('')}</div></div>
      <div class="report-box report-table"><h3>Detalle del reporte</h3>${dataTable(rows)}</div>
    </div>
  </div>`;
}
export { visualizacion,keysFor };
