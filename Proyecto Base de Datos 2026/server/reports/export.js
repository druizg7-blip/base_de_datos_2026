"use strict";
const {fgEtiq,fgMonetario,fgFormato,fgPeriodo,fgResumen}=require("./format");
async function exportReport(res, rows, def, format, filtros = {}) {
  rows = Array.isArray(rows) ? rows : [];

  const claves = Object.keys(rows[0] || { RESULTADO: "" });

  const generado = new Intl.DateTimeFormat("es-GT", {
    timeZone: "America/Guatemala",
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date());

  const periodo = fgPeriodo(def, filtros);
  const resumen = fgResumen(rows);

  const nombre = def.title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9_-]+/g, "_");

  if (format === "xlsx") {
    const ExcelJS = require("exceljs");
    const book = new ExcelJS.Workbook();

    book.creator = "La Casa del Constructor de Derek";
    book.created = new Date();

    const ws = book.addWorksheet("Reporte", {
      views: [{ state: "frozen", ySplit: 7 }],
      pageSetup: {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1
      }
    });

    ws.columns = claves.map(k => ({
      key: k,
      width: Math.min(
        45,
        Math.max(
          18,
          fgEtiq(k).length + 10,
          ...rows.slice(0, 100).map(
            r => Math.min(45, fgFormato(r[k], k).length + 3)
          )
        )
      )
    }));

    const ultima = ws.getColumn(claves.length).letter;

    if (claves.length > 1) {
      for (const fila of [1, 2, 3, 4, 5]) {
        ws.mergeCells(`A${fila}:${ultima}${fila}`);
      }
    }

    ws.getCell("A1").value =
      "LA CASA DEL CONSTRUCTOR DE DEREK  |  REPORTES";

    ws.getCell("A2").value = def.title;
    ws.getCell("A3").value = `Generado: ${generado}`;
    ws.getCell("A4").value = `Periodo: ${periodo}`;
    ws.getCell("A5").value = resumen;

    for (const n of [1, 2]) {
      const celda = ws.getCell(`A${n}`);

      celda.font = {
        bold: true,
        size: n === 1 ? 15 : 13,
        color: { argb: "FFFFFFFF" }
      };

      celda.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: n === 1 ? "FF181818" : "FF252525"
        }
      };

      ws.getRow(n).height = 29;
    }

    for (const n of [3, 4, 5]) {
      ws.getCell(`A${n}`).font = {
        size: 10,
        color: { argb: "FF505050" }
      };

      ws.getRow(n).height = 20;
    }

    const cabecera = ws.getRow(7);
    cabecera.values = claves.map(fgEtiq);
    cabecera.height = 26;

    cabecera.eachCell(c => {
      c.font = {
        bold: true,
        color: { argb: "FFFFFFFF" }
      };

      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF252525" }
      };

      c.alignment = {
        vertical: "middle",
        wrapText: true
      };
    });

    if (rows.length) {
      rows.forEach((r, index) => {
        const fila = ws.addRow(
          claves.map(k => r[k] === undefined ? null : r[k])
        );

        fila.height = 23;

        fila.eachCell({ includeEmpty: true }, (c, i) => {
          const k = claves[i - 1];

          if (index % 2 === 1) {
            c.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF4F4F4" }
            };
          }

          c.alignment = { vertical: "middle" };

          if (typeof c.value === "number") {
            c.alignment = {
              horizontal: "right",
              vertical: "middle"
            };

            c.numFmt = fgMonetario(k)
              ? '"Q "#,##0.00;[Red]("Q "#,##0.00)'
              : Number.isInteger(c.value) ? '#,##0' : '#,##0.00';

          } else if (c.value instanceof Date) {
            c.numFmt = "dd/mm/yyyy";
          }
        });
      });

      ws.autoFilter = {
        from: "A7",
        to: `${ultima}${7 + rows.length}`
      };

    } else {
      ws.getCell("A8").value =
        "No hay resultados para los filtros seleccionados.";
    }

    ws.headerFooter.oddFooter = "La Casa del Constructor de Derek - &P / &N";

    res.attachment(`${nombre}.xlsx`);
    res.type(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await book.xlsx.write(res);
    return res.end();
  }

                  
  const PDFDocument = require("pdfkit");

  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 35,
    bufferPages: true
  });

  res.attachment(`${nombre}.pdf`);
  res.type("application/pdf");

  doc.pipe(res);

  const margen = 35;
  const ancho = doc.page.width - margen * 2;

  const color = {
    oscuro: "#181818",
    verde: "#252525",
    tenue: "#F4F4F4",
    linea: "#DEDEDE",
    texto: "#252525"
  };

                                             
  const grupos = [];

  for (let i = 0; i < claves.length; i += 7) {
    grupos.push(claves.slice(i, i + 7));
  }

  function cabeceraPagina(numeroGrupo) {
    const w = doc.page.width;

    doc.rect(0, 0, w, 64).fill(color.oscuro);

    doc.fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(13)
      .text("La Casa del Constructor de Derek", margen, 21, {
        lineBreak: false
      });

    doc.fontSize(13)
      .text(def.title, 325, 23, {
        width: w - 365,
        lineBreak: false,
        ellipsis: true
      });

    doc.fillColor(color.texto)
      .font("Helvetica")
      .fontSize(9)
      .text(`Generado: ${generado}`, margen, 78);

    doc.text(`Periodo: ${periodo}`, margen, 94, {
      width: ancho
    });

    doc.font("Helvetica-Bold")
      .text(resumen, margen, 111, {
        width: ancho
      });

    if (grupos.length > 1) {
      doc.font("Helvetica")
        .fontSize(8)
        .text(
          `Columnas: parte ${numeroGrupo} de ${grupos.length}`,
          margen,
          128
        );
    }

    return 153;
  }

                                                                     
                                                                                    
  function graficosGerenciales() {
    if (!rows.length || rows.length > 8) return false;
    const preferidos = ['TOTAL_VENDIDO','TOTAL_COMPRADO','UNIDADES_VENDIDAS','FACTURAS','ENVIOS','SALDO'];
    const campoValor = preferidos.find(k => rows.some(r => typeof r[k]==='number')) ||
      claves.find(k => rows.some(r => typeof r[k]==='number') && !/^ID_|^RANKING$/.test(k));
    const campoTexto = ['CLIENTE','PRODUCTO','SUCURSAL','NOMBRE','VENDEDOR','REGION','PAIS','CODIGO']
      .find(k => rows.some(r => typeof r[k]==='string'));
    if (!campoValor || !campoTexto) return false;
    const datos = rows.map((r,i) => ({
      etiqueta:String(r[campoTexto]||'Registro '+(i+1)),
      valor:Math.max(0,Number(r[campoValor])||0)
    }));
    const suma=datos.reduce((a,b)=>a+b.valor,0);
    const max=Math.max(1,...datos.map(d=>d.valor));
    const tonos=['#171717','#444444','#777777','#999999','#bbbbbb','#dddddd','#666666','#aaaaaa'];
    const yTitulo=151, xCentro=105, yCentro=242, radio=48;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(color.texto)
      .text('Distribucion',margen,yTitulo,{lineBreak:false});
    let angulo=-90;
    if(suma>0) {
      datos.forEach((d,i)=>{
        if(d.valor<=0)return;
        const paso=d.valor/suma*360;
        doc.save().strokeColor(tonos[i]).lineWidth(18)
          .arc(xCentro,yCentro,radio,angulo,angulo+paso).stroke().restore();
        angulo+=paso;
      });
    } else {
      doc.circle(xCentro,yCentro,radio).lineWidth(17).strokeColor('#eeeeee').stroke();
    }
    const legendX=182;
    datos.slice(0,5).forEach((d,i)=>{
      const y=195+i*23;
      doc.rect(legendX,y,8,8).fill(tonos[i]);
      doc.fillColor(color.texto).font('Helvetica').fontSize(8)
        .text(d.etiqueta.slice(0,25),legendX+14,y,{width:121,lineBreak:false,ellipsis:true});
      doc.font('Helvetica-Bold').text(suma?Math.round(d.valor/suma*100)+'%':'0%',legendX+130,y,{width:29,align:'right',lineBreak:false});
    });
    doc.font('Helvetica-Bold').fontSize(9).fillColor(color.texto)
      .text('Resumen de resultados',360,yTitulo,{lineBreak:false});
    doc.font('Helvetica-Bold').fontSize(23)
      .text(fgFormato(suma,campoValor),360,184,{width:176,lineBreak:false,ellipsis:true});
    doc.font('Helvetica').fontSize(9)
      .text(fgEtiq(campoValor),360,219,{width:170});
    doc.fillColor('#646464').fontSize(9)
      .text(`${rows.length} registros obtenidos desde Oracle`,360,247,{width:166});
    doc.font('Helvetica-Bold').fontSize(9).fillColor(color.texto)
      .text('Comparacion',567,yTitulo,{lineBreak:false});
    datos.slice(0,5).forEach((d,i)=>{
      const y=183+i*25;
      doc.font('Helvetica').fontSize(7.5).fillColor('#454545')
        .text(d.etiqueta.slice(0,22),567,y,{width:105,lineBreak:false,ellipsis:true});
      doc.rect(677,y+1,Math.max(1,d.valor/max*119),8).fill(tonos[i]);
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(color.texto)
        .text(String(d.valor),796,y,{width:30,lineBreak:false});
    });
    doc.moveTo(margen,323).lineTo(margen+ancho,323)
      .strokeColor(color.linea).lineWidth(.6).stroke();
    return true;
  }

  function anchosColumnas(cols) {
    const pesos = cols.map(k => {
      if (/NOMBRE|PRODUCTO|DIRECCION|DESCRIPCION|SUCURSAL|DEPARTAMENTO|PAIS|REGION/.test(k)) {
        return 1.6;
      }

      if (/FECHA|TOTAL_VENDIDO/.test(k)) {
        return 1.15;
      }

      return 1;
    });

    const total = pesos.reduce((s, n) => s + n, 0);

    return pesos.map(n => ancho * n / total);
  }

  function dibujarTitulos(cols, y, widths) {
    doc.rect(margen, y, ancho, 28).fill(color.verde);

    let x = margen;

    cols.forEach((k, i) => {
      doc.fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(fgEtiq(k), x + 7, y + 7, {
          width: widths[i] - 14,
          height: 17,
          ellipsis: true,
          lineBreak: false
        });

      x += widths[i];
    });

    return y + 28;
  }

  for (
    let indiceGrupo = 0;
    indiceGrupo < grupos.length;
    indiceGrupo++
  ) {
    if (indiceGrupo) doc.addPage();

    const cols = grupos[indiceGrupo];
    const widths = anchosColumnas(cols);

    let y = cabeceraPagina(indiceGrupo + 1);
    if (indiceGrupo===0 && graficosGerenciales()) y=335;
    y = dibujarTitulos(cols, y, widths);

    if (!rows.length) {
      doc.fillColor(color.texto)
        .font("Helvetica")
        .fontSize(10)
        .text(
          "No hay resultados para los filtros seleccionados.",
          margen,
          y + 20
        );
    }

    rows.forEach((r, n) => {
      if (y + 30 > doc.page.height - 55) {
        doc.addPage();

        y = cabeceraPagina(indiceGrupo + 1);
        y = dibujarTitulos(cols, y, widths);
      }

      doc.rect(margen, y, ancho, 30)
        .fill(n % 2 === 0 ? "#FFFFFF" : color.tenue);

      let x = margen;

      cols.forEach((k, i) => {
        doc.font("Helvetica")
          .fontSize(8)
          .fillColor(color.texto)
          .text(fgFormato(r[k], k), x + 6, y + 7, {
            width: widths[i] - 12,
            height: 18,
            ellipsis: true,
            lineBreak: false,
            align: typeof r[k] === "number"
              ? "right"
              : "left"
          });

        x += widths[i];
      });

      doc.moveTo(margen, y + 30)
        .lineTo(margen + ancho, y + 30)
        .strokeColor(color.linea)
        .lineWidth(0.45)
        .stroke();

      y += 30;
    });
  }

                           
  const rango = doc.bufferedPageRange();

  for (let i = 0; i < rango.count; i++) {
    doc.switchToPage(rango.start + i);

    doc.font("Helvetica")
      .fontSize(8)
      .fillColor("#686868")
      .text(
        `La Casa del Constructor de Derek | Pagina ${i + 1} de ${rango.count}`,
        margen,
        doc.page.height - 65,
        {
          width: ancho,
          align: "right",
          lineBreak: false
        }
      );
  }

  doc.end();
}

module.exports={exportReport};
