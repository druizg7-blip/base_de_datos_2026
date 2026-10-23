SELECT
    (SELECT COUNT(*)
     FROM USER_OBJECTS
     WHERE STATUS = 'INVALID') AS objetos_invalidos,

    (SELECT COUNT(*)
     FROM PRODUCTO_SUCURSAL
     WHERE EXISTENCIA < 0) AS stock_negativo,

    (SELECT COUNT(*)
     FROM ENVIO e
     WHERE e.ESTADO_REGISTRO = 'A'
       AND NOT EXISTS (
           SELECT 1 FROM DETALLE_ENVIO de
           WHERE de.ID_ENVIO = e.ID_ENVIO
             AND de.ESTADO_REGISTRO = 'A'
       )) AS envios_sin_productos,

    (SELECT COUNT(*)
     FROM DETALLE_ENVIO de
     JOIN ENVIO e ON e.ID_ENVIO = de.ID_ENVIO
     JOIN DETALLE_FACTURA df
       ON df.ID_DETALLE_FACTURA = de.ID_DETALLE_FACTURA
     WHERE e.ID_FACTURA <> df.ID_FACTURA
       AND e.ESTADO_REGISTRO = 'A'
       AND de.ESTADO_REGISTRO = 'A'
    ) AS productos_envio_incorrectos,

    (SELECT COUNT(*)
     FROM GARANTIA g
     WHERE g.ESTADO_REGISTRO = 'A'
       AND NOT EXISTS (
           SELECT 1 FROM DETALLE_GARANTIA dg
           WHERE dg.ID_GARANTIA = g.ID_GARANTIA
             AND dg.ESTADO_REGISTRO = 'A'
       )) AS garantias_sin_producto,

    (SELECT COUNT(*)
     FROM FACTURA f
     WHERE ABS(
         f.TOTAL - f.SALDO -
         NVL((
             SELECT SUM(pc.MONTO)
             FROM PAGO_CLIENTE pc
             WHERE pc.ID_FACTURA = f.ID_FACTURA
         ), 0)
     ) > 0.01) AS facturas_descuadradas

FROM DUAL;

//SELECT
    (SELECT COUNT(*) FROM USUARIO) AS usuarios,
    (SELECT COUNT(*) FROM ROL) AS roles,
    (SELECT COUNT(*) FROM ROL_OPCION) AS permisos,
    (SELECT COUNT(*) FROM BITACORA) AS eventos_bitacora
FROM DUAL;


-- empleado y cuenta

SELECT
    e.ID_EMPLEADO,
    p.NOMBRES,
    p.APELLIDOS,
    p.FECHA_NACIMIENTO,
    e.FECHA_CONTRATACION,
    TRUNC(MONTHS_BETWEEN(
        e.FECHA_CONTRATACION,
        p.FECHA_NACIMIENTO
    ) / 12) AS EDAD_CONTRATACION,
    e.FECHA_BAJA,
    e.ESTADO_REGISTRO AS ESTADO_EMPLEADO,
    u.NOMBRE_USUARIO,
    u.BLOQUEADO,
    u.ESTADO_REGISTRO AS ESTADO_USUARIO,
    r.NOMBRE AS ROL
FROM EMPLEADO e
JOIN PERSONA p ON p.ID_PERSONA = e.ID_PERSONA
LEFT JOIN USUARIO u ON u.ID_EMPLEADO = e.ID_EMPLEADO
LEFT JOIN ROL r ON r.ID_ROL = u.ID_ROL
WHERE UPPER(u.NOMBRE_USUARIO) = 'DEREK';


--historial laboral

SELECT
    'PUESTO' AS TIPO,
    p.NOMBRE AS ASIGNACION,
    ep.FECHA_INICIO,
    ep.FECHA_FIN,
    ep.ESTADO_REGISTRO
FROM EMPLEADO_PUESTO ep
JOIN PUESTO p ON p.ID_PUESTO = ep.ID_PUESTO
WHERE ep.ID_EMPLEADO = 3

UNION ALL

SELECT
    'SUCURSAL' AS TIPO,
    s.NOMBRE AS ASIGNACION,
    es.FECHA_INICIO,
    es.FECHA_FIN,
    es.ESTADO_REGISTRO
FROM EMPLEADO_SUCURSAL es
JOIN SUCURSAL s ON s.ID_SUCURSAL = es.ID_SUCURSAL
WHERE es.ID_EMPLEADO = 3;


--sucursales y empleados activos

SELECT
    p.nombre AS pais,
    r.nombre AS region,
    d.nombre AS departamento,
    s.id_sucursal,
    s.nombre AS sucursal,
    (
        SELECT COUNT(DISTINCT es.id_empleado)
        FROM EMPLEADO_SUCURSAL es
        JOIN EMPLEADO e
            ON e.id_empleado = es.id_empleado
        WHERE es.id_sucursal = s.id_sucursal
          AND es.fecha_fin IS NULL
          AND es.estado_registro = 'A'
          AND e.estado_registro = 'A'
    ) AS empleados_activos
FROM SUCURSAL s
JOIN DEPARTAMENTO d
    ON d.id_departamento = s.id_departamento
JOIN PAIS p
    ON p.id_pais = d.id_pais
JOIN REGION_GEOGRAFICA r
    ON r.id_region_geografica = d.id_region_geografica
ORDER BY p.nombre, r.nombre, s.nombre;

--departamentos disponibles para sucursales

SELECT
    p.nombre AS pais,
    r.nombre AS region,
    d.id_departamento,
    d.nombre AS departamento,
    COUNT(s.id_sucursal) AS sucursales_actuales
FROM DEPARTAMENTO d
JOIN PAIS p
    ON p.id_pais = d.id_pais
JOIN REGION_GEOGRAFICA r
    ON r.id_region_geografica = d.id_region_geografica
LEFT JOIN SUCURSAL s
    ON s.id_departamento = d.id_departamento
GROUP BY
    p.nombre,
    r.nombre,
    d.id_departamento,
    d.nombre
ORDER BY
    p.nombre,
    r.nombre,
    d.nombre;
    
    --sucursales de guatemala

SELECT
    s.id_sucursal,
    s.nombre AS sucursal,
    d.nombre AS departamento,
    r.nombre AS region
FROM SUCURSAL s
JOIN DEPARTAMENTO d
    ON d.id_departamento = s.id_departamento
JOIN REGION_GEOGRAFICA r
    ON r.id_region_geografica = d.id_region_geografica
JOIN PAIS p
    ON p.id_pais = d.id_pais
WHERE p.nombre = 'Guatemala'
ORDER BY s.id_sucursal;

--verificar sucursales nuevas

SELECT
    s.id_sucursal,
    s.nombre AS sucursal,
    d.nombre AS departamento,
    p.nombre AS pais,
    r.nombre AS region,
    s.telefono
FROM sucursal s
JOIN departamento d ON d.id_departamento = s.id_departamento
JOIN pais p ON p.id_pais = d.id_pais
JOIN region_geografica r
    ON r.id_region_geografica = d.id_region_geografica
WHERE s.id_sucursal IN (7, 8)
ORDER BY s.id_sucursal;




--empleados en puestos 
SET SQLBLANKLINES ON
DECLARE
    TYPE t_textos IS TABLE OF VARCHAR2(100) INDEX BY PLS_INTEGER;
    v_cargos     t_textos;
    v_nombres    t_textos;
    v_apellidos  t_textos;
    v_claves     t_textos;
    v_num_suc    NUMBER;
    v_id_rol     NUMBER;
    v_id_puesto  NUMBER;
    v_cubierto   NUMBER;
    v_duplicado  NUMBER;
    v_permisos   NUMBER;
    v_id_persona NUMBER;
    v_id_empleado NUMBER;
    v_indice     PLS_INTEGER := 0;
    v_creados    PLS_INTEGER := 0;
    v_omitidos   PLS_INTEGER := 0;
    v_documento  VARCHAR2(25);
    v_actor      VARCHAR2(50) := 'CARGA_ACADEMICA';
BEGIN
    SAVEPOINT inicio_personal_demo;
    --cargos basados en los roles reales de Oracle
    v_cargos(1) := 'Gerente';    v_claves(1) := 'GER';
    v_cargos(2) := 'Cajero';     v_claves(2) := 'CAJ';
    v_cargos(3) := 'Bodeguero';  v_claves(3) := 'BOD';
    --identidades ficticias, no corresponden a empleados reales
    v_nombres(1):='Carlos';      v_apellidos(1):='Lopez Morales';
    v_nombres(2):='Mariana';     v_apellidos(2):='Garcia Paz';
    v_nombres(3):='Luis';        v_apellidos(3):='Martinez Reyes';
    v_nombres(4):='Valeria';     v_apellidos(4):='Hernandez Diaz';
    v_nombres(5):='Jose';        v_apellidos(5):='Ramirez Soto';
    v_nombres(6):='Andrea';      v_apellidos(6):='Castro Mendez';
    v_nombres(7):='Miguel';      v_apellidos(7):='Flores Pineda';
    v_nombres(8):='Daniela';     v_apellidos(8):='Ramos Molina';
    v_nombres(9):='Fernando';    v_apellidos(9):='Vargas Campos';
    v_nombres(10):='Lucia';      v_apellidos(10):='Morales Cruz';
    v_nombres(11):='Oscar';      v_apellidos(11):='Mejia Alvarez';
    v_nombres(12):='Paola';      v_apellidos(12):='Reyes Castillo';
    v_nombres(13):='Ricardo';    v_apellidos(13):='Aguilar Fuentes';
    v_nombres(14):='Gabriela';   v_apellidos(14):='Cruz Herrera';
    v_nombres(15):='David';      v_apellidos(15):='Alvarado Rivas';
    v_nombres(16):='Claudia';    v_apellidos(16):='Escobar Silva';
    v_nombres(17):='Jorge';      v_apellidos(17):='Navas Valdez';
    v_nombres(18):='Natalia';    v_apellidos(18):='Pereira Luna';
    v_nombres(19):='Pedro';      v_apellidos(19):='Figueroa Leon';
    v_nombres(20):='Elena';      v_apellidos(20):='Contreras Rios';
    v_nombres(21):='Hector';     v_apellidos(21):='Acevedo Mora';
    v_nombres(22):='Sara';       v_apellidos(22):='Torres Gomez';
    v_nombres(23):='Mario';      v_apellidos(23):='Fuentes Navarro';
    v_nombres(24):='Carmen';     v_apellidos(24):='Santos Gutierrez';
    --seguridad: solo en las 8 sucursales que confirmamos
    SELECT COUNT(*) INTO v_num_suc FROM SUCURSAL WHERE ESTADO_REGISTRO = 'A';
    IF v_num_suc <> 8 THEN
        RAISE_APPLICATION_ERROR(-20081, 'Se esperaban 8 sucursales activas; hay ' || v_num_suc || '. No se creo ningun empleado.');
    END IF;
    --asegurar que existen los 3 roles y tienen permisos
    FOR i IN 1..3 LOOP
        SELECT MIN(ID_ROL) INTO v_id_rol
        FROM ROL WHERE UPPER(TRIM(NOMBRE)) = UPPER(v_cargos(i)) AND ESTADO_REGISTRO = 'A';
        IF v_id_rol IS NULL THEN
            RAISE_APPLICATION_ERROR(-20082, 'Falta rol activo en Oracle: ' || v_cargos(i));
        END IF;
        SELECT COUNT(*) INTO v_permisos FROM ROL_OPCION
        WHERE ID_ROL = v_id_rol AND ESTADO_REGISTRO = 'A';
        IF v_permisos = 0 THEN
            RAISE_APPLICATION_ERROR(-20083, 'Rol sin permisos configurados: ' || v_cargos(i));
        END IF;
    END LOOP;
    FOR suc IN (
        SELECT ID_SUCURSAL, NOMBRE
        FROM SUCURSAL
        WHERE ESTADO_REGISTRO = 'A'
        ORDER BY ID_SUCURSAL
    ) LOOP
        FOR i IN 1..3 LOOP
            v_indice := v_indice + 1;
            v_documento := 'DEMO-' || suc.ID_SUCURSAL || '-' || v_claves(i);
            --si se ejecuto antes, no duplica estas identidades
            SELECT COUNT(*) INTO v_duplicado
            FROM PERSONA WHERE DOCUMENTO_IDENTIDAD = v_documento;
            IF v_duplicado > 0 THEN
                v_omitidos := v_omitidos + 1;
                DBMS_OUTPUT.PUT_LINE('YA EXISTE: ' || v_documento || ' (' || suc.NOMBRE || ')');
                CONTINUE;
            END IF;
            --rol y puesto tienen el MISMO nombre
            SELECT MIN(ID_ROL) INTO v_id_rol FROM ROL
            WHERE UPPER(TRIM(NOMBRE)) = UPPER(v_cargos(i)) AND ESTADO_REGISTRO = 'A';
            SELECT MIN(ID_PUESTO) INTO v_id_puesto FROM PUESTO
            WHERE UPPER(TRIM(NOMBRE)) = UPPER(v_cargos(i)) AND ESTADO_REGISTRO = 'A';
            IF v_id_puesto IS NULL THEN
                v_id_puesto := SEQ_PUESTO.NEXTVAL;
                INSERT INTO PUESTO
                    (ID_PUESTO, NOMBRE, DESCRIPCION, FECHA_CREACION, USUARIO_CREACION, ESTADO_REGISTRO)
                VALUES
                    (v_id_puesto, v_cargos(i), 'Cargo asociado al rol ' || v_cargos(i),
                     SYSTIMESTAMP, v_actor, 'A');
            END IF;
            --respetar empleados que YA ocupen ese cargo en esa sucursal
            SELECT COUNT(DISTINCT e.ID_EMPLEADO) INTO v_cubierto
            FROM EMPLEADO e
            JOIN EMPLEADO_PUESTO ep ON ep.ID_EMPLEADO = e.ID_EMPLEADO
            JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO = e.ID_EMPLEADO
            WHERE e.ESTADO_REGISTRO = 'A'
              AND ep.ESTADO_REGISTRO = 'A' AND ep.FECHA_FIN IS NULL
              AND es.ESTADO_REGISTRO = 'A' AND es.FECHA_FIN IS NULL
              AND ep.ID_PUESTO = v_id_puesto
              AND es.ID_SUCURSAL = suc.ID_SUCURSAL;
            IF v_cubierto > 0 THEN
                v_omitidos := v_omitidos + 1;
                DBMS_OUTPUT.PUT_LINE('CUBIERTO: ' || suc.NOMBRE || ' / ' || v_cargos(i));
                CONTINUE;
            END IF;
            v_id_persona := SEQ_PERSONA.NEXTVAL;
            v_id_empleado := SEQ_EMPLEADO.NEXTVAL;
            INSERT INTO PERSONA
                (ID_PERSONA, NOMBRES, APELLIDOS, DOCUMENTO_IDENTIDAD, FECHA_NACIMIENTO,
                 FECHA_CREACION, USUARIO_CREACION, ESTADO_REGISTRO)
            VALUES
                (v_id_persona, v_nombres(v_indice), v_apellidos(v_indice), v_documento,
                 ADD_MONTHS(TRUNC(SYSDATE), -12 * (24 + MOD(v_indice, 17))),
                 SYSTIMESTAMP, v_actor, 'A');
            INSERT INTO EMPLEADO
                (ID_EMPLEADO, ID_PERSONA, CODIGO_EMPLEADO, FECHA_CONTRATACION,
                 FECHA_CREACION, USUARIO_CREACION, ESTADO_REGISTRO)
            VALUES
                (v_id_empleado, v_id_persona, 'EMP-' || LPAD(v_id_empleado, 4, '0'), TRUNC(SYSDATE),
                 SYSTIMESTAMP, v_actor, 'A');
            INSERT INTO EMPLEADO_PUESTO
                (ID_EMPLEADO_PUESTO, ID_EMPLEADO, ID_PUESTO, FECHA_INICIO,
                 FECHA_CREACION, USUARIO_CREACION, ESTADO_REGISTRO)
            VALUES
                (SEQ_EMPLEADO_PUESTO.NEXTVAL, v_id_empleado, v_id_puesto, TRUNC(SYSDATE),
                 SYSTIMESTAMP, v_actor, 'A');
            INSERT INTO EMPLEADO_SUCURSAL
                (ID_EMPLEADO_SUCURSAL, ID_EMPLEADO, ID_SUCURSAL, FECHA_INICIO,
                 FECHA_CREACION, USUARIO_CREACION, ESTADO_REGISTRO)
            VALUES
                (SEQ_EMPLEADO_SUCURSAL.NEXTVAL, v_id_empleado, suc.ID_SUCURSAL, TRUNC(SYSDATE),
                 SYSTIMESTAMP, v_actor, 'A');
            v_creados := v_creados + 1;
            DBMS_OUTPUT.PUT_LINE('CONTRATADO: ' || suc.NOMBRE || ' / ' || v_cargos(i) ||
                                 ' / ' || v_nombres(v_indice) || ' ' || v_apellidos(v_indice) ||
                                 ' / EMP-' || LPAD(v_id_empleado, 4, '0'));
        END LOOP;
    END LOOP;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('FINALIZADO. Nuevos empleados: ' || v_creados ||
                         '. Puestos cubiertos o ya existentes: ' || v_omitidos || '.');
    DBMS_OUTPUT.PUT_LINE('No se crearon cuentas USUARIO: los permisos de acceso se activan solo al darles usuario.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO SAVEPOINT inicio_personal_demo;
        DBMS_OUTPUT.PUT_LINE('ERROR: ' || SQLERRM || '. Los cambios de esta ejecucion se revirtieron.');
        RAISE;
END;
/

--verificar empleados activos distribuidos por sucursal y cargo
SELECT
    s.ID_SUCURSAL,
    s.NOMBRE AS SUCURSAL,
    COUNT(DISTINCT CASE WHEN UPPER(TRIM(pu.NOMBRE)) = 'GERENTE' THEN e.ID_EMPLEADO END) AS GERENTES,
    COUNT(DISTINCT CASE WHEN UPPER(TRIM(pu.NOMBRE)) = 'CAJERO' THEN e.ID_EMPLEADO END) AS CAJEROS,
    COUNT(DISTINCT CASE WHEN UPPER(TRIM(pu.NOMBRE)) = 'BODEGUERO' THEN e.ID_EMPLEADO END) AS BODEGUEROS,
    COUNT(DISTINCT e.ID_EMPLEADO) AS TOTAL_ACTIVOS
FROM SUCURSAL s
LEFT JOIN EMPLEADO_SUCURSAL es
    ON es.ID_SUCURSAL = s.ID_SUCURSAL AND es.ESTADO_REGISTRO = 'A' AND es.FECHA_FIN IS NULL
LEFT JOIN EMPLEADO e
    ON e.ID_EMPLEADO = es.ID_EMPLEADO AND e.ESTADO_REGISTRO = 'A'
LEFT JOIN EMPLEADO_PUESTO ep
    ON ep.ID_EMPLEADO = e.ID_EMPLEADO AND ep.ESTADO_REGISTRO = 'A' AND ep.FECHA_FIN IS NULL
LEFT JOIN PUESTO pu ON pu.ID_PUESTO = ep.ID_PUESTO
WHERE s.ESTADO_REGISTRO = 'A'
GROUP BY s.ID_SUCURSAL, s.NOMBRE
ORDER BY s.ID_SUCURSAL;

--verificar correspondencia entre cargos y permisos Oracle
SELECT
    r.NOMBRE AS ROL_DE_ACCESO,
    pu.NOMBRE AS CARGO_LABORAL,
    COUNT(DISTINCT ro.ID_OPCION) AS OPCIONES_AUTORIZADAS
FROM ROL r
JOIN PUESTO pu ON UPPER(TRIM(pu.NOMBRE)) = UPPER(TRIM(r.NOMBRE)) AND pu.ESTADO_REGISTRO = 'A'
LEFT JOIN ROL_OPCION ro ON ro.ID_ROL = r.ID_ROL AND ro.ESTADO_REGISTRO = 'A'
WHERE r.ESTADO_REGISTRO = 'A' AND UPPER(TRIM(r.NOMBRE)) IN ('GERENTE','CAJERO','BODEGUERO')
GROUP BY r.NOMBRE, pu.NOMBRE
ORDER BY r.NOMBRE;

--verificar los registros ficticios sin confundirlos con empleados reales
SELECT
    e.CODIGO_EMPLEADO,
    p.NOMBRES || ' ' || p.APELLIDOS AS EMPLEADO,
    pu.NOMBRE AS CARGO,
    s.NOMBRE AS SUCURSAL,
    p.DOCUMENTO_IDENTIDAD AS IDENTIFICADOR_DE_PRUEBA,
    TRUNC(MONTHS_BETWEEN(e.FECHA_CONTRATACION,p.FECHA_NACIMIENTO)/12) AS EDAD_AL_INGRESAR
FROM PERSONA p
JOIN EMPLEADO e ON e.ID_PERSONA = p.ID_PERSONA
JOIN EMPLEADO_PUESTO ep ON ep.ID_EMPLEADO = e.ID_EMPLEADO
JOIN PUESTO pu ON pu.ID_PUESTO = ep.ID_PUESTO
JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO = e.ID_EMPLEADO
JOIN SUCURSAL s ON s.ID_SUCURSAL = es.ID_SUCURSAL
WHERE p.DOCUMENTO_IDENTIDAD LIKE 'DEMO-%'
ORDER BY s.ID_SUCURSAL, pu.NOMBRE;


--personal activo por sucursal

SELECT
    s.nombre AS sucursal,
    COUNT(DISTINCT CASE
        WHEN UPPER(p.nombre) = 'GERENTE'
        THEN e.id_empleado END) AS gerentes,
    COUNT(DISTINCT CASE
        WHEN UPPER(p.nombre) = 'CAJERO'
        THEN e.id_empleado END) AS cajeros,
    COUNT(DISTINCT CASE
        WHEN UPPER(p.nombre) = 'BODEGUERO'
        THEN e.id_empleado END) AS bodegueros
FROM sucursal s
LEFT JOIN empleado_sucursal es
    ON es.id_sucursal = s.id_sucursal
    AND es.fecha_fin IS NULL
    AND es.estado_registro = 'A'
LEFT JOIN empleado e
    ON e.id_empleado = es.id_empleado
    AND e.estado_registro = 'A'
LEFT JOIN empleado_puesto ep
    ON ep.id_empleado = e.id_empleado
    AND ep.fecha_fin IS NULL
    AND ep.estado_registro = 'A'
LEFT JOIN puesto p
    ON p.id_puesto = ep.id_puesto
WHERE s.estado_registro = 'A'
GROUP BY s.id_sucursal, s.nombre
ORDER BY s.id_sucursal;


SET SERVEROUTPUT ON SIZE UNLIMITED
SET SQLBLANKLINES ON
SET DEFINE OFF

DECLARE
    v_total       NUMBER;
    v_validos     NUMBER;
    v_existentes  NUMBER;
    v_activos     NUMBER;
    v_colision    NUMBER;
    v_permisos    NUMBER;
    v_creados     NUMBER := 0;
    v_omitidos    NUMBER := 0;
    v_usuario     VARCHAR2(50);
    v_clave       VARCHAR2(50);
    v_id_usuario  NUMBER;
BEGIN
    SAVEPOINT inicio_accesos_demo;

    -- Solo trabaja sobre los 24 empleados de la carga DEMO anterior.
    SELECT COUNT(*) INTO v_total
    FROM EMPLEADO e
    JOIN PERSONA pe ON pe.ID_PERSONA = e.ID_PERSONA
    WHERE pe.DOCUMENTO_IDENTIDAD LIKE 'DEMO-%'
      AND e.ESTADO_REGISTRO = 'A'
      AND e.FECHA_BAJA IS NULL;

    IF v_total <> 24 THEN
        RAISE_APPLICATION_ERROR(-20130,
          'Se esperaban los 24 empleados DEMO activos; se encontraron ' || v_total || '. No se creo ninguna cuenta.');
    END IF;

    -- Cada empleado debe tener UN cargo, UNA sucursal y UN rol activo equivalente.
    SELECT COUNT(*) INTO v_validos
    FROM EMPLEADO e
    JOIN PERSONA pe ON pe.ID_PERSONA = e.ID_PERSONA
    JOIN EMPLEADO_PUESTO ep ON ep.ID_EMPLEADO = e.ID_EMPLEADO
        AND ep.ESTADO_REGISTRO = 'A' AND ep.FECHA_FIN IS NULL
    JOIN PUESTO pu ON pu.ID_PUESTO = ep.ID_PUESTO
        AND pu.ESTADO_REGISTRO = 'A'
    JOIN ROL r ON UPPER(TRIM(r.NOMBRE)) = UPPER(TRIM(pu.NOMBRE))
        AND r.ESTADO_REGISTRO = 'A'
    JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO = e.ID_EMPLEADO
        AND es.ESTADO_REGISTRO = 'A' AND es.FECHA_FIN IS NULL
    JOIN SUCURSAL s ON s.ID_SUCURSAL = es.ID_SUCURSAL
        AND s.ESTADO_REGISTRO = 'A'
    WHERE pe.DOCUMENTO_IDENTIDAD LIKE 'DEMO-%'
      AND e.ESTADO_REGISTRO = 'A'
      AND e.FECHA_BAJA IS NULL
      AND UPPER(TRIM(r.NOMBRE)) IN ('GERENTE','CAJERO','BODEGUERO');

    IF v_validos <> 24 THEN
        RAISE_APPLICATION_ERROR(-20131,
          'Los 24 empleados no tienen una unica asignacion activa de cargo/rol/sucursal. Coincidencias: ' || v_validos);
    END IF;

    DBMS_OUTPUT.PUT_LINE('CUENTAS NUEVAS - GUARDA ESTA SALIDA EN PRIVADO');
    DBMS_OUTPUT.PUT_LINE('USUARIO | CONTRASENA INICIAL | ROL | EMPLEADO | SUCURSAL');

    FOR reg IN (
        SELECT e.ID_EMPLEADO, e.CODIGO_EMPLEADO,
               pe.NOMBRES || ' ' || pe.APELLIDOS AS EMPLEADO,
               r.ID_ROL, r.NOMBRE AS ROL,
               s.NOMBRE AS SUCURSAL
        FROM EMPLEADO e
        JOIN PERSONA pe ON pe.ID_PERSONA = e.ID_PERSONA
        JOIN EMPLEADO_PUESTO ep ON ep.ID_EMPLEADO = e.ID_EMPLEADO
            AND ep.ESTADO_REGISTRO = 'A' AND ep.FECHA_FIN IS NULL
        JOIN PUESTO pu ON pu.ID_PUESTO = ep.ID_PUESTO
            AND pu.ESTADO_REGISTRO = 'A'
        JOIN ROL r ON UPPER(TRIM(r.NOMBRE)) = UPPER(TRIM(pu.NOMBRE))
            AND r.ESTADO_REGISTRO = 'A'
        JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO = e.ID_EMPLEADO
            AND es.ESTADO_REGISTRO = 'A' AND es.FECHA_FIN IS NULL
        JOIN SUCURSAL s ON s.ID_SUCURSAL = es.ID_SUCURSAL
            AND s.ESTADO_REGISTRO = 'A'
        WHERE pe.DOCUMENTO_IDENTIDAD LIKE 'DEMO-%'
          AND e.ESTADO_REGISTRO = 'A'
          AND e.FECHA_BAJA IS NULL
          AND UPPER(TRIM(r.NOMBRE)) IN ('GERENTE','CAJERO','BODEGUERO')
        ORDER BY e.ID_EMPLEADO
    ) LOOP
        SELECT COUNT(*) INTO v_permisos
        FROM ROL_OPCION ro
        WHERE ro.ID_ROL = reg.ID_ROL
          AND ro.ESTADO_REGISTRO = 'A'
          AND ro.PUEDE_CONSULTAR = 'S';
        IF v_permisos = 0 THEN
            RAISE_APPLICATION_ERROR(-20132,
              'El rol ' || reg.ROL || ' no tiene opciones consultables configuradas.');
        END IF;

        -- Nunca se sobreescribe ni reactiva una cuenta anterior.
        SELECT COUNT(*) INTO v_existentes
        FROM USUARIO WHERE ID_EMPLEADO = reg.ID_EMPLEADO;
        IF v_existentes > 0 THEN
            SELECT COUNT(*) INTO v_activos
            FROM USUARIO
            WHERE ID_EMPLEADO = reg.ID_EMPLEADO
              AND ID_ROL = reg.ID_ROL
              AND ESTADO_REGISTRO = 'A'
              AND BLOQUEADO = 'N';
            IF v_activos <> 1 OR v_existentes <> 1 THEN
                RAISE_APPLICATION_ERROR(-20133,
                  'El empleado ' || reg.CODIGO_EMPLEADO ||
                  ' ya tiene cuenta(s), pero no una sola cuenta activa con su rol correcto. Revisar manualmente.');
            END IF;
            v_omitidos := v_omitidos + 1;
            DBMS_OUTPUT.PUT_LINE('YA TENIA CUENTA: ' || reg.CODIGO_EMPLEADO ||
                ' / ' || reg.EMPLEADO || ' / ' || reg.ROL);
            CONTINUE;
        END IF;

        v_usuario := 'lcd_emp' || LPAD(reg.ID_EMPLEADO, 4, '0');
        SELECT COUNT(*) INTO v_colision FROM USUARIO
        WHERE UPPER(TRIM(NOMBRE_USUARIO)) = UPPER(v_usuario);
        IF v_colision <> 0 THEN
            RAISE_APPLICATION_ERROR(-20134,
              'El usuario ' || v_usuario || ' ya esta usado por otra persona. No se sobreescribio.');
        END IF;

        -- Credenciales distintas por trabajador; solo el hash se guarda en Oracle.
        -- Cambiar las claves iniciales despues de probar el acceso.
        v_clave := 'LcD#' || SUBSTR(RAWTOHEX(SYS_GUID()), 1, 24) || 'a9';
        v_id_usuario := PKG_SEGURIDAD.CREAR_USUARIO(
            v_usuario, v_clave, reg.ID_ROL, reg.ID_EMPLEADO);
        v_creados := v_creados + 1;
        DBMS_OUTPUT.PUT_LINE(v_usuario || ' | ' || v_clave || ' | ' ||
            reg.ROL || ' | ' || reg.CODIGO_EMPLEADO || ' ' || reg.EMPLEADO ||
            ' | ' || reg.SUCURSAL);
    END LOOP;

    IF v_creados + v_omitidos <> 24 THEN
        RAISE_APPLICATION_ERROR(-20135,'No se procesaron los 24 empleados DEMO.');
    END IF;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('FINALIZADO. CUENTAS NUEVAS: ' || v_creados ||
        ' | YA EXISTIAN VALIDAS: ' || v_omitidos || ' | TOTAL: 24.');
    DBMS_OUTPUT.PUT_LINE('IMPORTANTE: no compartas contrasenas ni las subas al repositorio.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO inicio_accesos_demo;
        DBMS_OUTPUT.PUT_LINE('ERROR: ' || SQLERRM);
        DBMS_OUTPUT.PUT_LINE('Se revirtieron los cambios de esta ejecucion.');
        RAISE;
END;
/

-- Verificacion: 24 empleados de demostracion con una cuenta y rol correspondientes.
SELECT s.NOMBRE AS SUCURSAL,
       r.NOMBRE AS ROL,
       COUNT(DISTINCT e.ID_EMPLEADO) AS EMPLEADOS_CON_ACCESO
FROM EMPLEADO e
JOIN PERSONA pe ON pe.ID_PERSONA = e.ID_PERSONA
JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO = e.ID_EMPLEADO
    AND es.ESTADO_REGISTRO = 'A' AND es.FECHA_FIN IS NULL
JOIN SUCURSAL s ON s.ID_SUCURSAL = es.ID_SUCURSAL
JOIN EMPLEADO_PUESTO ep ON ep.ID_EMPLEADO = e.ID_EMPLEADO
    AND ep.ESTADO_REGISTRO = 'A' AND ep.FECHA_FIN IS NULL
JOIN PUESTO pu ON pu.ID_PUESTO = ep.ID_PUESTO
JOIN USUARIO u ON u.ID_EMPLEADO = e.ID_EMPLEADO
    AND u.ESTADO_REGISTRO = 'A' AND u.BLOQUEADO = 'N'
JOIN ROL r ON r.ID_ROL = u.ID_ROL
    AND UPPER(TRIM(r.NOMBRE)) = UPPER(TRIM(pu.NOMBRE))
WHERE pe.DOCUMENTO_IDENTIDAD LIKE 'DEMO-%'
  AND e.ESTADO_REGISTRO = 'A'
GROUP BY s.ID_SUCURSAL, s.NOMBRE, r.NOMBRE
ORDER BY s.ID_SUCURSAL, r.NOMBRE;

SELECT COUNT(DISTINCT e.ID_EMPLEADO) AS EMPLEADOS_DEMO_CON_CUENTA_ACTIVA
FROM EMPLEADO e
JOIN PERSONA pe ON pe.ID_PERSONA = e.ID_PERSONA
JOIN USUARIO u ON u.ID_EMPLEADO = e.ID_EMPLEADO
WHERE pe.DOCUMENTO_IDENTIDAD LIKE 'DEMO-%'
  AND e.ESTADO_REGISTRO = 'A'
  AND u.ESTADO_REGISTRO = 'A'
  AND u.BLOQUEADO = 'N';

--usuarios activos por sucursal y rol

SELECT
    s.nombre AS sucursal,
    r.nombre AS rol,
    COUNT(DISTINCT u.id_usuario) AS usuarios_activos
FROM usuario u
JOIN rol r ON r.id_rol = u.id_rol
JOIN empleado e ON e.id_empleado = u.id_empleado
JOIN empleado_sucursal es
    ON es.id_empleado = e.id_empleado
JOIN sucursal s
    ON s.id_sucursal = es.id_sucursal
WHERE u.nombre_usuario LIKE 'lcd_emp%'
  AND u.estado_registro = 'A'
  AND u.bloqueado = 'N'
  AND e.estado_registro = 'A'
  AND es.estado_registro = 'A'
  AND es.fecha_fin IS NULL
GROUP BY s.nombre, r.nombre
ORDER BY s.nombre, r.nombre;


-- La Casa del Constructor de Derek
-- Renombra los accesos DEMO usando solo el primer nombre y restablece sus claves.
-- NO crea empleados ni usuarios nuevos. NO borra registros, ni cambia roles o sucursales.
-- Usa F5 en Oracle SQL Developer, conectado al mismo esquema de la aplicacion.
-- IMPORTANTE: la salida contiene las claves NUEVAS. Guardala de forma privada y no la subas a Git.

SET SERVEROUTPUT ON SIZE UNLIMITED
SET SQLBLANKLINES ON
SET DEFINE OFF

DECLARE
    v_total         NUMBER := 0;
    v_actualizados  NUMBER := 0;
    v_ya_renombrados NUMBER := 0;
    v_colision      NUMBER := 0;
    v_usuario_nuevo VARCHAR2(50);
    v_clave_nueva   VARCHAR2(50);
    v_usuario_actual VARCHAR2(50);
    v_usuario_apellido VARCHAR2(50);
    v_duplicados NUMBER;
BEGIN
    SAVEPOINT antes_de_corregir_accesos;
    SELECT COUNT(*) INTO v_total
    FROM USUARIO u
    JOIN EMPLEADO e ON e.ID_EMPLEADO = u.ID_EMPLEADO
    JOIN PERSONA p ON p.ID_PERSONA = e.ID_PERSONA
    WHERE p.DOCUMENTO_IDENTIDAD LIKE 'DEMO-%'
      AND e.ID_EMPLEADO BETWEEN 4 AND 27
      AND e.ESTADO_REGISTRO = 'A'
      AND e.FECHA_BAJA IS NULL
      AND u.ESTADO_REGISTRO = 'A'
      AND u.BLOQUEADO = 'N';
    IF v_total <> 24 THEN
        RAISE_APPLICATION_ERROR(-20201,
            'Se esperaban 24 cuentas DEMO activas y se encontraron ' || v_total || '. No se modifico ninguna cuenta.');
    END IF;
    -- Comprobar que los 24 primeros nombres no colisionen entre ellos.
    SELECT COUNT(*) - COUNT(DISTINCT LOWER(
        REGEXP_REPLACE(
            TRANSLATE(LOWER(REGEXP_SUBSTR(TRIM(p.NOMBRES), '^[^ ]+')),
                      'áéíóúüñ', 'aeiouun'), '[^a-z0-9]', '')
    )) INTO v_duplicados
    FROM USUARIO u
    JOIN EMPLEADO e ON e.ID_EMPLEADO = u.ID_EMPLEADO
    JOIN PERSONA p ON p.ID_PERSONA = e.ID_PERSONA
    WHERE p.DOCUMENTO_IDENTIDAD LIKE 'DEMO-%'
      AND e.ID_EMPLEADO BETWEEN 4 AND 27
      AND e.ESTADO_REGISTRO = 'A' AND e.FECHA_BAJA IS NULL
      AND u.ESTADO_REGISTRO = 'A' AND u.BLOQUEADO = 'N';
    IF v_duplicados > 0 THEN
        RAISE_APPLICATION_ERROR(-20207, 'Existen empleados con el mismo primer nombre. No se modifico nada.');
    END IF;
    DBMS_OUTPUT.PUT_LINE('USUARIOS CON SOLO EL NOMBRE - GUARDA ESTA SALIDA EN PRIVADO');
    DBMS_OUTPUT.PUT_LINE('NUEVO USUARIO | NUEVA CONTRASENA | EMPLEADO | ROL');
    FOR x IN (
        SELECT u.ID_USUARIO, u.ID_EMPLEADO, u.NOMBRE_USUARIO,
               p.NOMBRES, p.APELLIDOS, e.CODIGO_EMPLEADO,
               r.NOMBRE AS ROL
        FROM USUARIO u
        JOIN EMPLEADO e ON e.ID_EMPLEADO = u.ID_EMPLEADO
        JOIN PERSONA p ON p.ID_PERSONA = e.ID_PERSONA
        JOIN ROL r ON r.ID_ROL = u.ID_ROL
        WHERE p.DOCUMENTO_IDENTIDAD LIKE 'DEMO-%'
          AND e.ID_EMPLEADO BETWEEN 4 AND 27
          AND e.ESTADO_REGISTRO = 'A'
          AND e.FECHA_BAJA IS NULL
          AND u.ESTADO_REGISTRO = 'A'
          AND u.BLOQUEADO = 'N'
        ORDER BY e.ID_EMPLEADO
    ) LOOP
        v_usuario_nuevo := REGEXP_REPLACE(
            TRANSLATE(LOWER(REGEXP_SUBSTR(TRIM(x.NOMBRES), '^[^ ]+')),
                      'áéíóúüñ', 'aeiouun'), '[^a-z0-9]', '');
        v_usuario_apellido := LOWER(
            REGEXP_REPLACE(REGEXP_SUBSTR(TRIM(x.NOMBRES), '^[^ ]+'), '[^A-Za-z0-9]', '')
            || '.' ||
            REGEXP_REPLACE(REGEXP_SUBSTR(TRIM(x.APELLIDOS), '^[^ ]+'), '[^A-Za-z0-9]', '')
        );
        v_usuario_actual := 'lcd_emp' || LPAD(x.ID_EMPLEADO, 4, '0');
        IF v_usuario_nuevo IS NULL OR LENGTH(v_usuario_nuevo) > 50 THEN
            RAISE_APPLICATION_ERROR(-20202, 'Nombre de acceso no valido: ' || x.CODIGO_EMPLEADO);
        END IF;
        -- Si el SQL ya se aplico, no sobrescribe la clave otra vez.
        IF LOWER(x.NOMBRE_USUARIO) = v_usuario_nuevo THEN
            v_ya_renombrados := v_ya_renombrados + 1;
            DBMS_OUTPUT.PUT_LINE('YA CORREGIDO: ' || v_usuario_nuevo || ' | ' || x.CODIGO_EMPLEADO);
            CONTINUE;
        END IF;
        -- Evita modificar usuarios personalizados o ajenos a la carga DEMO.
        IF LOWER(x.NOMBRE_USUARIO) NOT IN (v_usuario_actual, v_usuario_apellido) THEN
            RAISE_APPLICATION_ERROR(-20203,
                'Cuenta no reconocida en ' || x.CODIGO_EMPLEADO || ': ' || x.NOMBRE_USUARIO);
        END IF;
        SELECT COUNT(*) INTO v_colision
        FROM USUARIO u2
        WHERE LOWER(TRIM(u2.NOMBRE_USUARIO)) = v_usuario_nuevo
          AND u2.ID_USUARIO <> x.ID_USUARIO;
        IF v_colision <> 0 THEN
            RAISE_APPLICATION_ERROR(-20204,
                'El nombre ' || v_usuario_nuevo || ' ya esta usado. No se cambio ninguna cuenta.');
        END IF;
        -- Nueva clave individual: las claves anteriores expuestas quedan invalidadas.
        v_clave_nueva := 'Dk#' || SUBSTR(RAWTOHEX(SYS_GUID()), 1, 16) || 'a7';
        UPDATE USUARIO
           SET NOMBRE_USUARIO = v_usuario_nuevo,
               CLAVE = FN_HASH_CLAVE(v_clave_nueva),
               FECHA_MODIFICACION = SYSTIMESTAMP,
               USUARIO_MODIFICACION = USER
         WHERE ID_USUARIO = x.ID_USUARIO
           AND ID_EMPLEADO = x.ID_EMPLEADO
           AND NOMBRE_USUARIO = x.NOMBRE_USUARIO
           AND ESTADO_REGISTRO = 'A'
           AND BLOQUEADO = 'N';
        IF SQL%ROWCOUNT <> 1 THEN
            RAISE_APPLICATION_ERROR(-20205, 'No fue posible actualizar ' || x.CODIGO_EMPLEADO);
        END IF;
        v_actualizados := v_actualizados + 1;
        DBMS_OUTPUT.PUT_LINE(v_usuario_nuevo || ' | ' || v_clave_nueva || ' | ' ||
            x.CODIGO_EMPLEADO || ' ' || x.NOMBRES || ' ' || x.APELLIDOS || ' | ' || x.ROL);
    END LOOP;
    IF v_actualizados + v_ya_renombrados <> 24 THEN
        RAISE_APPLICATION_ERROR(-20206, 'No se procesaron las 24 cuentas.');
    END IF;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('FINALIZADO. CUENTAS RENOMBRADAS Y CLAVES RESTABLECIDAS: ' || v_actualizados ||
        ' | YA CORREGIDAS: ' || v_ya_renombrados || ' | TOTAL: 24');
    DBMS_OUTPUT.PUT_LINE('GUARDA LAS CLAVES AHORA: Oracle solo almacena sus hashes y no permite leerlas despues.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO antes_de_corregir_accesos;
        DBMS_OUTPUT.PUT_LINE('ERROR: ' || SQLERRM);
        DBMS_OUTPUT.PUT_LINE('Se revirtieron los cambios de esta ejecucion.');
        RAISE;
END;
/

-- Verificacion de nombres y roles (NUNCA muestra contrasenas).
SELECT s.NOMBRE AS SUCURSAL,
       p.NOMBRES || ' ' || p.APELLIDOS AS EMPLEADO,
       u.NOMBRE_USUARIO AS USUARIO,
       r.NOMBRE AS ROL,
       CASE WHEN u.BLOQUEADO = 'N' AND u.ESTADO_REGISTRO = 'A' THEN 'ACTIVA' ELSE 'INACTIVA' END AS CUENTA
FROM USUARIO u
JOIN EMPLEADO e ON e.ID_EMPLEADO = u.ID_EMPLEADO
JOIN PERSONA p ON p.ID_PERSONA = e.ID_PERSONA
JOIN ROL r ON r.ID_ROL = u.ID_ROL
JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO = e.ID_EMPLEADO
  AND es.ESTADO_REGISTRO = 'A' AND es.FECHA_FIN IS NULL
JOIN SUCURSAL s ON s.ID_SUCURSAL = es.ID_SUCURSAL
WHERE p.DOCUMENTO_IDENTIDAD LIKE 'DEMO-%'
  AND e.ID_EMPLEADO BETWEEN 4 AND 27
ORDER BY e.ID_EMPLEADO;
