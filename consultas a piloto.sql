--verificar piloto

SELECT
    e.id_empleado,
    p.nombres,
    p.apellidos,
    u.nombre_usuario,
    r.nombre AS rol,
    s.nombre AS sucursal,
    e.estado_registro AS estado_empleado,
    u.estado_registro AS estado_usuario,
    u.bloqueado
FROM empleado e
JOIN persona p
    ON p.id_persona = e.id_persona
JOIN usuario u
    ON u.id_empleado = e.id_empleado
JOIN rol r
    ON r.id_rol = u.id_rol
LEFT JOIN empleado_sucursal es
    ON es.id_empleado = e.id_empleado
    AND es.fecha_fin IS NULL
    AND es.estado_registro = 'A'
LEFT JOIN sucursal s
    ON s.id_sucursal = es.id_sucursal
WHERE LOWER(u.nombre_usuario) = 'antonio';

--verificar entrega del piloto

SELECT
    e.*,
    p.nombres,
    p.apellidos
FROM ENVIO e
JOIN EMPLEADO em
    ON em.ID_EMPLEADO = e.ID_PILOTO
JOIN PERSONA p
    ON p.ID_PERSONA = em.ID_PERSONA
WHERE e.ID_PILOTO = 28
ORDER BY e.ID_ENVIO DESC;