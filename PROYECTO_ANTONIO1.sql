--tablas

create table BITACORA (
   id_bitacora          INTEGER               not null,
   id_usuario           INTEGER,
   fecha_hora           TIMESTAMP             not null,
   tipo_evento          VARCHAR2(30)          not null,
   tabla_afectada       VARCHAR2(60),
   id_registro          VARCHAR2(60),
   valor_anterior       CLOB,
   valor_nuevo          CLOB,
   modulo               VARCHAR2(60),
   ip_origen            VARCHAR2(45),
   descripcion          VARCHAR2(500),
   constraint PK_BITACORA primary key (id_bitacora)
);

create index Relationship_82_FK on BITACORA (id_usuario ASC);

create table CATEGORIA (
   id_categoria         INTEGER               not null,
   nombre               VARCHAR2(60)          not null,
   descripcion          VARCHAR2(200),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_CATEGORIA primary key (id_categoria)
);

create table CLIENTE (
   id_cliente           INTEGER               not null,
   id_persona           INTEGER               not null,
   tipo_cliente         CHAR(1)               not null,
   limite_credito       NUMBER(12,2)         default 0  not null,
   dias_credito         NUMBER(3)            default 0  not null,
   fecha_registro       DATE                  not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_CLIENTE primary key (id_cliente)
);

create index Relationship_68_FK on CLIENTE (id_persona ASC);

create table COMPRA (
   id_compra            INTEGER               not null,
   id_empleado_sucursal INTEGER               not null,
   id_proveedor         INTEGER               not null,
   numero_documento     VARCHAR2(30)          not null,
   fecha                DATE                  not null,
   condicion_pago       VARCHAR2(10)          not null,
   fecha_vencimiento    DATE,
   total                NUMBER(14,2)          not null,
   saldo                NUMBER(14,2)          not null,
   estado               VARCHAR2(15)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_COMPRA primary key (id_compra)
);

create index Relationship_21_FK on COMPRA (id_proveedor ASC);
create index Relationship_85_FK on COMPRA (id_empleado_sucursal ASC);

create table DEPARTAMENTO (
   id_departamento      INTEGER               not null,
   id_pais              INTEGER               not null,
   id_region_geografica INTEGER               not null,
   nombre               VARCHAR2(60)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_DEPARTAMENTO primary key (id_departamento)
);

create index Relationship_63_FK on DEPARTAMENTO (id_pais ASC);
create index Relationship_88_FK on DEPARTAMENTO (id_region_geografica ASC);

create table DETALLE_COMPRA (
   id_detalle_compra    INTEGER               not null,
   id_producto_sucursal INTEGER               not null,
   id_compra            INTEGER               not null,
   cantidad             NUMBER(12,2)          not null,
   costo_unitario       NUMBER(12,2)          not null,
   subtotal             NUMBER(14,2)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_DETALLE_COMPRA primary key (id_detalle_compra)
);

create index Relationship_24_FK on DETALLE_COMPRA (id_compra ASC);
create index Relationship_78_FK on DETALLE_COMPRA (id_producto_sucursal ASC);

create table DETALLE_ENVIO (
   id_detalle_envio     INTEGER               not null,
   id_detalle_factura   INTEGER               not null,
   id_envio             INTEGER               not null,
   cantidad             NUMBER(12,2)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_DETALLE_ENVIO primary key (id_detalle_envio)
);

create index Relationship_60_FK on DETALLE_ENVIO (id_envio ASC);
create index Relationship_61_FK on DETALLE_ENVIO (id_detalle_factura ASC);

create table DETALLE_FACTURA (
   id_detalle_factura   INTEGER               not null,
   id_producto_sucursal INTEGER               not null,
   id_factura           INTEGER               not null,
   cantidad             NUMBER(12,2)          not null,
   precio_unitario      NUMBER(12,2)          not null,
   descuento            NUMBER(12,2)         default 0  not null,
   subtotal             NUMBER(14,2)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_DETALLE_FACTURA primary key (id_detalle_factura)
);

create index Relationship_33_FK on DETALLE_FACTURA (id_factura ASC);
create index Relationship_77_FK on DETALLE_FACTURA (id_producto_sucursal ASC);

create table DETALLE_GARANTIA (
   id_detalle_garantia  INTEGER               not null,
   id_detalle_factura   INTEGER               not null,
   id_garantia          INTEGER               not null,
   cantidad             NUMBER(12,2)          not null,
   descripcion_falla    VARCHAR2(300)         not null,
   resolucion           VARCHAR2(20),
   fecha_resolucion     DATE,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_DETALLE_GARANTIA primary key (id_detalle_garantia)
);

create index Relationship_80_FK on DETALLE_GARANTIA (id_garantia ASC);
create index Relationship_81_FK on DETALLE_GARANTIA (id_detalle_factura ASC);

create table DETALLE_NOTA_CREDITO (
   id_detalle_nota_credito INTEGER               not null,
   id_detalle_factura   INTEGER               not null,
   id_nota_credito      INTEGER               not null,
   cantidad             NUMBER(12,2)          not null,
   precio_unitario      NUMBER(12,2)          not null,
   subtotal             NUMBER(14,2)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_DETALLE_NOTA_CREDITO primary key (id_detalle_nota_credito)
);

create index Relationship_37_FK on DETALLE_NOTA_CREDITO (id_nota_credito ASC);
create index Relationship_38_FK on DETALLE_NOTA_CREDITO (id_detalle_factura ASC);

create table DEVOLUCION (
   id_devolucion        INTEGER               not null,
   id_empleado          INTEGER               not null,
   id_sucursal          INTEGER               not null,
   id_factura           INTEGER               not null,
   id_detalle_factura   INTEGER               not null,
   id_nota_credito      INTEGER,
   fecha                DATE                  not null,
   cantidad             NUMBER(12,2)          not null,
   motivo               VARCHAR2(200)         not null,
   reingresa_inventario CHAR(1)              default 'S'  not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_DEVOLUCION primary key (id_devolucion)
);

create index Relationship_44_FK on DEVOLUCION (id_factura ASC);
create index Relationship_45_FK on DEVOLUCION (id_detalle_factura ASC);
create index Relationship_46_FK on DEVOLUCION (id_sucursal ASC);
create index Relationship_47_FK on DEVOLUCION (id_empleado ASC);
create index Relationship_48_FK on DEVOLUCION (id_nota_credito ASC);

create table EMPLEADO (
   id_empleado          INTEGER               not null,
   id_persona           INTEGER               not null,
   codigo_empleado      VARCHAR2(20)          not null,
   fecha_contratacion   DATE                  not null,
   fecha_baja           DATE,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_EMPLEADO primary key (id_empleado)
);

create index Relationship_69_FK on EMPLEADO (id_persona ASC);

create table EMPLEADO_PUESTO (
   id_empleado_puesto   INTEGER               not null,
   id_empleado          INTEGER               not null,
   id_puesto            INTEGER               not null,
   fecha_inicio         DATE                  not null,
   fecha_fin            DATE,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_EMPLEADO_PUESTO primary key (id_empleado_puesto)
);

create index Relationship_70_FK on EMPLEADO_PUESTO (id_puesto ASC);
create index Relationship_71_FK on EMPLEADO_PUESTO (id_empleado ASC);

create table EMPLEADO_SUCURSAL (
   id_empleado_sucursal INTEGER               not null,
   id_empleado          INTEGER               not null,
   id_sucursal          INTEGER               not null,
   fecha_inicio         DATE                  not null,
   fecha_fin            DATE,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_EMPLEADO_SUCURSAL primary key (id_empleado_sucursal)
);

create index Relationship_66_FK on EMPLEADO_SUCURSAL (id_sucursal ASC);
create index Relationship_67_FK on EMPLEADO_SUCURSAL (id_empleado ASC);

create table ENVIO (
   id_envio             INTEGER               not null,
   id_empleado          INTEGER               not null,
   id_departamento      INTEGER               not null,
   id_sucursal          INTEGER               not null,
   id_factura           INTEGER               not null,
   id_vehiculo          INTEGER,
   fecha_envio          DATE                  not null,
   fecha_entrega        DATE,
   direccion_entrega    VARCHAR2(250)         not null,
   nombre_piloto        VARCHAR2(100),
   transporta_cliente   CHAR(1)              default 'N'  not null,
   estado               VARCHAR2(20)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_ENVIO primary key (id_envio)
);

create index Relationship_55_FK on ENVIO (id_factura ASC);
create index Relationship_56_FK on ENVIO (id_sucursal ASC);
create index Relationship_57_FK on ENVIO (id_vehiculo ASC);
create index Relationship_58_FK on ENVIO (id_empleado ASC);
create index Relationship_59_FK on ENVIO (id_departamento ASC);

create table FACTURA (
   id_factura           INTEGER               not null,
   id_cliente           INTEGER               not null,
   id_empleado_sucursal INTEGER               not null,
   serie                VARCHAR2(10)          not null,
   numero               NUMBER(10)            not null,
   fecha                DATE                  not null,
   condicion_pago       VARCHAR2(10)          not null,
   fecha_vencimiento    DATE,
   subtotal             NUMBER(14,2)          not null,
   impuesto             NUMBER(14,2)         default 0  not null,
   total                NUMBER(14,2)          not null,
   saldo                NUMBER(14,2)          not null,
   estado               VARCHAR2(15)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_FACTURA primary key (id_factura)
);

create index Relationship_86_FK on FACTURA (id_empleado_sucursal ASC);
create index Relationship_87_FK on FACTURA (id_cliente ASC);

create table GARANTIA (
   id_garantia          INTEGER               not null,
   id_empleado          INTEGER               not null,
   id_factura           INTEGER               not null,
   id_nota_credito      INTEGER,
   fecha_reclamo        DATE                  not null,
   estado               VARCHAR2(20)          not null,
   observaciones        VARCHAR2(300),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_GARANTIA primary key (id_garantia)
);

create index Relationship_52_FK on GARANTIA (id_empleado ASC);
create index Relationship_53_FK on GARANTIA (id_nota_credito ASC);
create index Relationship_79_FK on GARANTIA (id_factura ASC);

create table MARCA (
   id_marca             INTEGER               not null,
   nombre               VARCHAR2(60)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_MARCA primary key (id_marca)
);

create table MENU (
   id_menu              INTEGER               not null,
   id_modulo            INTEGER               not null,
   nombre               VARCHAR2(50)          not null,
   orden                NUMBER(3)            default 0  not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_MENU primary key (id_menu)
);

create index Relationship_3_FK on MENU (id_modulo ASC);

create table METODO_PAGO (
   id_metodo_pago       INTEGER               not null,
   nombre               VARCHAR2(30)          not null,
   requiere_referencia  CHAR(1)              default 'N'  not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_METODO_PAGO primary key (id_metodo_pago)
);

create table MODULO (
   id_modulo            INTEGER               not null,
   nombre               VARCHAR2(50)          not null,
   descripcion          VARCHAR2(200),
   orden                NUMBER(3)            default 0  not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_MODULO primary key (id_modulo)
);

create table MONEDA (
   id_moneda            INTEGER               not null,
   nombre               VARCHAR2(50)          not null,
   codigo_iso           CHAR(3)               not null,
   simbolo              VARCHAR2(5)           not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_MONEDA primary key (id_moneda)
);

create table MOTIVO_BAJA (
   id_motivo_baja       INTEGER               not null,
   nombre               VARCHAR2(60)          not null,
   descripcion          VARCHAR2(200),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_MOTIVO_BAJA primary key (id_motivo_baja)
);

create table MOVIMIENTO_INVENTARIO (
   id_movimiento_inventario INTEGER               not null,
   id_producto_sucursal INTEGER               not null,
   id_tipo_movimiento   INTEGER               not null,
   id_motivo_baja       INTEGER,
   fecha                TIMESTAMP             not null,
   cantidad             NUMBER(12,2)          not null,
   existencia_anterior  NUMBER(12,2)          not null,
   existencia_nueva     NUMBER(12,2)          not null,
   referencia           VARCHAR2(60),
   observacion          VARCHAR2(300),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_MOVIMIENTO_INVENTARIO primary key (id_movimiento_inventario)
);

create index Relationship_72_FK on MOVIMIENTO_INVENTARIO (id_motivo_baja ASC);
create index Relationship_73_FK on MOVIMIENTO_INVENTARIO (id_tipo_movimiento ASC);
create index Relationship_74_FK on MOVIMIENTO_INVENTARIO (id_producto_sucursal ASC);

create table MUNICIPIO (
   id_municipio         INTEGER               not null,
   id_departamento      INTEGER               not null,
   nombre               VARCHAR2(60)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_MUNICIPIO primary key (id_municipio)
);

create index Relationship_65_FK on MUNICIPIO (id_departamento ASC);

create table NOTA_CREDITO (
   id_nota_credito      INTEGER               not null,
   id_empleado          INTEGER               not null,
   id_factura           INTEGER               not null,
   numero               VARCHAR2(20)          not null,
   fecha                DATE                  not null,
   motivo               VARCHAR2(200)         not null,
   total                NUMBER(14,2)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_NOTA_CREDITO primary key (id_nota_credito)
);

create index Relationship_35_FK on NOTA_CREDITO (id_factura ASC);
create index Relationship_36_FK on NOTA_CREDITO (id_empleado ASC);

create table OPCION (
   id_opcion            INTEGER               not null,
   id_menu              INTEGER               not null,
   nombre               VARCHAR2(50)          not null,
   ruta                 VARCHAR2(200),
   orden                NUMBER(3)            default 0  not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_OPCION primary key (id_opcion)
);

create index Relationship_4_FK on OPCION (id_menu ASC);

create table PAGO_CLIENTE (
   id_pago_cliente      INTEGER               not null,
   id_cliente           INTEGER               not null,
   id_empleado_sucursal INTEGER               not null,
   id_factura           INTEGER               not null,
   id_metodo_pago       INTEGER               not null,
   fecha                DATE                  not null,
   monto                NUMBER(14,2)          not null,
   referencia           VARCHAR2(50),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_PAGO_CLIENTE primary key (id_pago_cliente)
);

create index Relationship_39_FK on PAGO_CLIENTE (id_cliente ASC);
create index Relationship_40_FK on PAGO_CLIENTE (id_factura ASC);
create index Relationship_42_FK on PAGO_CLIENTE (id_metodo_pago ASC);
create index Relationship_83_FK on PAGO_CLIENTE (id_empleado_sucursal ASC);

create table PAGO_PROVEEDOR (
   id_pago_proveedor    INTEGER               not null,
   id_empleado_sucursal INTEGER               not null,
   id_compra            INTEGER               not null,
   id_metodo_pago       INTEGER               not null,
   fecha                DATE                  not null,
   monto                NUMBER(14,2)          not null,
   referencia           VARCHAR2(50),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_PAGO_PROVEEDOR primary key (id_pago_proveedor)
);

create index Relationship_26_FK on PAGO_PROVEEDOR (id_compra ASC);
create index Relationship_27_FK on PAGO_PROVEEDOR (id_metodo_pago ASC);
create index Relationship_84_FK on PAGO_PROVEEDOR (id_empleado_sucursal ASC);

create table PAIS (
   id_pais              INTEGER               not null,
   id_moneda            INTEGER               not null,
   nombre               VARCHAR2(60)          not null,
   codigo_iso           CHAR(2)               not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_PAIS primary key (id_pais)
);

create index Relationship_64_FK on PAIS (id_moneda ASC);

create table PERSONA (
   id_persona           INTEGER               not null,
   nombres              VARCHAR2(100)         not null,
   apellidos            VARCHAR2(100)         not null,
   nit                  VARCHAR2(20),
   documento_identidad  VARCHAR2(25),
   fecha_nacimiento     DATE,
   telefono             VARCHAR2(20),
   correo               VARCHAR2(100),
   direccion            VARCHAR2(200),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_PERSONA primary key (id_persona)
);

create table PRODUCTO (
   id_producto          INTEGER               not null,
   id_categoria         INTEGER               not null,
   id_marca             INTEGER               not null,
   codigo               VARCHAR2(30)          not null,
   nombre               VARCHAR2(120)         not null,
   descripcion          VARCHAR2(300),
   unidad_medida        VARCHAR2(20)          not null,
   precio_costo         NUMBER(12,2)          not null,
   precio_venta         NUMBER(12,2)          not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_PRODUCTO primary key (id_producto)
);

create index Relationship_12_FK on PRODUCTO (id_categoria ASC);
create index Relationship_13_FK on PRODUCTO (id_marca ASC);

create table PRODUCTO_SUCURSAL (
   id_producto_sucursal INTEGER               not null,
   id_sucursal          INTEGER               not null,
   id_producto          INTEGER               not null,
   existencia           NUMBER(12,2)         default 0  not null,
   existencia_minima    NUMBER(12,2)         default 0  not null,
   ubicacion_bodega     VARCHAR2(50),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_PRODUCTO_SUCURSAL primary key (id_producto_sucursal)
);

create index Relationship_75_FK on PRODUCTO_SUCURSAL (id_sucursal ASC);
create index Relationship_76_FK on PRODUCTO_SUCURSAL (id_producto ASC);

create table PROVEEDOR (
   id_proveedor         INTEGER               not null,
   id_pais              INTEGER               not null,
   nombre               VARCHAR2(100)         not null,
   nit                  VARCHAR2(20),
   telefono             VARCHAR2(20),
   correo               VARCHAR2(100),
   direccion            VARCHAR2(200),
   dias_credito         NUMBER(3)            default 0  not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_PROVEEDOR primary key (id_proveedor)
);

create index Relationship_20_FK on PROVEEDOR (id_pais ASC);

create table PUESTO (
   id_puesto            INTEGER               not null,
   nombre               VARCHAR2(50)          not null,
   descripcion          VARCHAR2(200),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_PUESTO primary key (id_puesto)
);

create table REGION_GEOGRAFICA (
   id_region_geografica INTEGER               not null,
   nombre               VARCHAR2(50)          not null,
   descripcion          VARCHAR2(200),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_REGION_GEOGRAFICA primary key (id_region_geografica)
);

create table ROL (
   id_rol               INTEGER               not null,
   nombre               VARCHAR2(50)          not null,
   descripcion          VARCHAR2(200),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_ROL primary key (id_rol)
);

create table ROL_OPCION (
   id_rol_opcion        INTEGER               not null,
   id_rol               INTEGER               not null,
   id_opcion            INTEGER               not null,
   puede_consultar      CHAR(1)              default 'S'  not null,
   puede_insertar       CHAR(1)              default 'N'  not null,
   puede_actualizar     CHAR(1)              default 'N'  not null,
   puede_eliminar       CHAR(1)              default 'N'  not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_ROL_OPCION primary key (id_rol_opcion)
);

create index Relationship_5_FK on ROL_OPCION (id_rol ASC);
create index Relationship_6_FK on ROL_OPCION (id_opcion ASC);

create table SUCURSAL (
   id_sucursal          INTEGER               not null,
   id_departamento      INTEGER               not null,
   nombre               VARCHAR2(80)          not null,
   direccion            VARCHAR2(200),
   telefono             VARCHAR2(20),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_SUCURSAL primary key (id_sucursal)
);

create index Relationship_9_FK on SUCURSAL (id_departamento ASC);

create table TIPO_MOVIMIENTO (
   id_tipo_movimiento   INTEGER               not null,
   nombre               VARCHAR2(50)          not null,
   signo                NUMBER(1)             not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_TIPO_MOVIMIENTO primary key (id_tipo_movimiento)
);

create table USUARIO (
   id_usuario           INTEGER               not null,
   id_rol               INTEGER               not null,
   id_empleado          INTEGER,
   nombre_usuario       VARCHAR2(50)          not null,
   clave                VARCHAR2(200)         not null,
   ultimo_acceso        TIMESTAMP,
   intentos_fallidos    NUMBER(2)            default 0  not null,
   bloqueado            CHAR(1)              default 'N'  not null,
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_USUARIO primary key (id_usuario)
);

create index Relationship_1_FK on USUARIO (id_empleado ASC);
create index Relationship_2_FK on USUARIO (id_rol ASC);

create table VEHICULO (
   id_vehiculo          INTEGER               not null,
   id_sucursal          INTEGER               not null,
   placa                VARCHAR2(15)          not null,
   tipo_placa           VARCHAR2(20)          not null,
   marca                VARCHAR2(40)          not null,
   modelo               VARCHAR2(40)          not null,
   capacidad_carga      NUMBER(10,2),
   fecha_creacion       TIMESTAMP             not null,
   usuario_creacion     VARCHAR2(50)          not null,
   fecha_modificacion   TIMESTAMP,
   usuario_modificacion VARCHAR2(50),
   estado_registro      CHAR(1)               not null,
   constraint PK_VEHICULO primary key (id_vehiculo)
);

create index Relationship_54_FK on VEHICULO (id_sucursal ASC);

--relaciones

alter table BITACORA add constraint FK_BITACORA_RELATIONS_USUARIO foreign key (id_usuario) references USUARIO (id_usuario);
alter table CLIENTE add constraint FK_CLIENTE_RELATIONS_PERSONA foreign key (id_persona) references PERSONA (id_persona);
alter table COMPRA add constraint FK_COMPRA_RELATIONS_PROVEEDO foreign key (id_proveedor) references PROVEEDOR (id_proveedor);
alter table COMPRA add constraint FK_COMPRA_RELATIONS_EMPLEADO foreign key (id_empleado_sucursal) references EMPLEADO_SUCURSAL (id_empleado_sucursal);
alter table DEPARTAMENTO add constraint FK_DEPARTAM_RELATIONS_PAIS foreign key (id_pais) references PAIS (id_pais);
alter table DEPARTAMENTO add constraint FK_DEPARTAM_RELATIONS_REGION_G foreign key (id_region_geografica) references REGION_GEOGRAFICA (id_region_geografica);
alter table DETALLE_COMPRA add constraint FK_DETALLE__RELATIONS_COMPRA foreign key (id_compra) references COMPRA (id_compra);
alter table DETALLE_COMPRA add constraint FK_DETALLE__RELATIONS_PRODUCTO foreign key (id_producto_sucursal) references PRODUCTO_SUCURSAL (id_producto_sucursal);
alter table DETALLE_ENVIO add constraint FK_DETALLE__RELATIONS_ENVIO foreign key (id_envio) references ENVIO (id_envio);
alter table DETALLE_ENVIO add constraint FK_DETALLE__RELATIONS_DETALLE_ foreign key (id_detalle_factura) references DETALLE_FACTURA (id_detalle_factura);
alter table DETALLE_FACTURA add constraint FK_DETALLE__RELATIONS_FACTURA foreign key (id_factura) references FACTURA (id_factura);
alter table DETALLE_FACTURA add constraint FK_DETALLE__RELATIONS_PRODUCTO foreign key (id_producto_sucursal) references PRODUCTO_SUCURSAL (id_producto_sucursal);
alter table DETALLE_GARANTIA add constraint FK_DETALLE__RELATIONS_GARANTIA foreign key (id_garantia) references GARANTIA (id_garantia);
alter table DETALLE_GARANTIA add constraint FK_DETALLE__RELATIONS_DETALLE_ foreign key (id_detalle_factura) references DETALLE_FACTURA (id_detalle_factura);
alter table DETALLE_NOTA_CREDITO add constraint FK_DETALLE__RELATIONS_NOTA_CRE foreign key (id_nota_credito) references NOTA_CREDITO (id_nota_credito);
alter table DETALLE_NOTA_CREDITO add constraint FK_DETALLE__RELATIONS_DETALLE_ foreign key (id_detalle_factura) references DETALLE_FACTURA (id_detalle_factura);
alter table DEVOLUCION add constraint FK_DEVOLUCI_RELATIONS_FACTURA foreign key (id_factura) references FACTURA (id_factura);
alter table DEVOLUCION add constraint FK_DEVOLUCI_RELATIONS_DETALLE_ foreign key (id_detalle_factura) references DETALLE_FACTURA (id_detalle_factura);
alter table DEVOLUCION add constraint FK_DEVOLUCI_RELATIONS_SUCURSAL foreign key (id_sucursal) references SUCURSAL (id_sucursal);
alter table DEVOLUCION add constraint FK_DEVOLUCI_RELATIONS_EMPLEADO foreign key (id_empleado) references EMPLEADO (id_empleado);
alter table DEVOLUCION add constraint FK_DEVOLUCI_RELATIONS_NOTA_CRE foreign key (id_nota_credito) references NOTA_CREDITO (id_nota_credito);
alter table EMPLEADO add constraint FK_EMPLEADO_RELATIONS_PERSONA foreign key (id_persona) references PERSONA (id_persona);
alter table EMPLEADO_PUESTO add constraint FK_EMPLEADO_RELATIONS_PUESTO foreign key (id_puesto) references PUESTO (id_puesto);
alter table EMPLEADO_PUESTO add constraint FK_EMPLEADO_RELATIONS_EMPLEADO foreign key (id_empleado) references EMPLEADO (id_empleado);
alter table EMPLEADO_SUCURSAL add constraint FK_EMPLEADO_RELATIONS_SUCURSAL foreign key (id_sucursal) references SUCURSAL (id_sucursal);
alter table EMPLEADO_SUCURSAL add constraint FK_EMPLEADO_RELATIONS_EMPLEADO foreign key (id_empleado) references EMPLEADO (id_empleado);
alter table ENVIO add constraint FK_ENVIO_RELATIONS_FACTURA foreign key (id_factura) references FACTURA (id_factura);
alter table ENVIO add constraint FK_ENVIO_RELATIONS_SUCURSAL foreign key (id_sucursal) references SUCURSAL (id_sucursal);
alter table ENVIO add constraint FK_ENVIO_RELATIONS_VEHICULO foreign key (id_vehiculo) references VEHICULO (id_vehiculo);
alter table ENVIO add constraint FK_ENVIO_RELATIONS_EMPLEADO foreign key (id_empleado) references EMPLEADO (id_empleado);
alter table ENVIO add constraint FK_ENVIO_RELATIONS_DEPARTAM foreign key (id_departamento) references DEPARTAMENTO (id_departamento);
alter table FACTURA add constraint FK_FACTURA_RELATIONS_EMPLEADO foreign key (id_empleado_sucursal) references EMPLEADO_SUCURSAL (id_empleado_sucursal);
alter table FACTURA add constraint FK_FACTURA_RELATIONS_CLIENTE foreign key (id_cliente) references CLIENTE (id_cliente);
alter table GARANTIA add constraint FK_GARANTIA_RELATIONS_EMPLEADO foreign key (id_empleado) references EMPLEADO (id_empleado);
alter table GARANTIA add constraint FK_GARANTIA_RELATIONS_NOTA_CRE foreign key (id_nota_credito) references NOTA_CREDITO (id_nota_credito);
alter table GARANTIA add constraint FK_GARANTIA_RELATIONS_FACTURA foreign key (id_factura) references FACTURA (id_factura);
alter table MENU add constraint FK_MENU_RELATIONS_MODULO foreign key (id_modulo) references MODULO (id_modulo);
alter table MOVIMIENTO_INVENTARIO add constraint FK_MOVIMIEN_RELATIONS_MOTIVO_B foreign key (id_motivo_baja) references MOTIVO_BAJA (id_motivo_baja);
alter table MOVIMIENTO_INVENTARIO add constraint FK_MOVIMIEN_RELATIONS_TIPO_MOV foreign key (id_tipo_movimiento) references TIPO_MOVIMIENTO (id_tipo_movimiento);
alter table MOVIMIENTO_INVENTARIO add constraint FK_MOVIMIEN_RELATIONS_PRODUCTO foreign key (id_producto_sucursal) references PRODUCTO_SUCURSAL (id_producto_sucursal);
alter table MUNICIPIO add constraint FK_MUNICIPI_RELATIONS_DEPARTAM foreign key (id_departamento) references DEPARTAMENTO (id_departamento);
alter table NOTA_CREDITO add constraint FK_NOTA_CRE_RELATIONS_FACTURA foreign key (id_factura) references FACTURA (id_factura);
alter table NOTA_CREDITO add constraint FK_NOTA_CRE_RELATIONS_EMPLEADO foreign key (id_empleado) references EMPLEADO (id_empleado);
alter table OPCION add constraint FK_OPCION_RELATIONS_MENU foreign key (id_menu) references MENU (id_menu);
alter table PAGO_CLIENTE add constraint FK_PAGO_CLI_RELATIONS_CLIENTE foreign key (id_cliente) references CLIENTE (id_cliente);
alter table PAGO_CLIENTE add constraint FK_PAGO_CLI_RELATIONS_FACTURA foreign key (id_factura) references FACTURA (id_factura);
alter table PAGO_CLIENTE add constraint FK_PAGO_CLI_RELATIONS_METODO_P foreign key (id_metodo_pago) references METODO_PAGO (id_metodo_pago);
alter table PAGO_CLIENTE add constraint FK_PAGO_CLI_RELATIONS_EMPLEADO foreign key (id_empleado_sucursal) references EMPLEADO_SUCURSAL (id_empleado_sucursal);
alter table PAGO_PROVEEDOR add constraint FK_PAGO_PRO_RELATIONS_COMPRA foreign key (id_compra) references COMPRA (id_compra);
alter table PAGO_PROVEEDOR add constraint FK_PAGO_PRO_RELATIONS_METODO_P foreign key (id_metodo_pago) references METODO_PAGO (id_metodo_pago);
alter table PAGO_PROVEEDOR add constraint FK_PAGO_PRO_RELATIONS_EMPLEADO foreign key (id_empleado_sucursal) references EMPLEADO_SUCURSAL (id_empleado_sucursal);
alter table PAIS add constraint FK_PAIS_RELATIONS_MONEDA foreign key (id_moneda) references MONEDA (id_moneda);
alter table PRODUCTO add constraint FK_PRODUCTO_RELATIONS_CATEGORI foreign key (id_categoria) references CATEGORIA (id_categoria);
alter table PRODUCTO add constraint FK_PRODUCTO_RELATIONS_MARCA foreign key (id_marca) references MARCA (id_marca);
alter table PRODUCTO_SUCURSAL add constraint FK_PRODUCTO_RELATIONS_SUCURSAL foreign key (id_sucursal) references SUCURSAL (id_sucursal);
alter table PRODUCTO_SUCURSAL add constraint FK_PRODUCTO_RELATIONS_PRODUCTO foreign key (id_producto) references PRODUCTO (id_producto);
alter table PROVEEDOR add constraint FK_PROVEEDO_RELATIONS_PAIS foreign key (id_pais) references PAIS (id_pais);
alter table ROL_OPCION add constraint FK_ROL_OPCI_RELATIONS_ROL foreign key (id_rol) references ROL (id_rol);
alter table ROL_OPCION add constraint FK_ROL_OPCI_RELATIONS_OPCION foreign key (id_opcion) references OPCION (id_opcion);
alter table SUCURSAL add constraint FK_SUCURSAL_RELATIONS_DEPARTAM foreign key (id_departamento) references DEPARTAMENTO (id_departamento);
alter table USUARIO add constraint FK_USUARIO_RELATIONS_EMPLEADO foreign key (id_empleado) references EMPLEADO (id_empleado);
alter table USUARIO add constraint FK_USUARIO_RELATIONS_ROL foreign key (id_rol) references ROL (id_rol);
alter table VEHICULO add constraint FK_VEHICULO_RELATIONS_SUCURSAL foreign key (id_sucursal) references SUCURSAL (id_sucursal);

ALTER TABLE DETALLE_FACTURA
ADD CONSTRAINT FK_DETFAC_PROD_SUCURSAL
FOREIGN KEY (id_producto_sucursal) REFERENCES PRODUCTO_SUCURSAL (id_producto_sucursal);

ALTER TABLE DETALLE_GARANTIA
ADD CONSTRAINT FK_DETGAR_DET_FACTURA
FOREIGN KEY (id_detalle_factura) REFERENCES DETALLE_FACTURA (id_detalle_factura);

ALTER TABLE DETALLE_NOTA_CREDITO
ADD CONSTRAINT FK_DETNC_DET_FACTURA
FOREIGN KEY (id_detalle_factura) REFERENCES DETALLE_FACTURA (id_detalle_factura);

ALTER TABLE EMPLEADO_SUCURSAL
ADD CONSTRAINT FK_EMPSUC_EMPLEADO_REF
FOREIGN KEY (id_empleado) REFERENCES EMPLEADO (id_empleado);

--secuencias

BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_BITACORA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_CATEGORIA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_CLIENTE START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_COMPRA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_DEPARTAMENTO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_DETALLE_COMPRA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_DETALLE_ENVIO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_DETALLE_FACTURA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_DETALLE_GARANTIA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_DETALLE_NOTA_CREDITO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_DEVOLUCION START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_EMPLEADO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_EMPLEADO_PUESTO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_EMPLEADO_SUCURSAL START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_ENVIO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_FACTURA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_GARANTIA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_MARCA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_MENU START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_METODO_PAGO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_MODULO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_MONEDA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_MOTIVO_BAJA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_MOVIMIENTO_INVENTARIO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_MUNICIPIO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_NOTA_CREDITO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_OPCION START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_PAGO_CLIENTE START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_PAGO_PROVEEDOR START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_PAIS START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_PERSONA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_PRODUCTO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_PRODUCTO_SUCURSAL START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_PROVEEDOR START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_PUESTO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_REGION_GEOGRAFICA START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_ROL START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_ROL_OPCION START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_SUCURSAL START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_TIPO_MOVIMIENTO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_USUARIO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_VEHICULO START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

--bitacora

CREATE OR REPLACE PROCEDURE PRC_BITACORA(
    P_TABLA           IN VARCHAR2,
    P_CAMPO           IN VARCHAR2,
    P_TIPO_MOVIMIENTO IN VARCHAR2,
    P_VALOR_ANTERIOR  IN VARCHAR2,
    P_VALOR_NUEVO     IN VARCHAR2,
    P_LLAVE           IN VARCHAR2) IS
PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
    INSERT INTO BITACORA (
        id_bitacora,
        fecha_hora,
        tabla_afectada,
        descripcion,
        tipo_evento,
        valor_anterior,
        valor_nuevo,
        ip_origen,
        id_registro
    )
    VALUES (
        SEQ_BITACORA.NEXTVAL,
        SYSTIMESTAMP,
        P_TABLA,
        P_CAMPO,
        P_TIPO_MOVIMIENTO,
        P_VALOR_ANTERIOR,
        P_VALOR_NUEVO,
        SYS_CONTEXT('USERENV','IP_ADDRESS'),
        P_LLAVE
    );
    COMMIT;
END;
/

--triggers

CREATE OR REPLACE TRIGGER TRG_BI_BITACORA
BEFORE INSERT ON BITACORA FOR EACH ROW
BEGIN
    IF :NEW.id_bitacora IS NULL THEN :NEW.id_bitacora := SEQ_BITACORA.NEXTVAL; END IF;
    :NEW.fecha_hora := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_CATEGORIA
BEFORE INSERT ON CATEGORIA FOR EACH ROW
BEGIN
    IF :NEW.id_categoria IS NULL THEN :NEW.id_categoria := SEQ_CATEGORIA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_CLIENTE
BEFORE INSERT ON CLIENTE FOR EACH ROW
BEGIN
    IF :NEW.id_cliente IS NULL THEN :NEW.id_cliente := SEQ_CLIENTE.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_COMPRA
BEFORE INSERT ON COMPRA FOR EACH ROW
BEGIN
    IF :NEW.id_compra IS NULL THEN :NEW.id_compra := SEQ_COMPRA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_DEPARTAMENTO
BEFORE INSERT ON DEPARTAMENTO FOR EACH ROW
BEGIN
    IF :NEW.id_departamento IS NULL THEN :NEW.id_departamento := SEQ_DEPARTAMENTO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_DETALLE_COMPRA
BEFORE INSERT ON DETALLE_COMPRA FOR EACH ROW
BEGIN
    IF :NEW.id_detalle_compra IS NULL THEN :NEW.id_detalle_compra := SEQ_DETALLE_COMPRA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_DETALLE_ENVIO
BEFORE INSERT ON DETALLE_ENVIO FOR EACH ROW
BEGIN
    IF :NEW.id_detalle_envio IS NULL THEN :NEW.id_detalle_envio := SEQ_DETALLE_ENVIO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_DETALLE_FACTURA
BEFORE INSERT ON DETALLE_FACTURA FOR EACH ROW
BEGIN
    IF :NEW.id_detalle_factura IS NULL THEN :NEW.id_detalle_factura := SEQ_DETALLE_FACTURA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_DETALLE_GARANTIA
BEFORE INSERT ON DETALLE_GARANTIA FOR EACH ROW
BEGIN
    IF :NEW.id_detalle_garantia IS NULL THEN :NEW.id_detalle_garantia := SEQ_DETALLE_GARANTIA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_DETALLE_NOTA_CREDITO
BEFORE INSERT ON DETALLE_NOTA_CREDITO FOR EACH ROW
BEGIN
    IF :NEW.id_detalle_nota_credito IS NULL THEN :NEW.id_detalle_nota_credito := SEQ_DETALLE_NOTA_CREDITO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_DEVOLUCION
BEFORE INSERT ON DEVOLUCION FOR EACH ROW
BEGIN
    IF :NEW.id_devolucion IS NULL THEN :NEW.id_devolucion := SEQ_DEVOLUCION.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_EMPLEADO
BEFORE INSERT ON EMPLEADO FOR EACH ROW
BEGIN
    IF :NEW.id_empleado IS NULL THEN :NEW.id_empleado := SEQ_EMPLEADO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_EMPLEADO_PUESTO
BEFORE INSERT ON EMPLEADO_PUESTO FOR EACH ROW
BEGIN
    IF :NEW.id_empleado_puesto IS NULL THEN :NEW.id_empleado_puesto := SEQ_EMPLEADO_PUESTO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_EMPLEADO_SUCURSAL
BEFORE INSERT ON EMPLEADO_SUCURSAL FOR EACH ROW
BEGIN
    IF :NEW.id_empleado_sucursal IS NULL THEN :NEW.id_empleado_sucursal := SEQ_EMPLEADO_SUCURSAL.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_ENVIO
BEFORE INSERT ON ENVIO FOR EACH ROW
BEGIN
    IF :NEW.id_envio IS NULL THEN :NEW.id_envio := SEQ_ENVIO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_FACTURA
BEFORE INSERT ON FACTURA FOR EACH ROW
BEGIN
    IF :NEW.id_factura IS NULL THEN :NEW.id_factura := SEQ_FACTURA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_GARANTIA
BEFORE INSERT ON GARANTIA FOR EACH ROW
BEGIN
    IF :NEW.id_garantia IS NULL THEN :NEW.id_garantia := SEQ_GARANTIA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_MARCA
BEFORE INSERT ON MARCA FOR EACH ROW
BEGIN
    IF :NEW.id_marca IS NULL THEN :NEW.id_marca := SEQ_MARCA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_MENU
BEFORE INSERT ON MENU FOR EACH ROW
BEGIN
    IF :NEW.id_menu IS NULL THEN :NEW.id_menu := SEQ_MENU.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_METODO_PAGO
BEFORE INSERT ON METODO_PAGO FOR EACH ROW
BEGIN
    IF :NEW.id_metodo_pago IS NULL THEN :NEW.id_metodo_pago := SEQ_METODO_PAGO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_MODULO
BEFORE INSERT ON MODULO FOR EACH ROW
BEGIN
    IF :NEW.id_modulo IS NULL THEN :NEW.id_modulo := SEQ_MODULO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_MONEDA
BEFORE INSERT ON MONEDA FOR EACH ROW
BEGIN
    IF :NEW.id_moneda IS NULL THEN :NEW.id_moneda := SEQ_MONEDA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_MOTIVO_BAJA
BEFORE INSERT ON MOTIVO_BAJA FOR EACH ROW
BEGIN
    IF :NEW.id_motivo_baja IS NULL THEN :NEW.id_motivo_baja := SEQ_MOTIVO_BAJA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_MOVIMIENTO_INVENTARIO
BEFORE INSERT ON MOVIMIENTO_INVENTARIO FOR EACH ROW
BEGIN
    IF :NEW.id_movimiento_inventario IS NULL THEN :NEW.id_movimiento_inventario := SEQ_MOVIMIENTO_INVENTARIO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_MUNICIPIO
BEFORE INSERT ON MUNICIPIO FOR EACH ROW
BEGIN
    IF :NEW.id_municipio IS NULL THEN :NEW.id_municipio := SEQ_MUNICIPIO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_NOTA_CREDITO
BEFORE INSERT ON NOTA_CREDITO FOR EACH ROW
BEGIN
    IF :NEW.id_nota_credito IS NULL THEN :NEW.id_nota_credito := SEQ_NOTA_CREDITO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_OPCION
BEFORE INSERT ON OPCION FOR EACH ROW
BEGIN
    IF :NEW.id_opcion IS NULL THEN :NEW.id_opcion := SEQ_OPCION.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_PAGO_CLIENTE
BEFORE INSERT ON PAGO_CLIENTE FOR EACH ROW
BEGIN
    IF :NEW.id_pago_cliente IS NULL THEN :NEW.id_pago_cliente := SEQ_PAGO_CLIENTE.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_PAGO_PROVEEDOR
BEFORE INSERT ON PAGO_PROVEEDOR FOR EACH ROW
BEGIN
    IF :NEW.id_pago_proveedor IS NULL THEN :NEW.id_pago_proveedor := SEQ_PAGO_PROVEEDOR.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_PAIS
BEFORE INSERT ON PAIS FOR EACH ROW
BEGIN
    IF :NEW.id_pais IS NULL THEN :NEW.id_pais := SEQ_PAIS.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_PERSONA
BEFORE INSERT ON PERSONA FOR EACH ROW
BEGIN
    IF :NEW.id_persona IS NULL THEN :NEW.id_persona := SEQ_PERSONA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_PRODUCTO
BEFORE INSERT ON PRODUCTO FOR EACH ROW
BEGIN
    IF :NEW.id_producto IS NULL THEN :NEW.id_producto := SEQ_PRODUCTO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_PRODUCTO_SUCURSAL
BEFORE INSERT ON PRODUCTO_SUCURSAL FOR EACH ROW
BEGIN
    IF :NEW.id_producto_sucursal IS NULL THEN :NEW.id_producto_sucursal := SEQ_PRODUCTO_SUCURSAL.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_PROVEEDOR
BEFORE INSERT ON PROVEEDOR FOR EACH ROW
BEGIN
    IF :NEW.id_proveedor IS NULL THEN :NEW.id_proveedor := SEQ_PROVEEDOR.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_PUESTO
BEFORE INSERT ON PUESTO FOR EACH ROW
BEGIN
    IF :NEW.id_puesto IS NULL THEN :NEW.id_puesto := SEQ_PUESTO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_REGION_GEOGRAFICA
BEFORE INSERT ON REGION_GEOGRAFICA FOR EACH ROW
BEGIN
    IF :NEW.id_region_geografica IS NULL THEN :NEW.id_region_geografica := SEQ_REGION_GEOGRAFICA.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_ROL
BEFORE INSERT ON ROL FOR EACH ROW
BEGIN
    IF :NEW.id_rol IS NULL THEN :NEW.id_rol := SEQ_ROL.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_ROL_OPCION
BEFORE INSERT ON ROL_OPCION FOR EACH ROW
BEGIN
    IF :NEW.id_rol_opcion IS NULL THEN :NEW.id_rol_opcion := SEQ_ROL_OPCION.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_SUCURSAL
BEFORE INSERT ON SUCURSAL FOR EACH ROW
BEGIN
    IF :NEW.id_sucursal IS NULL THEN :NEW.id_sucursal := SEQ_SUCURSAL.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_TIPO_MOVIMIENTO
BEFORE INSERT ON TIPO_MOVIMIENTO FOR EACH ROW
BEGIN
    IF :NEW.id_tipo_movimiento IS NULL THEN :NEW.id_tipo_movimiento := SEQ_TIPO_MOVIMIENTO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_USUARIO
BEFORE INSERT ON USUARIO FOR EACH ROW
BEGIN
    IF :NEW.id_usuario IS NULL THEN :NEW.id_usuario := SEQ_USUARIO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BI_VEHICULO
BEFORE INSERT ON VEHICULO FOR EACH ROW
BEGIN
    IF :NEW.id_vehiculo IS NULL THEN :NEW.id_vehiculo := SEQ_VEHICULO.NEXTVAL; END IF;
    :NEW.fecha_creacion := SYSTIMESTAMP;
    IF :NEW.usuario_creacion IS NULL THEN :NEW.usuario_creacion := NVL(SYS_CONTEXT('USERENV','SESSION_USER'), 'SYSTEM'); END IF;
    IF :NEW.estado_registro IS NULL THEN :NEW.estado_registro := 'A'; END IF;
END;
/

--triggers auditoria

CREATE OR REPLACE TRIGGER TRG_BUR_PRODUCTO_SUCURSAL
BEFORE UPDATE ON PRODUCTO_SUCURSAL
FOR EACH ROW
DECLARE
    V_JSON_ANTERIOR VARCHAR2(4000);
    V_JSON_NUEVO    VARCHAR2(4000);
BEGIN
    IF :OLD.existencia != :NEW.existencia THEN
        V_JSON_ANTERIOR := JSON_OBJECT(
            'id_producto_sucursal' VALUE :OLD.id_producto_sucursal,
            'id_sucursal'          VALUE :OLD.id_sucursal,
            'id_producto'          VALUE :OLD.id_producto,
            'existencia'           VALUE :OLD.existencia,
            'existencia_minima'    VALUE :OLD.existencia_minima
        );

        V_JSON_NUEVO := JSON_OBJECT(
            'id_producto_sucursal' VALUE :NEW.id_producto_sucursal,
            'id_sucursal'          VALUE :NEW.id_sucursal,
            'id_producto'          VALUE :NEW.id_producto,
            'existencia'           VALUE :NEW.existencia,
            'existencia_minima'    VALUE :NEW.existencia_minima
        );

        PRC_BITACORA('PRODUCTO_SUCURSAL', 'EXISTENCIA', 'UPDATE',
                     V_JSON_ANTERIOR, V_JSON_NUEVO, TO_CHAR(:NEW.id_producto_sucursal));
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20010, 'ERROR TRG_BUR_PRODUCTO_SUCURSAL: ' || SQLERRM);
END;
/

CREATE OR REPLACE TRIGGER TRG_BUR_FACTURA
BEFORE UPDATE OF estado ON FACTURA
FOR EACH ROW
DECLARE
    V_JSON_ANTERIOR VARCHAR2(4000);
    V_JSON_NUEVO    VARCHAR2(4000);
BEGIN
    IF :OLD.estado != 'ANULADA' AND :NEW.estado = 'ANULADA' THEN

        V_JSON_ANTERIOR := JSON_OBJECT(
            'id_factura' VALUE :OLD.id_factura,
            'serie'      VALUE :OLD.serie,
            'numero'     VALUE :OLD.numero,
            'fecha'      VALUE TO_CHAR(:OLD.fecha, 'YYYY-MM-DD'),
            'id_cliente' VALUE :OLD.id_cliente,
            'estado'     VALUE :OLD.estado
        );

        V_JSON_NUEVO := JSON_OBJECT(
            'id_factura' VALUE :NEW.id_factura,
            'serie'      VALUE :NEW.serie,
            'numero'     VALUE :NEW.numero,
            'fecha'      VALUE TO_CHAR(:NEW.fecha, 'YYYY-MM-DD'),
            'id_cliente' VALUE :NEW.id_cliente,
            'estado'     VALUE :NEW.estado
        );

        PRC_BITACORA('FACTURA', 'ESTADO', 'UPDATE',
                     V_JSON_ANTERIOR, V_JSON_NUEVO, TO_CHAR(:NEW.id_factura));

        FOR R_DET IN (
            SELECT id_producto_sucursal, cantidad
            FROM DETALLE_FACTURA
            WHERE id_factura = :NEW.id_factura
        ) LOOP
            UPDATE PRODUCTO_SUCURSAL
               SET existencia = existencia + R_DET.cantidad
             WHERE id_producto_sucursal = R_DET.id_producto_sucursal;
        END LOOP;

    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20011, 'ERROR TRG_BUR_FACTURA: ' || SQLERRM);
END;
/

CREATE OR REPLACE TRIGGER TRG_BIR_DETALLE_FACTURA
BEFORE INSERT ON DETALLE_FACTURA
FOR EACH ROW
BEGIN
    UPDATE PRODUCTO_SUCURSAL
       SET existencia = existencia - :NEW.cantidad
     WHERE id_producto_sucursal = :NEW.id_producto_sucursal;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20012, 'ERROR TRG_BIR_DETALLE_FACTURA: ' || SQLERRM);
END;
/

--limpieza de datos

DELETE FROM BITACORA;
DELETE FROM PAGO_CLIENTE;
DELETE FROM PAGO_PROVEEDOR;
DELETE FROM DETALLE_NOTA_CREDITO;
DELETE FROM DETALLE_GARANTIA;
DELETE FROM DETALLE_ENVIO;
DELETE FROM DEVOLUCION;
DELETE FROM GARANTIA;
DELETE FROM NOTA_CREDITO;
DELETE FROM ENVIO;
DELETE FROM DETALLE_FACTURA;
DELETE FROM FACTURA;
DELETE FROM DETALLE_COMPRA;
DELETE FROM COMPRA;
DELETE FROM MOVIMIENTO_INVENTARIO;
DELETE FROM PRODUCTO_SUCURSAL;
DELETE FROM PRODUCTO;
DELETE FROM MARCA;
DELETE FROM CATEGORIA;
DELETE FROM VEHICULO;
DELETE FROM USUARIO;
DELETE FROM EMPLEADO_PUESTO;
DELETE FROM EMPLEADO_SUCURSAL;
DELETE FROM EMPLEADO;
DELETE FROM CLIENTE;
DELETE FROM PERSONA;
DELETE FROM PROVEEDOR;
DELETE FROM ROL_OPCION;
DELETE FROM OPCION;
DELETE FROM MENU;
DELETE FROM MODULO;
DELETE FROM ROL;
DELETE FROM PUESTO;
DELETE FROM SUCURSAL;
DELETE FROM MUNICIPIO;
DELETE FROM DEPARTAMENTO;
DELETE FROM PAIS;
DELETE FROM REGION_GEOGRAFICA;
DELETE FROM MONEDA;
DELETE FROM METODO_PAGO;
DELETE FROM TIPO_MOVIMIENTO;
DELETE FROM MOTIVO_BAJA;
COMMIT;

BEGIN
  FOR s IN (SELECT sequence_name FROM user_sequences WHERE sequence_name LIKE 'SEQ\_%' ESCAPE '\') LOOP
    EXECUTE IMMEDIATE 'DROP SEQUENCE ' || s.sequence_name;
    EXECUTE IMMEDIATE 'CREATE SEQUENCE ' || s.sequence_name || ' START WITH 1 INCREMENT BY 1 NOCACHE';
  END LOOP;
END;
/

--restricciones

BEGIN EXECUTE IMMEDIATE 'ALTER TABLE MONEDA ADD CONSTRAINT UQ_MONEDA_ISO UNIQUE (codigo_iso)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE PAIS ADD CONSTRAINT UQ_PAIS_ISO UNIQUE (codigo_iso)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE REGION_GEOGRAFICA ADD CONSTRAINT UQ_REGION_NOMBRE UNIQUE (nombre)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE DEPARTAMENTO ADD CONSTRAINT UQ_DEPTO_PAIS_NOMBRE UNIQUE (id_pais, nombre)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE SUCURSAL ADD CONSTRAINT UQ_SUCURSAL_NOMBRE UNIQUE (nombre)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE ROL ADD CONSTRAINT UQ_ROL_NOMBRE UNIQUE (nombre)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE PUESTO ADD CONSTRAINT UQ_PUESTO_NOMBRE UNIQUE (nombre)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE METODO_PAGO ADD CONSTRAINT UQ_METODO_PAGO_NOMBRE UNIQUE (nombre)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TIPO_MOVIMIENTO ADD CONSTRAINT UQ_TIPO_MOV_NOMBRE UNIQUE (nombre)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE MOTIVO_BAJA ADD CONSTRAINT UQ_MOTIVO_BAJA_NOMBRE UNIQUE (nombre)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE CATEGORIA ADD CONSTRAINT UQ_CATEGORIA_NOMBRE UNIQUE (nombre)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE MARCA ADD CONSTRAINT UQ_MARCA_NOMBRE UNIQUE (nombre)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE MODULO ADD CONSTRAINT UQ_MODULO_NOMBRE UNIQUE (nombre)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE ROL_OPCION ADD CONSTRAINT UQ_ROL_OPCION UNIQUE (id_rol, id_opcion)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE USUARIO ADD CONSTRAINT UQ_USUARIO_NOMBRE UNIQUE (nombre_usuario)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE EMPLEADO ADD CONSTRAINT UQ_EMPLEADO_CODIGO UNIQUE (codigo_empleado)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE PRODUCTO ADD CONSTRAINT UQ_PRODUCTO_CODIGO UNIQUE (codigo)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE PRODUCTO_SUCURSAL ADD CONSTRAINT UQ_PROD_SUCURSAL UNIQUE (id_sucursal, id_producto)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE FACTURA ADD CONSTRAINT UQ_FACTURA_SERIE_NUM UNIQUE (serie, numero)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE NOTA_CREDITO ADD CONSTRAINT UQ_NOTA_CREDITO_NUM UNIQUE (numero)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE VEHICULO ADD CONSTRAINT UQ_VEHICULO_PLACA UNIQUE (placa)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE PRODUCTO_SUCURSAL ADD CONSTRAINT CK_PS_EXISTENCIA CHECK (existencia >= 0)'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TIPO_MOVIMIENTO ADD CONSTRAINT CK_TIPO_MOV_SIGNO CHECK (signo IN (1, -1))'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

--geografia y sucursales

INSERT INTO MONEDA (nombre, codigo_iso, simbolo) VALUES ('Quetzal', 'GTQ', 'Q');
INSERT INTO MONEDA (nombre, codigo_iso, simbolo) VALUES ('Dólar Estadounidense', 'USD', '$');
INSERT INTO MONEDA (nombre, codigo_iso, simbolo) VALUES ('Lempira', 'HNL', 'L');

INSERT INTO PAIS (id_moneda, nombre, codigo_iso) VALUES ((SELECT id_moneda FROM MONEDA WHERE codigo_iso = 'GTQ'), 'Guatemala', 'GT');
INSERT INTO PAIS (id_moneda, nombre, codigo_iso) VALUES ((SELECT id_moneda FROM MONEDA WHERE codigo_iso = 'USD'), 'El Salvador', 'SV');
INSERT INTO PAIS (id_moneda, nombre, codigo_iso) VALUES ((SELECT id_moneda FROM MONEDA WHERE codigo_iso = 'HNL'), 'Honduras', 'HN');

INSERT INTO REGION_GEOGRAFICA (nombre, descripcion) VALUES ('Norte', 'Área geográfica norte');
INSERT INTO REGION_GEOGRAFICA (nombre, descripcion) VALUES ('Sur', 'Área geográfica sur');
INSERT INTO REGION_GEOGRAFICA (nombre, descripcion) VALUES ('Oriente', 'Área geográfica oriente');
INSERT INTO REGION_GEOGRAFICA (nombre, descripcion) VALUES ('Occidente', 'Área geográfica occidente');

INSERT INTO DEPARTAMENTO (id_pais, id_region_geografica, nombre) VALUES ((SELECT id_pais FROM PAIS WHERE codigo_iso = 'GT'), (SELECT id_region_geografica FROM REGION_GEOGRAFICA WHERE nombre = 'Sur'), 'Guatemala');
INSERT INTO DEPARTAMENTO (id_pais, id_region_geografica, nombre) VALUES ((SELECT id_pais FROM PAIS WHERE codigo_iso = 'GT'), (SELECT id_region_geografica FROM REGION_GEOGRAFICA WHERE nombre = 'Occidente'), 'Quetzaltenango');
INSERT INTO DEPARTAMENTO (id_pais, id_region_geografica, nombre) VALUES ((SELECT id_pais FROM PAIS WHERE codigo_iso = 'GT'), (SELECT id_region_geografica FROM REGION_GEOGRAFICA WHERE nombre = 'Norte'), 'Alta Verapaz');
INSERT INTO DEPARTAMENTO (id_pais, id_region_geografica, nombre) VALUES ((SELECT id_pais FROM PAIS WHERE codigo_iso = 'GT'), (SELECT id_region_geografica FROM REGION_GEOGRAFICA WHERE nombre = 'Oriente'), 'Zacapa');
INSERT INTO DEPARTAMENTO (id_pais, id_region_geografica, nombre) VALUES ((SELECT id_pais FROM PAIS WHERE codigo_iso = 'SV'), (SELECT id_region_geografica FROM REGION_GEOGRAFICA WHERE nombre = 'Sur'), 'San Salvador');
INSERT INTO DEPARTAMENTO (id_pais, id_region_geografica, nombre) VALUES ((SELECT id_pais FROM PAIS WHERE codigo_iso = 'HN'), (SELECT id_region_geografica FROM REGION_GEOGRAFICA WHERE nombre = 'Sur'), 'Francisco Morazán');

INSERT INTO MUNICIPIO (id_departamento, nombre) VALUES ((SELECT d.id_departamento FROM DEPARTAMENTO d JOIN PAIS p ON p.id_pais = d.id_pais WHERE p.codigo_iso = 'GT' AND d.nombre = 'Guatemala'), 'Guatemala');
INSERT INTO MUNICIPIO (id_departamento, nombre) VALUES ((SELECT d.id_departamento FROM DEPARTAMENTO d JOIN PAIS p ON p.id_pais = d.id_pais WHERE p.codigo_iso = 'GT' AND d.nombre = 'Guatemala'), 'Mixco');
INSERT INTO MUNICIPIO (id_departamento, nombre) VALUES ((SELECT d.id_departamento FROM DEPARTAMENTO d JOIN PAIS p ON p.id_pais = d.id_pais WHERE p.codigo_iso = 'GT' AND d.nombre = 'Quetzaltenango'), 'Quetzaltenango');
INSERT INTO MUNICIPIO (id_departamento, nombre) VALUES ((SELECT d.id_departamento FROM DEPARTAMENTO d JOIN PAIS p ON p.id_pais = d.id_pais WHERE p.codigo_iso = 'SV' AND d.nombre = 'San Salvador'), 'San Salvador');
INSERT INTO MUNICIPIO (id_departamento, nombre) VALUES ((SELECT d.id_departamento FROM DEPARTAMENTO d JOIN PAIS p ON p.id_pais = d.id_pais WHERE p.codigo_iso = 'HN' AND d.nombre = 'Francisco Morazán'), 'Tegucigalpa');

INSERT INTO SUCURSAL (id_departamento, nombre, direccion, telefono) VALUES ((SELECT d.id_departamento FROM DEPARTAMENTO d JOIN PAIS p ON p.id_pais = d.id_pais WHERE p.codigo_iso = 'GT' AND d.nombre = 'Guatemala'), 'Sucursal Central Guatemala', 'Calzada Aguilar Batres 22-01 Zona 12', '+502 2200-1111');
INSERT INTO SUCURSAL (id_departamento, nombre, direccion, telefono) VALUES ((SELECT d.id_departamento FROM DEPARTAMENTO d JOIN PAIS p ON p.id_pais = d.id_pais WHERE p.codigo_iso = 'GT' AND d.nombre = 'Quetzaltenango'), 'Sucursal Quetzaltenango', 'Avenida Las Américas 8-12 Zona 3', '+502 7700-2222');
INSERT INTO SUCURSAL (id_departamento, nombre, direccion, telefono) VALUES ((SELECT d.id_departamento FROM DEPARTAMENTO d JOIN PAIS p ON p.id_pais = d.id_pais WHERE p.codigo_iso = 'SV' AND d.nombre = 'San Salvador'), 'Sucursal San Salvador', 'Bulevar de los Héroes N-15', '+503 2500-3333');
INSERT INTO SUCURSAL (id_departamento, nombre, direccion, telefono) VALUES ((SELECT d.id_departamento FROM DEPARTAMENTO d JOIN PAIS p ON p.id_pais = d.id_pais WHERE p.codigo_iso = 'HN' AND d.nombre = 'Francisco Morazán'), 'Sucursal Tegucigalpa', 'Bulevar Morazán, Edificio Ferretero', '+504 2200-4444');

--catalogos y seguridad

INSERT INTO METODO_PAGO (nombre, requiere_referencia) VALUES ('Efectivo', 'N');
INSERT INTO METODO_PAGO (nombre, requiere_referencia) VALUES ('Tarjeta', 'S');
INSERT INTO METODO_PAGO (nombre, requiere_referencia) VALUES ('Transferencia', 'S');
INSERT INTO METODO_PAGO (nombre, requiere_referencia) VALUES ('Cheque', 'S');

INSERT INTO ROL (nombre, descripcion) VALUES ('Administrador General', 'Acceso total al sistema');
INSERT INTO ROL (nombre, descripcion) VALUES ('Cajero', 'Facturación y cobros');

INSERT INTO PUESTO (nombre, descripcion) VALUES ('Gerente Regional', 'Supervisión regional');
INSERT INTO PUESTO (nombre, descripcion) VALUES ('Encargado de Caja', 'Cajero principal');

INSERT INTO TIPO_MOVIMIENTO (nombre, signo) VALUES ('Entrada por Compra', 1);
INSERT INTO TIPO_MOVIMIENTO (nombre, signo) VALUES ('Salida por Venta', -1);
INSERT INTO TIPO_MOVIMIENTO (nombre, signo) VALUES ('Ajuste Positivo', 1);
INSERT INTO TIPO_MOVIMIENTO (nombre, signo) VALUES ('Baja de Inventario', -1);

INSERT INTO MOTIVO_BAJA (nombre, descripcion) VALUES ('Deterioro/Daño', 'Producto dañado en bodega');
INSERT INTO MOTIVO_BAJA (nombre, descripcion) VALUES ('Robo/Pérdida', 'Faltante de inventario');

INSERT INTO CATEGORIA (nombre, descripcion) VALUES ('Herramientas Manuales', 'Martillos, desarmadores');
INSERT INTO CATEGORIA (nombre, descripcion) VALUES ('Herramientas Eléctricas', 'Taladros, pulidoras');

INSERT INTO MARCA (nombre) VALUES ('Truper');
INSERT INTO MARCA (nombre) VALUES ('DeWalt');

INSERT INTO MODULO (nombre, descripcion, orden) VALUES ('Seguridad', 'Usuarios y roles', 1);
INSERT INTO MODULO (nombre, descripcion, orden) VALUES ('Ventas', 'Facturación', 2);

INSERT INTO MENU (id_modulo, nombre, orden) VALUES ((SELECT id_modulo FROM MODULO WHERE nombre = 'Seguridad'), 'Administración', 1);
INSERT INTO MENU (id_modulo, nombre, orden) VALUES ((SELECT id_modulo FROM MODULO WHERE nombre = 'Ventas'), 'Facturación', 1);

INSERT INTO OPCION (id_menu, nombre, ruta, orden) VALUES ((SELECT id_menu FROM MENU WHERE nombre = 'Administración'), 'Gestión de Usuarios', '/admin/usuarios', 1);
INSERT INTO OPCION (id_menu, nombre, ruta, orden) VALUES ((SELECT id_menu FROM MENU WHERE nombre = 'Facturación'), 'Emisión de Factura', '/ventas/facturar', 1);

INSERT INTO ROL_OPCION (id_rol, id_opcion, puede_consultar, puede_insertar, puede_actualizar, puede_eliminar)
VALUES ((SELECT id_rol FROM ROL WHERE nombre = 'Administrador General'), (SELECT id_opcion FROM OPCION WHERE nombre = 'Gestión de Usuarios'), 'S', 'S', 'S', 'S');
INSERT INTO ROL_OPCION (id_rol, id_opcion, puede_consultar, puede_insertar, puede_actualizar, puede_eliminar)
VALUES ((SELECT id_rol FROM ROL WHERE nombre = 'Administrador General'), (SELECT id_opcion FROM OPCION WHERE nombre = 'Emisión de Factura'), 'S', 'S', 'S', 'S');
INSERT INTO ROL_OPCION (id_rol, id_opcion, puede_consultar, puede_insertar, puede_actualizar, puede_eliminar)
VALUES ((SELECT id_rol FROM ROL WHERE nombre = 'Cajero'), (SELECT id_opcion FROM OPCION WHERE nombre = 'Emisión de Factura'), 'S', 'S', 'N', 'N');

--personas y empleados

INSERT INTO PERSONA (nombres, apellidos, nit, documento_identidad, fecha_nacimiento, telefono, correo, direccion)
VALUES ('Carlos Alberto', 'Mendoza Gómez', '854123-9', '2541896320101', DATE '1988-05-12', '5555-0101', 'cmendoza@gmail.com', 'Zona 10, Guatemala');
INSERT INTO PERSONA (nombres, apellidos, nit, documento_identidad, fecha_nacimiento, telefono, correo, direccion)
VALUES ('Ana Lucía', 'Martínez López', '741258-3', '1985472130101', DATE '1995-09-30', '5555-0202', 'amartinez@gmail.com', 'Mixco, Guatemala');

INSERT INTO EMPLEADO (id_persona, codigo_empleado, fecha_contratacion)
VALUES ((SELECT id_persona FROM PERSONA WHERE nit = '854123-9'), 'EMP-001', DATE '2023-01-15');
INSERT INTO EMPLEADO (id_persona, codigo_empleado, fecha_contratacion)
VALUES ((SELECT id_persona FROM PERSONA WHERE nit = '741258-3'), 'EMP-002', DATE '2023-03-01');

INSERT INTO EMPLEADO_PUESTO (id_empleado, id_puesto, fecha_inicio)
VALUES ((SELECT id_empleado FROM EMPLEADO WHERE codigo_empleado = 'EMP-001'), (SELECT id_puesto FROM PUESTO WHERE nombre = 'Gerente Regional'), DATE '2023-01-15');
INSERT INTO EMPLEADO_PUESTO (id_empleado, id_puesto, fecha_inicio)
VALUES ((SELECT id_empleado FROM EMPLEADO WHERE codigo_empleado = 'EMP-002'), (SELECT id_puesto FROM PUESTO WHERE nombre = 'Encargado de Caja'), DATE '2023-03-01');

INSERT INTO EMPLEADO_SUCURSAL (id_empleado, id_sucursal, fecha_inicio)
VALUES ((SELECT id_empleado FROM EMPLEADO WHERE codigo_empleado = 'EMP-001'), (SELECT id_sucursal FROM SUCURSAL WHERE nombre = 'Sucursal Central Guatemala'), DATE '2023-01-15');
INSERT INTO EMPLEADO_SUCURSAL (id_empleado, id_sucursal, fecha_inicio)
VALUES ((SELECT id_empleado FROM EMPLEADO WHERE codigo_empleado = 'EMP-002'), (SELECT id_sucursal FROM SUCURSAL WHERE nombre = 'Sucursal Central Guatemala'), DATE '2023-03-01');

INSERT INTO USUARIO (id_rol, id_empleado, nombre_usuario, clave)
VALUES ((SELECT id_rol FROM ROL WHERE nombre = 'Administrador General'), (SELECT id_empleado FROM EMPLEADO WHERE codigo_empleado = 'EMP-001'), 'admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918');
INSERT INTO USUARIO (id_rol, id_empleado, nombre_usuario, clave)
VALUES ((SELECT id_rol FROM ROL WHERE nombre = 'Cajero'), (SELECT id_empleado FROM EMPLEADO WHERE codigo_empleado = 'EMP-002'), 'cajero1', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918');

INSERT INTO CLIENTE (id_persona, tipo_cliente, limite_credito, dias_credito, fecha_registro)
VALUES ((SELECT id_persona FROM PERSONA WHERE nit = '741258-3'), 'I', 5000.00, 30, SYSDATE);

INSERT INTO PROVEEDOR (id_pais, nombre, nit, telefono, correo, direccion, dias_credito)
VALUES ((SELECT id_pais FROM PAIS WHERE codigo_iso = 'GT'), 'Distribuidora Ferretera El Sol', '1234567-8', '+502 2300-5555', 'ventas@elsol.com', 'Zona 4, Guatemala', 30);

INSERT INTO VEHICULO (id_sucursal, placa, tipo_placa, marca, modelo, capacidad_carga)
VALUES ((SELECT id_sucursal FROM SUCURSAL WHERE nombre = 'Sucursal Central Guatemala'), 'C-152BXX', 'Comercial', 'Isuzu', 'NKR 2022', 3500.00);

--productos e inventario

INSERT INTO PRODUCTO (id_categoria, id_marca, codigo, nombre, descripcion, unidad_medida, precio_costo, precio_venta)
VALUES ((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Herramientas Manuales'), (SELECT id_marca FROM MARCA WHERE nombre = 'Truper'), 'HERR-001', 'Martillo de Uña 16oz', 'Martillo Truper', 'Unidad', 35.00, 65.00);
INSERT INTO PRODUCTO (id_categoria, id_marca, codigo, nombre, descripcion, unidad_medida, precio_costo, precio_venta)
VALUES ((SELECT id_categoria FROM CATEGORIA WHERE nombre = 'Herramientas Eléctricas'), (SELECT id_marca FROM MARCA WHERE nombre = 'DeWalt'), 'ELEC-001', 'Taladro Percutor 1/2 20V', 'Taladro DeWalt', 'Unidad', 650.00, 990.00);

INSERT INTO PRODUCTO_SUCURSAL (id_sucursal, id_producto, existencia, existencia_minima, ubicacion_bodega)
VALUES ((SELECT id_sucursal FROM SUCURSAL WHERE nombre = 'Sucursal Central Guatemala'), (SELECT id_producto FROM PRODUCTO WHERE codigo = 'HERR-001'), 100, 10, 'Pasillo A-1');
INSERT INTO PRODUCTO_SUCURSAL (id_sucursal, id_producto, existencia, existencia_minima, ubicacion_bodega)
VALUES ((SELECT id_sucursal FROM SUCURSAL WHERE nombre = 'Sucursal Central Guatemala'), (SELECT id_producto FROM PRODUCTO WHERE codigo = 'ELEC-001'), 25, 5, 'Pasillo B-3');

INSERT INTO COMPRA (id_empleado_sucursal, id_proveedor, numero_documento, fecha, condicion_pago, total, saldo, estado)
VALUES ((SELECT es.id_empleado_sucursal FROM EMPLEADO_SUCURSAL es JOIN EMPLEADO e ON e.id_empleado = es.id_empleado WHERE e.codigo_empleado = 'EMP-001'),
        (SELECT id_proveedor FROM PROVEEDOR WHERE nombre = 'Distribuidora Ferretera El Sol'),
        'FAC-PROV-9988', DATE '2026-03-01', 'CONTADO', 3500.00, 0, 'PAGADA');

INSERT INTO DETALLE_COMPRA (id_compra, id_producto_sucursal, cantidad, costo_unitario, subtotal)
VALUES ((SELECT id_compra FROM COMPRA WHERE numero_documento = 'FAC-PROV-9988'),
        (SELECT ps.id_producto_sucursal FROM PRODUCTO_SUCURSAL ps JOIN PRODUCTO p ON p.id_producto = ps.id_producto WHERE p.codigo = 'HERR-001'),
        100, 35.00, 3500.00);

INSERT INTO FACTURA (id_cliente, id_empleado_sucursal, serie, numero, fecha, condicion_pago, subtotal, impuesto, total, saldo, estado)
VALUES ((SELECT c.id_cliente FROM CLIENTE c JOIN PERSONA p ON p.id_persona = c.id_persona WHERE p.nit = '741258-3'),
        (SELECT es.id_empleado_sucursal FROM EMPLEADO_SUCURSAL es JOIN EMPLEADO e ON e.id_empleado = es.id_empleado WHERE e.codigo_empleado = 'EMP-002'),
        'A001', 1001, SYSDATE, 'CONTADO', 58.04, 6.96, 65.00, 0, 'PAGADA');

INSERT INTO DETALLE_FACTURA (id_factura, id_producto_sucursal, cantidad, precio_unitario, subtotal)
VALUES ((SELECT id_factura FROM FACTURA WHERE serie = 'A001' AND numero = 1001),
        (SELECT ps.id_producto_sucursal FROM PRODUCTO_SUCURSAL ps JOIN PRODUCTO p ON p.id_producto = ps.id_producto WHERE p.codigo = 'HERR-001'),
        1, 65.00, 65.00);

INSERT INTO PAGO_CLIENTE (id_cliente, id_empleado_sucursal, id_factura, id_metodo_pago, fecha, monto, referencia)
VALUES ((SELECT c.id_cliente FROM CLIENTE c JOIN PERSONA p ON p.id_persona = c.id_persona WHERE p.nit = '741258-3'),
        (SELECT es.id_empleado_sucursal FROM EMPLEADO_SUCURSAL es JOIN EMPLEADO e ON e.id_empleado = es.id_empleado WHERE e.codigo_empleado = 'EMP-002'),
        (SELECT id_factura FROM FACTURA WHERE serie = 'A001' AND numero = 1001),
        (SELECT id_metodo_pago FROM METODO_PAGO WHERE nombre = 'Efectivo'),
        SYSDATE, 65.00, 'EFECTIVO-001');

COMMIT;

--trigger de facturas

BEGIN EXECUTE IMMEDIATE 'DROP TRIGGER TRG_BUR_FACTURA'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

--tipos de movimiento

INSERT INTO TIPO_MOVIMIENTO (nombre, signo)
SELECT 'Entrada por Nota de Crédito', 1 FROM DUAL
 WHERE NOT EXISTS (SELECT 1 FROM TIPO_MOVIMIENTO WHERE nombre = 'Entrada por Nota de Crédito');
COMMIT;

--procedimiento de inventario

CREATE OR REPLACE PROCEDURE PRC_MOVER_INVENTARIO(
    P_ID_PRODUCTO_SUCURSAL IN NUMBER,
    P_TIPO                 IN VARCHAR2,
    P_CANTIDAD             IN NUMBER,
    P_REFERENCIA           IN VARCHAR2,
    P_ID_MOTIVO_BAJA       IN NUMBER DEFAULT NULL) IS
    V_ID_TIPO  NUMBER;
    V_SIGNO    NUMBER;
    V_ANTERIOR NUMBER;
    V_NUEVA    NUMBER;
BEGIN
    SELECT id_tipo_movimiento, signo
      INTO V_ID_TIPO, V_SIGNO
      FROM TIPO_MOVIMIENTO
     WHERE nombre = P_TIPO;

    SELECT existencia
      INTO V_ANTERIOR
      FROM PRODUCTO_SUCURSAL
     WHERE id_producto_sucursal = P_ID_PRODUCTO_SUCURSAL
       FOR UPDATE;

    V_NUEVA := V_ANTERIOR + (V_SIGNO * P_CANTIDAD);

    IF V_NUEVA < 0 THEN
        RAISE_APPLICATION_ERROR(-20013,
            'Existencia insuficiente: hay ' || V_ANTERIOR || ' y se piden ' || P_CANTIDAD);
    END IF;

    UPDATE PRODUCTO_SUCURSAL
       SET existencia = V_NUEVA
     WHERE id_producto_sucursal = P_ID_PRODUCTO_SUCURSAL;

    INSERT INTO MOVIMIENTO_INVENTARIO (
        id_producto_sucursal, id_tipo_movimiento, id_motivo_baja, fecha,
        cantidad, existencia_anterior, existencia_nueva, referencia)
    VALUES (
        P_ID_PRODUCTO_SUCURSAL, V_ID_TIPO, P_ID_MOTIVO_BAJA, SYSTIMESTAMP,
        P_CANTIDAD, V_ANTERIOR, V_NUEVA, P_REFERENCIA);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20014, 'No existe el tipo de movimiento o el producto-sucursal indicado');
END;
/

--trigger de ventas

CREATE OR REPLACE TRIGGER TRG_BIR_DETALLE_FACTURA
BEFORE INSERT ON DETALLE_FACTURA
FOR EACH ROW
DECLARE
    V_REF VARCHAR2(60);
BEGIN
    BEGIN
        SELECT 'FACTURA ' || serie || '-' || numero INTO V_REF
          FROM FACTURA WHERE id_factura = :NEW.id_factura;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN V_REF := 'FACTURA ' || :NEW.id_factura;
    END;
    PRC_MOVER_INVENTARIO(:NEW.id_producto_sucursal, 'Salida por Venta', :NEW.cantidad, V_REF);
END;
/

--trigger de compras

CREATE OR REPLACE TRIGGER TRG_AIR_DETALLE_COMPRA
AFTER INSERT ON DETALLE_COMPRA
FOR EACH ROW
DECLARE
    V_REF VARCHAR2(60);
BEGIN
    BEGIN
        SELECT 'COMPRA ' || numero_documento INTO V_REF
          FROM COMPRA WHERE id_compra = :NEW.id_compra;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN V_REF := 'COMPRA ' || :NEW.id_compra;
    END;
    PRC_MOVER_INVENTARIO(:NEW.id_producto_sucursal, 'Entrada por Compra', :NEW.cantidad, V_REF);
END;
/

--trigger de notas de credito

CREATE OR REPLACE TRIGGER TRG_AIR_DETALLE_NOTA_CREDITO
AFTER INSERT ON DETALLE_NOTA_CREDITO
FOR EACH ROW
DECLARE
    V_ID_PS    NUMBER;
    V_VENDIDA  NUMBER;
    V_REF      VARCHAR2(60);
BEGIN
    SELECT id_producto_sucursal, cantidad
      INTO V_ID_PS, V_VENDIDA
      FROM DETALLE_FACTURA
     WHERE id_detalle_factura = :NEW.id_detalle_factura;

    IF :NEW.cantidad > V_VENDIDA THEN
        RAISE_APPLICATION_ERROR(-20016,
            'La nota de crédito devuelve ' || :NEW.cantidad || ' y la factura solo vendió ' || V_VENDIDA);
    END IF;

    BEGIN
        SELECT 'NOTA CREDITO ' || numero INTO V_REF
          FROM NOTA_CREDITO WHERE id_nota_credito = :NEW.id_nota_credito;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN V_REF := 'NOTA CREDITO ' || :NEW.id_nota_credito;
    END;

    PRC_MOVER_INVENTARIO(V_ID_PS, 'Entrada por Nota de Crédito', :NEW.cantidad, V_REF);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20017, 'El detalle de factura de la nota de crédito no existe');
END;
/

--facturas no anulables

CREATE OR REPLACE TRIGGER TRG_BU_FACTURA_NO_ANULAR
BEFORE UPDATE OF estado ON FACTURA
FOR EACH ROW
WHEN (NEW.estado = 'ANULADA')
BEGIN
    RAISE_APPLICATION_ERROR(-20020, 'Las facturas no se pueden anular: emita una nota de crédito');
END;
/

--secuencias de facturacion

BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_NUMERO_FACTURA START WITH 2001 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_NUMERO_NC START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

--constraints

DECLARE
    TYPE T_LISTA IS TABLE OF VARCHAR2(400);
    V_LISTA T_LISTA := T_LISTA(
        'ALTER TABLE CLIENTE ADD CONSTRAINT CK_CLIENTE_TIPO CHECK (tipo_cliente IN (''I'',''E''))',
        'ALTER TABLE FACTURA ADD CONSTRAINT CK_FACTURA_COND CHECK (condicion_pago IN (''CONTADO'',''CREDITO''))',
        'ALTER TABLE FACTURA ADD CONSTRAINT CK_FACTURA_ESTADO CHECK (estado IN (''PENDIENTE'',''PARCIAL'',''PAGADA''))',
        'ALTER TABLE FACTURA ADD CONSTRAINT CK_FACTURA_MONTOS CHECK (total >= 0 AND saldo >= 0)',
        'ALTER TABLE COMPRA ADD CONSTRAINT CK_COMPRA_COND CHECK (condicion_pago IN (''CONTADO'',''CREDITO''))',
        'ALTER TABLE COMPRA ADD CONSTRAINT CK_COMPRA_ESTADO CHECK (estado IN (''PENDIENTE'',''PARCIAL'',''PAGADA''))',
        'ALTER TABLE COMPRA ADD CONSTRAINT CK_COMPRA_MONTOS CHECK (total >= 0 AND saldo >= 0)',
        'ALTER TABLE ENVIO ADD CONSTRAINT CK_ENVIO_ESTADO CHECK (estado IN (''PENDIENTE'',''EN_RUTA'',''ENTREGADO''))',
        'ALTER TABLE ENVIO ADD CONSTRAINT CK_ENVIO_CLIENTE CHECK (transporta_cliente IN (''S'',''N''))',
        'ALTER TABLE USUARIO ADD CONSTRAINT CK_USUARIO_BLOQ CHECK (bloqueado IN (''S'',''N''))',
        'ALTER TABLE METODO_PAGO ADD CONSTRAINT CK_METODO_REF CHECK (requiere_referencia IN (''S'',''N''))',
        'ALTER TABLE DEVOLUCION ADD CONSTRAINT CK_DEVOL_REINGRESA CHECK (reingresa_inventario IN (''S'',''N''))',
        'ALTER TABLE PRODUCTO ADD CONSTRAINT CK_PRODUCTO_PRECIOS CHECK (precio_costo >= 0 AND precio_venta >= 0)',
        'ALTER TABLE PRODUCTO_SUCURSAL ADD CONSTRAINT CK_PS_MINIMA CHECK (existencia_minima >= 0)',
        'ALTER TABLE DETALLE_FACTURA ADD CONSTRAINT CK_DETFAC_VALORES CHECK (cantidad > 0 AND precio_unitario >= 0 AND descuento >= 0)',
        'ALTER TABLE DETALLE_COMPRA ADD CONSTRAINT CK_DETCOM_VALORES CHECK (cantidad > 0 AND costo_unitario >= 0)',
        'ALTER TABLE DETALLE_NOTA_CREDITO ADD CONSTRAINT CK_DETNC_CANTIDAD CHECK (cantidad > 0)',
        'ALTER TABLE NOTA_CREDITO ADD CONSTRAINT CK_NC_TOTAL CHECK (total >= 0)',
        'ALTER TABLE PAGO_CLIENTE ADD CONSTRAINT CK_PAGOCLI_MONTO CHECK (monto > 0)',
        'ALTER TABLE PAGO_PROVEEDOR ADD CONSTRAINT CK_PAGOPRO_MONTO CHECK (monto > 0)',
        'ALTER TABLE EMPLEADO ADD CONSTRAINT CK_EMPLEADO_FECHAS CHECK (fecha_baja IS NULL OR fecha_baja >= fecha_contratacion)',
        'ALTER TABLE PERSONA ADD CONSTRAINT CK_PERSONA_CORREO CHECK (correo IS NULL OR INSTR(correo, ''@'') > 1)'
    );
BEGIN
    FOR I IN 1 .. V_LISTA.COUNT LOOP
        BEGIN
            EXECUTE IMMEDIATE V_LISTA(I);
        EXCEPTION
            WHEN OTHERS THEN
                IF SQLCODE NOT IN (-2264, -955) THEN
                    DBMS_OUTPUT.PUT_LINE('AVISO: ' || SQLERRM || ' -> ' || V_LISTA(I));
                END IF;
        END;
    END LOOP;
END;
/

BEGIN
    FOR T IN (SELECT table_name FROM user_tab_columns
               WHERE column_name = 'ESTADO_REGISTRO'
                 AND table_name IN (SELECT table_name FROM user_tables)) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || T.table_name ||
                              ' ADD CONSTRAINT CK_' || SUBSTR(T.table_name, 1, 22) ||
                              '_ER CHECK (estado_registro IN (''A'',''I''))';
        EXCEPTION
            WHEN OTHERS THEN
                IF SQLCODE NOT IN (-2264, -955) THEN
                    DBMS_OUTPUT.PUT_LINE('AVISO ' || T.table_name || ': ' || SQLERRM);
                END IF;
        END;
    END LOOP;
END;
/

--auditoria

BEGIN
    FOR T IN (SELECT table_name FROM user_tab_columns
               WHERE column_name = 'FECHA_MODIFICACION'
                 AND table_name IN (SELECT table_name FROM user_tables)) LOOP
        EXECUTE IMMEDIATE
            'CREATE OR REPLACE TRIGGER TRG_BU_' || T.table_name ||
            ' BEFORE UPDATE ON ' || T.table_name || ' FOR EACH ROW ' ||
            'BEGIN ' ||
            ':NEW.fecha_modificacion := SYSTIMESTAMP; ' ||
            ':NEW.usuario_modificacion := COALESCE(SYS_CONTEXT(''USERENV'',''CLIENT_IDENTIFIER''), ' ||
            ':NEW.usuario_modificacion, SYS_CONTEXT(''USERENV'',''SESSION_USER'')); ' ||
            'END;';
    END LOOP;
END;
/

--bitacora

CREATE OR REPLACE PROCEDURE PRC_BITACORA(
    P_TABLA           IN VARCHAR2,
    P_CAMPO           IN VARCHAR2,
    P_TIPO_MOVIMIENTO IN VARCHAR2,
    P_VALOR_ANTERIOR  IN VARCHAR2,
    P_VALOR_NUEVO     IN VARCHAR2,
    P_LLAVE           IN VARCHAR2) IS
PRAGMA AUTONOMOUS_TRANSACTION;
    V_ID_USUARIO NUMBER;
    V_APP_USER   VARCHAR2(100) := SYS_CONTEXT('USERENV','CLIENT_IDENTIFIER');
BEGIN
    IF V_APP_USER IS NOT NULL THEN
        BEGIN
            SELECT id_usuario INTO V_ID_USUARIO
              FROM USUARIO
             WHERE nombre_usuario = V_APP_USER;
        EXCEPTION
            WHEN OTHERS THEN V_ID_USUARIO := NULL;
        END;
    END IF;

    INSERT INTO BITACORA (
        id_bitacora, id_usuario, fecha_hora, tabla_afectada, descripcion,
        tipo_evento, valor_anterior, valor_nuevo, modulo, ip_origen, id_registro)
    VALUES (
        SEQ_BITACORA.NEXTVAL, V_ID_USUARIO, SYSTIMESTAMP, P_TABLA, P_CAMPO,
        P_TIPO_MOVIMIENTO, P_VALOR_ANTERIOR, P_VALOR_NUEVO,
        SUBSTR(NVL(SYS_CONTEXT('USERENV','MODULE'), 'APP'), 1, 60),
        SYS_CONTEXT('USERENV','IP_ADDRESS'), P_LLAVE);
    COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE PRC_GEN_TRG_BITACORA(P_TABLA IN VARCHAR2, P_PK IN VARCHAR2) IS
    V_NEW VARCHAR2(8000);
    V_OLD VARCHAR2(8000);
    V_SQL VARCHAR2(32000);
BEGIN
    FOR C IN (SELECT column_name
                FROM user_tab_columns
               WHERE table_name = UPPER(P_TABLA)
                 AND column_name <> 'CLAVE'
                 AND data_type NOT IN ('CLOB', 'BLOB')
               ORDER BY column_id) LOOP
        V_NEW := V_NEW || CASE WHEN V_NEW IS NOT NULL THEN ', ' END
                 || '''' || LOWER(C.column_name) || ''' VALUE :NEW.' || C.column_name;
        V_OLD := V_OLD || CASE WHEN V_OLD IS NOT NULL THEN ', ' END
                 || '''' || LOWER(C.column_name) || ''' VALUE :OLD.' || C.column_name;
    END LOOP;

    V_SQL := q'[
        CREATE OR REPLACE TRIGGER TRG_AUD_#T#
        AFTER INSERT OR UPDATE OR DELETE ON #T# FOR EACH ROW
        DECLARE
            V_A VARCHAR2(4000);
            V_N VARCHAR2(4000);
        BEGIN
            IF INSERTING THEN
                V_N := JSON_OBJECT(#NEW#);
                PRC_BITACORA('#T#', 'REGISTRO', 'INSERT', NULL, V_N, TO_CHAR(:NEW.#PK#));
            ELSIF UPDATING THEN
                V_A := JSON_OBJECT(#OLD#);
                V_N := JSON_OBJECT(#NEW#);
                PRC_BITACORA('#T#', 'REGISTRO', 'UPDATE', V_A, V_N, TO_CHAR(:NEW.#PK#));
            ELSE
                V_A := JSON_OBJECT(#OLD#);
                PRC_BITACORA('#T#', 'REGISTRO', 'DELETE', V_A, NULL, TO_CHAR(:OLD.#PK#));
            END IF;
        END;]';

    V_SQL := REPLACE(V_SQL, '#T#', UPPER(P_TABLA));
    V_SQL := REPLACE(V_SQL, '#PK#', P_PK);
    V_SQL := REPLACE(V_SQL, '#NEW#', V_NEW);
    V_SQL := REPLACE(V_SQL, '#OLD#', V_OLD);
    EXECUTE IMMEDIATE V_SQL;
END;
/

BEGIN
    PRC_GEN_TRG_BITACORA('USUARIO',        'id_usuario');
    PRC_GEN_TRG_BITACORA('ROL_OPCION',     'id_rol_opcion');
    PRC_GEN_TRG_BITACORA('PRODUCTO',       'id_producto');
    PRC_GEN_TRG_BITACORA('CLIENTE',        'id_cliente');
    PRC_GEN_TRG_BITACORA('PROVEEDOR',      'id_proveedor');
    PRC_GEN_TRG_BITACORA('EMPLEADO',       'id_empleado');
    PRC_GEN_TRG_BITACORA('FACTURA',        'id_factura');
    PRC_GEN_TRG_BITACORA('NOTA_CREDITO',   'id_nota_credito');
    PRC_GEN_TRG_BITACORA('COMPRA',         'id_compra');
    PRC_GEN_TRG_BITACORA('PAGO_CLIENTE',   'id_pago_cliente');
    PRC_GEN_TRG_BITACORA('PAGO_PROVEEDOR', 'id_pago_proveedor');
    PRC_GEN_TRG_BITACORA('ENVIO',          'id_envio');
    PRC_GEN_TRG_BITACORA('GARANTIA',       'id_garantia');
    PRC_GEN_TRG_BITACORA('DEVOLUCION',     'id_devolucion');
END;
/

--funciones

CREATE OR REPLACE FUNCTION FN_HASH_CLAVE(P_CLAVE IN VARCHAR2) RETURN VARCHAR2 DETERMINISTIC IS
    V_HASH VARCHAR2(64);
BEGIN
    SELECT LOWER(RAWTOHEX(STANDARD_HASH(P_CLAVE, 'SHA256'))) INTO V_HASH FROM DUAL;
    RETURN V_HASH;
END;
/

CREATE OR REPLACE FUNCTION FN_SALDO_FACTURA(P_ID_FACTURA IN NUMBER) RETURN NUMBER IS
    V_TOTAL  NUMBER;
    V_PAGADO NUMBER;
    V_NC     NUMBER;
BEGIN
    SELECT total INTO V_TOTAL FROM FACTURA WHERE id_factura = P_ID_FACTURA;
    SELECT NVL(SUM(monto), 0) INTO V_PAGADO FROM PAGO_CLIENTE WHERE id_factura = P_ID_FACTURA;
    SELECT NVL(SUM(total), 0) INTO V_NC FROM NOTA_CREDITO WHERE id_factura = P_ID_FACTURA;
    RETURN GREATEST(V_TOTAL - V_PAGADO - V_NC, 0);
EXCEPTION
    WHEN NO_DATA_FOUND THEN RETURN NULL;
END;
/

CREATE OR REPLACE FUNCTION FN_EXISTENCIA(P_ID_SUCURSAL IN NUMBER, P_ID_PRODUCTO IN NUMBER) RETURN NUMBER IS
    V_EXIST NUMBER;
BEGIN
    SELECT existencia INTO V_EXIST
      FROM PRODUCTO_SUCURSAL
     WHERE id_sucursal = P_ID_SUCURSAL AND id_producto = P_ID_PRODUCTO;
    RETURN V_EXIST;
EXCEPTION
    WHEN NO_DATA_FOUND THEN RETURN 0;
END;
/

CREATE OR REPLACE FUNCTION FN_TOTAL_VENTAS(
    P_DESDE       IN DATE,
    P_HASTA       IN DATE,
    P_ID_SUCURSAL IN NUMBER DEFAULT NULL) RETURN NUMBER IS
    V_TOTAL NUMBER;
BEGIN
    SELECT NVL(SUM(f.total), 0) INTO V_TOTAL
      FROM FACTURA f
      JOIN EMPLEADO_SUCURSAL es ON es.id_empleado_sucursal = f.id_empleado_sucursal
     WHERE f.fecha >= NVL(P_DESDE, DATE '1900-01-01')
       AND f.fecha <  NVL(P_HASTA, DATE '2999-12-31') + 1
       AND (P_ID_SUCURSAL IS NULL OR es.id_sucursal = P_ID_SUCURSAL);
    RETURN V_TOTAL;
END;
/

CREATE OR REPLACE FUNCTION FN_DIAS_ATRASO(P_ID_FACTURA IN NUMBER) RETURN NUMBER IS
    V_VENC  DATE;
    V_SALDO NUMBER;
BEGIN
    SELECT fecha_vencimiento, saldo INTO V_VENC, V_SALDO
      FROM FACTURA WHERE id_factura = P_ID_FACTURA;
    IF V_VENC IS NULL OR V_SALDO <= 0 THEN
        RETURN 0;
    END IF;
    RETURN GREATEST(TRUNC(SYSDATE) - TRUNC(V_VENC), 0);
EXCEPTION
    WHEN NO_DATA_FOUND THEN RETURN NULL;
END;
/

--triggers de pagos

CREATE OR REPLACE TRIGGER TRG_BIR_PAGO_CLIENTE_REF
BEFORE INSERT ON PAGO_CLIENTE
FOR EACH ROW
DECLARE
    V_REQ CHAR(1);
BEGIN
    SELECT requiere_referencia INTO V_REQ
      FROM METODO_PAGO WHERE id_metodo_pago = :NEW.id_metodo_pago;
    IF V_REQ = 'S' AND :NEW.referencia IS NULL THEN
        RAISE_APPLICATION_ERROR(-20031, 'El metodo de pago requiere numero de referencia');
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN NULL;
END;
/

CREATE OR REPLACE TRIGGER TRG_BIR_PAGO_PROV_REF
BEFORE INSERT ON PAGO_PROVEEDOR
FOR EACH ROW
DECLARE
    V_REQ CHAR(1);
BEGIN
    SELECT requiere_referencia INTO V_REQ
      FROM METODO_PAGO WHERE id_metodo_pago = :NEW.id_metodo_pago;
    IF V_REQ = 'S' AND :NEW.referencia IS NULL THEN
        RAISE_APPLICATION_ERROR(-20031, 'El metodo de pago requiere numero de referencia');
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN NULL;
END;
/

CREATE OR REPLACE TRIGGER TRG_AIR_PAGO_CLIENTE
AFTER INSERT ON PAGO_CLIENTE
FOR EACH ROW
BEGIN
    UPDATE FACTURA
       SET saldo  = GREATEST(saldo - :NEW.monto, 0),
           estado = CASE WHEN saldo - :NEW.monto <= 0 THEN 'PAGADA' ELSE 'PARCIAL' END
     WHERE id_factura = :NEW.id_factura;
END;
/

CREATE OR REPLACE TRIGGER TRG_AIR_PAGO_PROVEEDOR
AFTER INSERT ON PAGO_PROVEEDOR
FOR EACH ROW
BEGIN
    UPDATE COMPRA
       SET saldo  = GREATEST(saldo - :NEW.monto, 0),
           estado = CASE WHEN saldo - :NEW.monto <= 0 THEN 'PAGADA' ELSE 'PARCIAL' END
     WHERE id_compra = :NEW.id_compra;
END;
/

--vistas

CREATE OR REPLACE VIEW V_MENU_USUARIO AS
SELECT u.id_usuario, u.nombre_usuario, r.nombre AS rol,
       m.id_modulo,  m.nombre AS modulo,  m.orden AS orden_modulo,
       me.id_menu,   me.nombre AS menu,   me.orden AS orden_menu,
       o.id_opcion,  o.nombre AS opcion,  o.ruta,  o.orden AS orden_opcion,
       ro.puede_consultar, ro.puede_insertar, ro.puede_actualizar, ro.puede_eliminar
  FROM USUARIO u
  JOIN ROL r         ON r.id_rol = u.id_rol AND r.estado_registro = 'A'
  JOIN ROL_OPCION ro ON ro.id_rol = r.id_rol AND ro.estado_registro = 'A'
  JOIN OPCION o      ON o.id_opcion = ro.id_opcion AND o.estado_registro = 'A'
  JOIN MENU me       ON me.id_menu = o.id_menu AND me.estado_registro = 'A'
  JOIN MODULO m      ON m.id_modulo = me.id_modulo AND m.estado_registro = 'A'
 WHERE u.estado_registro = 'A'
   AND ro.puede_consultar = 'S';

CREATE OR REPLACE VIEW V_VENTAS_BASE AS
SELECT f.id_factura, f.serie, f.numero, f.fecha, f.condicion_pago, f.estado AS estado_factura,
       s.id_sucursal, s.nombre AS sucursal,
       d.nombre AS departamento, pa.nombre AS pais, rg.nombre AS region,
       f.id_cliente, pc.nombres || ' ' || pc.apellidos AS cliente,
       em.id_empleado, pe.nombres || ' ' || pe.apellidos AS vendedor,
       df.id_producto_sucursal, pr.id_producto, pr.codigo, pr.nombre AS producto,
       ca.nombre AS categoria, ma.nombre AS marca,
       df.cantidad, df.precio_unitario, df.descuento, df.subtotal
  FROM FACTURA f
  JOIN DETALLE_FACTURA df     ON df.id_factura = f.id_factura
  JOIN EMPLEADO_SUCURSAL es   ON es.id_empleado_sucursal = f.id_empleado_sucursal
  JOIN SUCURSAL s             ON s.id_sucursal = es.id_sucursal
  JOIN DEPARTAMENTO d         ON d.id_departamento = s.id_departamento
  JOIN PAIS pa                ON pa.id_pais = d.id_pais
  JOIN REGION_GEOGRAFICA rg   ON rg.id_region_geografica = d.id_region_geografica
  JOIN CLIENTE c              ON c.id_cliente = f.id_cliente
  JOIN PERSONA pc             ON pc.id_persona = c.id_persona
  JOIN EMPLEADO em            ON em.id_empleado = es.id_empleado
  JOIN PERSONA pe             ON pe.id_persona = em.id_persona
  JOIN PRODUCTO_SUCURSAL ps   ON ps.id_producto_sucursal = df.id_producto_sucursal
  JOIN PRODUCTO pr            ON pr.id_producto = ps.id_producto
  JOIN CATEGORIA ca           ON ca.id_categoria = pr.id_categoria
  JOIN MARCA ma               ON ma.id_marca = pr.id_marca;

CREATE OR REPLACE VIEW V_VENTAS_POR_SUCURSAL AS
SELECT sucursal, departamento, pais,
       COUNT(DISTINCT id_factura) AS facturas,
       SUM(cantidad)              AS unidades,
       SUM(subtotal)              AS total_vendido
  FROM V_VENTAS_BASE
 GROUP BY sucursal, departamento, pais;

CREATE OR REPLACE VIEW V_VENTAS_MENSUALES AS
SELECT TO_CHAR(f.fecha, 'YYYY-MM') AS mes, s.nombre AS sucursal,
       COUNT(*) AS facturas, SUM(f.total) AS total_vendido
  FROM FACTURA f
  JOIN EMPLEADO_SUCURSAL es ON es.id_empleado_sucursal = f.id_empleado_sucursal
  JOIN SUCURSAL s           ON s.id_sucursal = es.id_sucursal
 GROUP BY TO_CHAR(f.fecha, 'YYYY-MM'), s.nombre;

CREATE OR REPLACE VIEW V_PRODUCTOS_MAS_VENDIDOS AS
SELECT codigo, producto, categoria, marca,
       SUM(cantidad) AS unidades_vendidas,
       SUM(subtotal) AS total_vendido,
       RANK() OVER (ORDER BY SUM(cantidad) DESC) AS ranking
  FROM V_VENTAS_BASE
 GROUP BY codigo, producto, categoria, marca;

CREATE OR REPLACE VIEW V_PRODUCTOS_MENOS_VENDIDOS AS
SELECT pr.codigo, pr.nombre AS producto, ca.nombre AS categoria, ma.nombre AS marca,
       NVL(SUM(df.cantidad), 0) AS unidades_vendidas,
       RANK() OVER (ORDER BY NVL(SUM(df.cantidad), 0) ASC) AS ranking
  FROM PRODUCTO pr
  JOIN CATEGORIA ca ON ca.id_categoria = pr.id_categoria
  JOIN MARCA ma     ON ma.id_marca = pr.id_marca
  LEFT JOIN PRODUCTO_SUCURSAL ps ON ps.id_producto = pr.id_producto
  LEFT JOIN DETALLE_FACTURA df   ON df.id_producto_sucursal = ps.id_producto_sucursal
 GROUP BY pr.codigo, pr.nombre, ca.nombre, ma.nombre;

CREATE OR REPLACE VIEW V_CLIENTES_POR_REGION AS
SELECT region, pais, id_cliente, cliente,
       COUNT(DISTINCT id_factura) AS facturas,
       SUM(subtotal)              AS total_comprado,
       RANK() OVER (PARTITION BY region, pais ORDER BY SUM(subtotal) DESC) AS ranking_region
  FROM V_VENTAS_BASE
 GROUP BY region, pais, id_cliente, cliente;

CREATE OR REPLACE VIEW V_VENDEDORES_POR_AREA AS
SELECT region, pais, id_empleado, vendedor,
       COUNT(DISTINCT id_factura) AS facturas,
       SUM(subtotal)              AS total_vendido,
       RANK() OVER (PARTITION BY region, pais ORDER BY SUM(subtotal) DESC) AS ranking_area
  FROM V_VENTAS_BASE
 GROUP BY region, pais, id_empleado, vendedor;

CREATE OR REPLACE VIEW V_ENVIOS_POR_SUCURSAL AS
SELECT s.nombre AS sucursal, p.nombres || ' ' || p.apellidos AS responsable,
       COUNT(*) AS envios,
       SUM(CASE WHEN e.estado = 'ENTREGADO' THEN 1 ELSE 0 END) AS entregados
  FROM ENVIO e
  JOIN SUCURSAL s ON s.id_sucursal = e.id_sucursal
  JOIN EMPLEADO em ON em.id_empleado = e.id_empleado
  JOIN PERSONA p   ON p.id_persona = em.id_persona
 GROUP BY s.nombre, p.nombres, p.apellidos;

CREATE OR REPLACE VIEW V_CUENTAS_POR_COBRAR AS
SELECT f.id_factura, f.serie || '-' || f.numero AS documento, f.fecha, f.fecha_vencimiento,
       c.id_cliente, p.nombres || ' ' || p.apellidos AS cliente,
       f.total, f.saldo, f.condicion_pago, f.estado,
       FN_DIAS_ATRASO(f.id_factura) AS dias_atraso
  FROM FACTURA f
  JOIN CLIENTE c ON c.id_cliente = f.id_cliente
  JOIN PERSONA p ON p.id_persona = c.id_persona
 WHERE f.saldo > 0;

CREATE OR REPLACE VIEW V_CUENTAS_POR_PAGAR AS
SELECT co.id_compra, co.numero_documento, co.fecha, co.fecha_vencimiento,
       pr.id_proveedor, pr.nombre AS proveedor,
       co.total, co.saldo, co.condicion_pago, co.estado,
       CASE WHEN co.fecha_vencimiento IS NOT NULL AND co.fecha_vencimiento < TRUNC(SYSDATE)
            THEN TRUNC(SYSDATE) - TRUNC(co.fecha_vencimiento) ELSE 0 END AS dias_atraso
  FROM COMPRA co
  JOIN PROVEEDOR pr ON pr.id_proveedor = co.id_proveedor
 WHERE co.saldo > 0;

CREATE OR REPLACE VIEW V_EXISTENCIA_SUCURSAL AS
SELECT s.id_sucursal, s.nombre AS sucursal, p.id_producto, p.codigo, p.nombre AS producto,
       ca.nombre AS categoria, ma.nombre AS marca,
       ps.existencia, ps.existencia_minima, ps.ubicacion_bodega,
       CASE WHEN ps.existencia <= ps.existencia_minima THEN 'REABASTECER' ELSE 'OK' END AS alerta
  FROM PRODUCTO_SUCURSAL ps
  JOIN SUCURSAL s   ON s.id_sucursal = ps.id_sucursal
  JOIN PRODUCTO p   ON p.id_producto = ps.id_producto
  JOIN CATEGORIA ca ON ca.id_categoria = p.id_categoria
  JOIN MARCA ma     ON ma.id_marca = p.id_marca;

CREATE OR REPLACE VIEW V_KARDEX AS
SELECT m.id_movimiento_inventario, m.fecha, s.nombre AS sucursal,
       p.codigo, p.nombre AS producto, t.nombre AS tipo_movimiento, t.signo,
       m.cantidad, m.existencia_anterior, m.existencia_nueva,
       mb.nombre AS motivo_baja, m.referencia
  FROM MOVIMIENTO_INVENTARIO m
  JOIN TIPO_MOVIMIENTO t        ON t.id_tipo_movimiento = m.id_tipo_movimiento
  JOIN PRODUCTO_SUCURSAL ps     ON ps.id_producto_sucursal = m.id_producto_sucursal
  JOIN SUCURSAL s               ON s.id_sucursal = ps.id_sucursal
  JOIN PRODUCTO p               ON p.id_producto = ps.id_producto
  LEFT JOIN MOTIVO_BAJA mb      ON mb.id_motivo_baja = m.id_motivo_baja;

--paquete de seguridad

CREATE OR REPLACE PACKAGE PKG_SEGURIDAD AS
    C_MAX_INTENTOS CONSTANT NUMBER := 3;

    FUNCTION  LOGIN(P_USUARIO IN VARCHAR2, P_CLAVE IN VARCHAR2) RETURN NUMBER;
    FUNCTION  TIENE_PERMISO(P_ID_USUARIO IN NUMBER, P_RUTA IN VARCHAR2, P_ACCION IN VARCHAR2) RETURN NUMBER;
    PROCEDURE MENU_USUARIO(P_ID_USUARIO IN NUMBER, P_CURSOR OUT SYS_REFCURSOR);
    FUNCTION  CREAR_USUARIO(P_USUARIO IN VARCHAR2, P_CLAVE IN VARCHAR2, P_ID_ROL IN NUMBER,
                            P_ID_EMPLEADO IN NUMBER DEFAULT NULL) RETURN NUMBER;
    PROCEDURE CAMBIAR_CLAVE(P_ID_USUARIO IN NUMBER, P_CLAVE_ACTUAL IN VARCHAR2, P_CLAVE_NUEVA IN VARCHAR2);
    PROCEDURE DESBLOQUEAR(P_ID_USUARIO IN NUMBER);
END PKG_SEGURIDAD;
/

CREATE OR REPLACE PACKAGE BODY PKG_SEGURIDAD AS

    PROCEDURE PRC_RESULTADO_LOGIN(P_ID IN NUMBER, P_OK IN BOOLEAN) IS
        PRAGMA AUTONOMOUS_TRANSACTION;
    BEGIN
        IF P_OK THEN
            UPDATE USUARIO
               SET intentos_fallidos = 0,
                   ultimo_acceso     = SYSTIMESTAMP
             WHERE id_usuario = P_ID;
        ELSE
            UPDATE USUARIO
               SET intentos_fallidos = intentos_fallidos + 1,
                   bloqueado = CASE WHEN intentos_fallidos + 1 >= C_MAX_INTENTOS THEN 'S' ELSE bloqueado END
             WHERE id_usuario = P_ID;
        END IF;
        COMMIT;
    END;

    FUNCTION LOGIN(P_USUARIO IN VARCHAR2, P_CLAVE IN VARCHAR2) RETURN NUMBER IS
        V_ID    USUARIO.id_usuario%TYPE;
        V_CLAVE USUARIO.clave%TYPE;
        V_BLOQ  USUARIO.bloqueado%TYPE;
    BEGIN
        SELECT id_usuario, clave, bloqueado
          INTO V_ID, V_CLAVE, V_BLOQ
          FROM USUARIO
         WHERE nombre_usuario = P_USUARIO
           AND estado_registro = 'A';

        IF V_BLOQ = 'S' THEN
            PRC_BITACORA('USUARIO', 'ACCESO', 'LOGIN_BLOQUEADO', NULL, NULL, TO_CHAR(V_ID));
            RETURN -1;
        END IF;

        IF V_CLAVE = FN_HASH_CLAVE(P_CLAVE) THEN
            PRC_RESULTADO_LOGIN(V_ID, TRUE);
            PRC_BITACORA('USUARIO', 'ACCESO', 'LOGIN_OK', NULL, NULL, TO_CHAR(V_ID));
            RETURN V_ID;
        ELSE
            PRC_RESULTADO_LOGIN(V_ID, FALSE);
            PRC_BITACORA('USUARIO', 'ACCESO', 'LOGIN_FALLIDO', NULL, NULL, TO_CHAR(V_ID));
            RETURN 0;
        END IF;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 0;
    END;

    FUNCTION TIENE_PERMISO(P_ID_USUARIO IN NUMBER, P_RUTA IN VARCHAR2, P_ACCION IN VARCHAR2) RETURN NUMBER IS
        V_CONT NUMBER;
    BEGIN
        SELECT COUNT(*) INTO V_CONT
          FROM V_MENU_USUARIO
         WHERE id_usuario = P_ID_USUARIO
           AND ruta = P_RUTA
           AND (   (UPPER(P_ACCION) = 'C' AND puede_consultar  = 'S')
                OR (UPPER(P_ACCION) = 'I' AND puede_insertar   = 'S')
                OR (UPPER(P_ACCION) = 'U' AND puede_actualizar = 'S')
                OR (UPPER(P_ACCION) = 'D' AND puede_eliminar   = 'S'));
        RETURN CASE WHEN V_CONT > 0 THEN 1 ELSE 0 END;
    END;

    PROCEDURE MENU_USUARIO(P_ID_USUARIO IN NUMBER, P_CURSOR OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN P_CURSOR FOR
            SELECT modulo, menu, opcion, ruta,
                   puede_consultar, puede_insertar, puede_actualizar, puede_eliminar
              FROM V_MENU_USUARIO
             WHERE id_usuario = P_ID_USUARIO
             ORDER BY orden_modulo, orden_menu, orden_opcion;
    END;

    FUNCTION CREAR_USUARIO(P_USUARIO IN VARCHAR2, P_CLAVE IN VARCHAR2, P_ID_ROL IN NUMBER,
                           P_ID_EMPLEADO IN NUMBER DEFAULT NULL) RETURN NUMBER IS
        V_ID USUARIO.id_usuario%TYPE;
    BEGIN
        IF P_CLAVE IS NULL OR LENGTH(P_CLAVE) < 6 THEN
            RAISE_APPLICATION_ERROR(-20050, 'La clave debe tener al menos 6 caracteres');
        END IF;
        V_ID := SEQ_USUARIO.NEXTVAL;
        INSERT INTO USUARIO (id_usuario, id_rol, id_empleado, nombre_usuario, clave)
        VALUES (V_ID, P_ID_ROL, P_ID_EMPLEADO, P_USUARIO, FN_HASH_CLAVE(P_CLAVE));
        RETURN V_ID;
    END;

    PROCEDURE CAMBIAR_CLAVE(P_ID_USUARIO IN NUMBER, P_CLAVE_ACTUAL IN VARCHAR2, P_CLAVE_NUEVA IN VARCHAR2) IS
        V_CLAVE USUARIO.clave%TYPE;
    BEGIN
        IF P_CLAVE_NUEVA IS NULL OR LENGTH(P_CLAVE_NUEVA) < 6 THEN
            RAISE_APPLICATION_ERROR(-20050, 'La clave debe tener al menos 6 caracteres');
        END IF;
        SELECT clave INTO V_CLAVE FROM USUARIO WHERE id_usuario = P_ID_USUARIO;
        IF V_CLAVE <> FN_HASH_CLAVE(P_CLAVE_ACTUAL) THEN
            RAISE_APPLICATION_ERROR(-20051, 'La clave actual no es correcta');
        END IF;
        UPDATE USUARIO SET clave = FN_HASH_CLAVE(P_CLAVE_NUEVA) WHERE id_usuario = P_ID_USUARIO;
        PRC_BITACORA('USUARIO', 'CLAVE', 'CAMBIO_CLAVE', NULL, NULL, TO_CHAR(P_ID_USUARIO));
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20052, 'El usuario no existe');
    END;

    PROCEDURE DESBLOQUEAR(P_ID_USUARIO IN NUMBER) IS
    BEGIN
        UPDATE USUARIO SET bloqueado = 'N', intentos_fallidos = 0 WHERE id_usuario = P_ID_USUARIO;
        PRC_BITACORA('USUARIO', 'ACCESO', 'DESBLOQUEO', NULL, NULL, TO_CHAR(P_ID_USUARIO));
    END;

END PKG_SEGURIDAD;
/

--paquete de ventas

CREATE OR REPLACE PACKAGE PKG_VENTAS AS
    C_IVA CONSTANT NUMBER := 0.12;

    FUNCTION  NUEVA_FACTURA(P_ID_CLIENTE IN NUMBER, P_ID_EMPLEADO_SUCURSAL IN NUMBER,
                            P_CONDICION_PAGO IN VARCHAR2, P_SERIE IN VARCHAR2 DEFAULT 'A001') RETURN NUMBER;
    PROCEDURE AGREGAR_DETALLE(P_ID_FACTURA IN NUMBER, P_ID_PRODUCTO_SUCURSAL IN NUMBER,
                              P_CANTIDAD IN NUMBER, P_DESCUENTO IN NUMBER DEFAULT 0);
    PROCEDURE REGISTRAR_PAGO(P_ID_FACTURA IN NUMBER, P_ID_EMPLEADO_SUCURSAL IN NUMBER,
                             P_ID_METODO_PAGO IN NUMBER, P_MONTO IN NUMBER, P_REFERENCIA IN VARCHAR2 DEFAULT NULL);
    FUNCTION  NUEVA_NOTA_CREDITO(P_ID_FACTURA IN NUMBER, P_ID_EMPLEADO IN NUMBER, P_MOTIVO IN VARCHAR2) RETURN NUMBER;
    PROCEDURE AGREGAR_DETALLE_NC(P_ID_NOTA_CREDITO IN NUMBER, P_ID_DETALLE_FACTURA IN NUMBER, P_CANTIDAD IN NUMBER);
END PKG_VENTAS;
/

CREATE OR REPLACE PACKAGE BODY PKG_VENTAS AS

    FUNCTION F_SUCURSAL_FACTURA(P_ID_FACTURA IN NUMBER) RETURN NUMBER IS
        V_SUC NUMBER;
    BEGIN
        SELECT es.id_sucursal INTO V_SUC
          FROM FACTURA f
          JOIN EMPLEADO_SUCURSAL es ON es.id_empleado_sucursal = f.id_empleado_sucursal
         WHERE f.id_factura = P_ID_FACTURA;
        RETURN V_SUC;
    END;

    FUNCTION NUEVA_FACTURA(P_ID_CLIENTE IN NUMBER, P_ID_EMPLEADO_SUCURSAL IN NUMBER,
                           P_CONDICION_PAGO IN VARCHAR2, P_SERIE IN VARCHAR2 DEFAULT 'A001') RETURN NUMBER IS
        V_ID   FACTURA.id_factura%TYPE;
        V_DIAS CLIENTE.dias_credito%TYPE;
        V_VENC DATE := NULL;
    BEGIN
        IF UPPER(P_CONDICION_PAGO) NOT IN ('CONTADO', 'CREDITO') THEN
            RAISE_APPLICATION_ERROR(-20030, 'Condicion de pago invalida (use CONTADO o CREDITO)');
        END IF;

        IF UPPER(P_CONDICION_PAGO) = 'CREDITO' THEN
            SELECT dias_credito INTO V_DIAS FROM CLIENTE WHERE id_cliente = P_ID_CLIENTE;
            IF V_DIAS = 0 THEN
                RAISE_APPLICATION_ERROR(-20032, 'El cliente no tiene credito autorizado');
            END IF;
            V_VENC := TRUNC(SYSDATE) + V_DIAS;
        END IF;

        V_ID := SEQ_FACTURA.NEXTVAL;
        INSERT INTO FACTURA (id_factura, id_cliente, id_empleado_sucursal, serie, numero, fecha,
                             condicion_pago, fecha_vencimiento, subtotal, impuesto, total, saldo, estado)
        VALUES (V_ID, P_ID_CLIENTE, P_ID_EMPLEADO_SUCURSAL, P_SERIE, SEQ_NUMERO_FACTURA.NEXTVAL, SYSDATE,
                UPPER(P_CONDICION_PAGO), V_VENC, 0, 0, 0, 0, 'PENDIENTE');
        RETURN V_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20033, 'El cliente no existe');
    END;

    PROCEDURE AGREGAR_DETALLE(P_ID_FACTURA IN NUMBER, P_ID_PRODUCTO_SUCURSAL IN NUMBER,
                              P_CANTIDAD IN NUMBER, P_DESCUENTO IN NUMBER DEFAULT 0) IS
        V_ESTADO  FACTURA.estado%TYPE;
        V_COND    FACTURA.condicion_pago%TYPE;
        V_CLIENTE FACTURA.id_cliente%TYPE;
        V_PRECIO  PRODUCTO.precio_venta%TYPE;
        V_SUC_PS  PRODUCTO_SUCURSAL.id_sucursal%TYPE;
        V_BRUTO   NUMBER;
        V_SUB     NUMBER;
        V_LIMITE  CLIENTE.limite_credito%TYPE;
        V_DEUDA   NUMBER;
    BEGIN
        IF P_CANTIDAD IS NULL OR P_CANTIDAD <= 0 THEN
            RAISE_APPLICATION_ERROR(-20035, 'La cantidad debe ser mayor a cero');
        END IF;

        SELECT estado, condicion_pago, id_cliente
          INTO V_ESTADO, V_COND, V_CLIENTE
          FROM FACTURA
         WHERE id_factura = P_ID_FACTURA
           FOR UPDATE;

        IF V_ESTADO <> 'PENDIENTE' THEN
            RAISE_APPLICATION_ERROR(-20036, 'La factura ya tiene pagos: no se pueden agregar lineas');
        END IF;

        SELECT ps.id_sucursal, p.precio_venta
          INTO V_SUC_PS, V_PRECIO
          FROM PRODUCTO_SUCURSAL ps
          JOIN PRODUCTO p ON p.id_producto = ps.id_producto
         WHERE ps.id_producto_sucursal = P_ID_PRODUCTO_SUCURSAL;

        IF V_SUC_PS <> F_SUCURSAL_FACTURA(P_ID_FACTURA) THEN
            RAISE_APPLICATION_ERROR(-20037, 'El producto no pertenece a la sucursal de la factura');
        END IF;

        V_BRUTO := ROUND(P_CANTIDAD * V_PRECIO, 2);
        IF NVL(P_DESCUENTO, 0) < 0 OR NVL(P_DESCUENTO, 0) > V_BRUTO THEN
            RAISE_APPLICATION_ERROR(-20038, 'Descuento invalido');
        END IF;
        V_SUB := V_BRUTO - NVL(P_DESCUENTO, 0);

        IF V_COND = 'CREDITO' THEN
            SELECT limite_credito INTO V_LIMITE FROM CLIENTE WHERE id_cliente = V_CLIENTE;
            SELECT NVL(SUM(saldo), 0) INTO V_DEUDA FROM FACTURA WHERE id_cliente = V_CLIENTE;
            IF V_DEUDA + V_SUB > V_LIMITE THEN
                RAISE_APPLICATION_ERROR(-20034, 'Excede el limite de credito del cliente');
            END IF;
        END IF;

        INSERT INTO DETALLE_FACTURA (id_factura, id_producto_sucursal, cantidad, precio_unitario, descuento, subtotal)
        VALUES (P_ID_FACTURA, P_ID_PRODUCTO_SUCURSAL, P_CANTIDAD, V_PRECIO, NVL(P_DESCUENTO, 0), V_SUB);

        UPDATE FACTURA
           SET total    = total + V_SUB,
               subtotal = ROUND((total + V_SUB) / (1 + C_IVA), 2),
               impuesto = (total + V_SUB) - ROUND((total + V_SUB) / (1 + C_IVA), 2),
               saldo    = saldo + V_SUB
         WHERE id_factura = P_ID_FACTURA;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20040, 'Factura, producto o cliente no encontrado');
    END;

    PROCEDURE REGISTRAR_PAGO(P_ID_FACTURA IN NUMBER, P_ID_EMPLEADO_SUCURSAL IN NUMBER,
                             P_ID_METODO_PAGO IN NUMBER, P_MONTO IN NUMBER, P_REFERENCIA IN VARCHAR2 DEFAULT NULL) IS
        V_SALDO   FACTURA.saldo%TYPE;
        V_CLIENTE FACTURA.id_cliente%TYPE;
    BEGIN
        IF P_MONTO IS NULL OR P_MONTO <= 0 THEN
            RAISE_APPLICATION_ERROR(-20041, 'El monto debe ser mayor a cero');
        END IF;

        SELECT saldo, id_cliente INTO V_SALDO, V_CLIENTE
          FROM FACTURA WHERE id_factura = P_ID_FACTURA FOR UPDATE;

        IF P_MONTO > V_SALDO THEN
            RAISE_APPLICATION_ERROR(-20042, 'El pago (' || P_MONTO || ') excede el saldo (' || V_SALDO || ')');
        END IF;

        INSERT INTO PAGO_CLIENTE (id_cliente, id_empleado_sucursal, id_factura, id_metodo_pago, fecha, monto, referencia)
        VALUES (V_CLIENTE, P_ID_EMPLEADO_SUCURSAL, P_ID_FACTURA, P_ID_METODO_PAGO, SYSDATE, P_MONTO, P_REFERENCIA);
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20043, 'La factura no existe');
    END;

    FUNCTION NUEVA_NOTA_CREDITO(P_ID_FACTURA IN NUMBER, P_ID_EMPLEADO IN NUMBER, P_MOTIVO IN VARCHAR2) RETURN NUMBER IS
        V_ID NOTA_CREDITO.id_nota_credito%TYPE;
    BEGIN
        V_ID := SEQ_NOTA_CREDITO.NEXTVAL;
        INSERT INTO NOTA_CREDITO (id_nota_credito, id_empleado, id_factura, numero, fecha, motivo, total)
        VALUES (V_ID, P_ID_EMPLEADO, P_ID_FACTURA, 'NC-' || LPAD(SEQ_NUMERO_NC.NEXTVAL, 6, '0'), SYSDATE, P_MOTIVO, 0);
        RETURN V_ID;
    END;

    PROCEDURE AGREGAR_DETALLE_NC(P_ID_NOTA_CREDITO IN NUMBER, P_ID_DETALLE_FACTURA IN NUMBER, P_CANTIDAD IN NUMBER) IS
        V_FAC_NC   NOTA_CREDITO.id_factura%TYPE;
        V_FAC_DET  DETALLE_FACTURA.id_factura%TYPE;
        V_VENDIDA  DETALLE_FACTURA.cantidad%TYPE;
        V_PRECIO   NUMBER;
        V_DEVUELTO NUMBER;
        V_SUB      NUMBER;
    BEGIN
        IF P_CANTIDAD IS NULL OR P_CANTIDAD <= 0 THEN
            RAISE_APPLICATION_ERROR(-20035, 'La cantidad debe ser mayor a cero');
        END IF;

        SELECT id_factura INTO V_FAC_NC
          FROM NOTA_CREDITO WHERE id_nota_credito = P_ID_NOTA_CREDITO FOR UPDATE;

        SELECT id_factura, cantidad, ROUND(subtotal / cantidad, 2)
          INTO V_FAC_DET, V_VENDIDA, V_PRECIO
          FROM DETALLE_FACTURA WHERE id_detalle_factura = P_ID_DETALLE_FACTURA;

        IF V_FAC_NC <> V_FAC_DET THEN
            RAISE_APPLICATION_ERROR(-20044, 'La linea no pertenece a la factura de la nota de credito');
        END IF;

        SELECT NVL(SUM(cantidad), 0) INTO V_DEVUELTO
          FROM DETALLE_NOTA_CREDITO WHERE id_detalle_factura = P_ID_DETALLE_FACTURA;
        IF V_DEVUELTO + P_CANTIDAD > V_VENDIDA THEN
            RAISE_APPLICATION_ERROR(-20045, 'Ya se devolvieron ' || V_DEVUELTO || ' de ' || V_VENDIDA || ' unidades de esa linea');
        END IF;

        V_SUB := ROUND(P_CANTIDAD * V_PRECIO, 2);

        INSERT INTO DETALLE_NOTA_CREDITO (id_detalle_factura, id_nota_credito, cantidad, precio_unitario, subtotal)
        VALUES (P_ID_DETALLE_FACTURA, P_ID_NOTA_CREDITO, P_CANTIDAD, V_PRECIO, V_SUB);

        UPDATE NOTA_CREDITO SET total = total + V_SUB WHERE id_nota_credito = P_ID_NOTA_CREDITO;

        UPDATE FACTURA
           SET saldo  = GREATEST(saldo - V_SUB, 0),
               estado = CASE WHEN saldo - V_SUB <= 0 THEN 'PAGADA' ELSE estado END
         WHERE id_factura = V_FAC_NC;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20046, 'Nota de credito o linea de factura no encontrada');
    END;

END PKG_VENTAS;
/

--paquete de compras

CREATE OR REPLACE PACKAGE PKG_COMPRAS AS
    FUNCTION  NUEVA_COMPRA(P_ID_EMPLEADO_SUCURSAL IN NUMBER, P_ID_PROVEEDOR IN NUMBER,
                           P_NUMERO_DOCUMENTO IN VARCHAR2, P_CONDICION_PAGO IN VARCHAR2) RETURN NUMBER;
    PROCEDURE AGREGAR_DETALLE(P_ID_COMPRA IN NUMBER, P_ID_PRODUCTO_SUCURSAL IN NUMBER,
                              P_CANTIDAD IN NUMBER, P_COSTO_UNITARIO IN NUMBER);
    PROCEDURE REGISTRAR_PAGO(P_ID_COMPRA IN NUMBER, P_ID_EMPLEADO_SUCURSAL IN NUMBER,
                             P_ID_METODO_PAGO IN NUMBER, P_MONTO IN NUMBER, P_REFERENCIA IN VARCHAR2 DEFAULT NULL);
END PKG_COMPRAS;
/

CREATE OR REPLACE PACKAGE BODY PKG_COMPRAS AS

    FUNCTION NUEVA_COMPRA(P_ID_EMPLEADO_SUCURSAL IN NUMBER, P_ID_PROVEEDOR IN NUMBER,
                          P_NUMERO_DOCUMENTO IN VARCHAR2, P_CONDICION_PAGO IN VARCHAR2) RETURN NUMBER IS
        V_ID   COMPRA.id_compra%TYPE;
        V_DIAS PROVEEDOR.dias_credito%TYPE;
        V_VENC DATE := NULL;
    BEGIN
        IF UPPER(P_CONDICION_PAGO) NOT IN ('CONTADO', 'CREDITO') THEN
            RAISE_APPLICATION_ERROR(-20030, 'Condicion de pago invalida (use CONTADO o CREDITO)');
        END IF;

        IF UPPER(P_CONDICION_PAGO) = 'CREDITO' THEN
            SELECT dias_credito INTO V_DIAS FROM PROVEEDOR WHERE id_proveedor = P_ID_PROVEEDOR;
            V_VENC := TRUNC(SYSDATE) + V_DIAS;
        END IF;

        V_ID := SEQ_COMPRA.NEXTVAL;
        INSERT INTO COMPRA (id_compra, id_empleado_sucursal, id_proveedor, numero_documento, fecha,
                            condicion_pago, fecha_vencimiento, total, saldo, estado)
        VALUES (V_ID, P_ID_EMPLEADO_SUCURSAL, P_ID_PROVEEDOR, P_NUMERO_DOCUMENTO, SYSDATE,
                UPPER(P_CONDICION_PAGO), V_VENC, 0, 0, 'PENDIENTE');
        RETURN V_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20060, 'El proveedor no existe');
    END;

    PROCEDURE AGREGAR_DETALLE(P_ID_COMPRA IN NUMBER, P_ID_PRODUCTO_SUCURSAL IN NUMBER,
                              P_CANTIDAD IN NUMBER, P_COSTO_UNITARIO IN NUMBER) IS
        V_ESTADO  COMPRA.estado%TYPE;
        V_SUC_C   NUMBER;
        V_SUC_PS  PRODUCTO_SUCURSAL.id_sucursal%TYPE;
        V_SUB     NUMBER;
    BEGIN
        IF P_CANTIDAD IS NULL OR P_CANTIDAD <= 0 OR P_COSTO_UNITARIO IS NULL OR P_COSTO_UNITARIO < 0 THEN
            RAISE_APPLICATION_ERROR(-20061, 'Cantidad o costo invalido');
        END IF;

        SELECT co.estado, es.id_sucursal
          INTO V_ESTADO, V_SUC_C
          FROM COMPRA co
          JOIN EMPLEADO_SUCURSAL es ON es.id_empleado_sucursal = co.id_empleado_sucursal
         WHERE co.id_compra = P_ID_COMPRA;

        IF V_ESTADO <> 'PENDIENTE' THEN
            RAISE_APPLICATION_ERROR(-20062, 'La compra ya tiene pagos: no se pueden agregar lineas');
        END IF;

        SELECT id_sucursal INTO V_SUC_PS
          FROM PRODUCTO_SUCURSAL WHERE id_producto_sucursal = P_ID_PRODUCTO_SUCURSAL;
        IF V_SUC_PS <> V_SUC_C THEN
            RAISE_APPLICATION_ERROR(-20063, 'El producto no pertenece a la sucursal de la compra');
        END IF;

        V_SUB := ROUND(P_CANTIDAD * P_COSTO_UNITARIO, 2);

        INSERT INTO DETALLE_COMPRA (id_compra, id_producto_sucursal, cantidad, costo_unitario, subtotal)
        VALUES (P_ID_COMPRA, P_ID_PRODUCTO_SUCURSAL, P_CANTIDAD, P_COSTO_UNITARIO, V_SUB);

        UPDATE COMPRA SET total = total + V_SUB, saldo = saldo + V_SUB WHERE id_compra = P_ID_COMPRA;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20064, 'Compra o producto no encontrado');
    END;

    PROCEDURE REGISTRAR_PAGO(P_ID_COMPRA IN NUMBER, P_ID_EMPLEADO_SUCURSAL IN NUMBER,
                             P_ID_METODO_PAGO IN NUMBER, P_MONTO IN NUMBER, P_REFERENCIA IN VARCHAR2 DEFAULT NULL) IS
        V_SALDO COMPRA.saldo%TYPE;
    BEGIN
        IF P_MONTO IS NULL OR P_MONTO <= 0 THEN
            RAISE_APPLICATION_ERROR(-20041, 'El monto debe ser mayor a cero');
        END IF;

        SELECT saldo INTO V_SALDO FROM COMPRA WHERE id_compra = P_ID_COMPRA FOR UPDATE;
        IF P_MONTO > V_SALDO THEN
            RAISE_APPLICATION_ERROR(-20042, 'El pago (' || P_MONTO || ') excede el saldo (' || V_SALDO || ')');
        END IF;

        INSERT INTO PAGO_PROVEEDOR (id_empleado_sucursal, id_compra, id_metodo_pago, fecha, monto, referencia)
        VALUES (P_ID_EMPLEADO_SUCURSAL, P_ID_COMPRA, P_ID_METODO_PAGO, SYSDATE, P_MONTO, P_REFERENCIA);
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20065, 'La compra no existe');
    END;

END PKG_COMPRAS;
/

--paquete de inventario

CREATE OR REPLACE PACKAGE PKG_INVENTARIO AS
    PROCEDURE REGISTRAR_BAJA(P_ID_PRODUCTO_SUCURSAL IN NUMBER, P_CANTIDAD IN NUMBER,
                             P_ID_MOTIVO_BAJA IN NUMBER, P_REFERENCIA IN VARCHAR2 DEFAULT NULL);
    PROCEDURE AJUSTE_POSITIVO(P_ID_PRODUCTO_SUCURSAL IN NUMBER, P_CANTIDAD IN NUMBER,
                              P_REFERENCIA IN VARCHAR2 DEFAULT NULL);
END PKG_INVENTARIO;
/

CREATE OR REPLACE PACKAGE BODY PKG_INVENTARIO AS

    PROCEDURE REGISTRAR_BAJA(P_ID_PRODUCTO_SUCURSAL IN NUMBER, P_CANTIDAD IN NUMBER,
                             P_ID_MOTIVO_BAJA IN NUMBER, P_REFERENCIA IN VARCHAR2 DEFAULT NULL) IS
        V_CONT NUMBER;
    BEGIN
        IF P_CANTIDAD IS NULL OR P_CANTIDAD <= 0 THEN
            RAISE_APPLICATION_ERROR(-20070, 'La cantidad debe ser mayor a cero');
        END IF;
        SELECT COUNT(*) INTO V_CONT FROM MOTIVO_BAJA WHERE id_motivo_baja = P_ID_MOTIVO_BAJA;
        IF V_CONT = 0 THEN
            RAISE_APPLICATION_ERROR(-20071, 'El motivo de baja no existe');
        END IF;
        PRC_MOVER_INVENTARIO(P_ID_PRODUCTO_SUCURSAL, 'Baja de Inventario', P_CANTIDAD,
                             NVL(P_REFERENCIA, 'BAJA MANUAL'), P_ID_MOTIVO_BAJA);
    END;

    PROCEDURE AJUSTE_POSITIVO(P_ID_PRODUCTO_SUCURSAL IN NUMBER, P_CANTIDAD IN NUMBER,
                              P_REFERENCIA IN VARCHAR2 DEFAULT NULL) IS
    BEGIN
        IF P_CANTIDAD IS NULL OR P_CANTIDAD <= 0 THEN
            RAISE_APPLICATION_ERROR(-20070, 'La cantidad debe ser mayor a cero');
        END IF;
        PRC_MOVER_INVENTARIO(P_ID_PRODUCTO_SUCURSAL, 'Ajuste Positivo', P_CANTIDAD,
                             NVL(P_REFERENCIA, 'AJUSTE MANUAL'));
    END;

END PKG_INVENTARIO;
/

--paquete de reportes

CREATE OR REPLACE PACKAGE PKG_REPORTES AS
    PROCEDURE VENTAS_POR_SUCURSAL(P_DESDE IN DATE, P_HASTA IN DATE, P_CURSOR OUT SYS_REFCURSOR);
    PROCEDURE PRODUCTOS_MAS_VENDIDOS(P_DESDE IN DATE, P_HASTA IN DATE, P_TOP IN NUMBER, P_CURSOR OUT SYS_REFCURSOR);
    PROCEDURE CLIENTES_POR_REGION(P_DESDE IN DATE, P_HASTA IN DATE, P_CURSOR OUT SYS_REFCURSOR);
    PROCEDURE VENDEDORES_POR_AREA(P_DESDE IN DATE, P_HASTA IN DATE, P_CURSOR OUT SYS_REFCURSOR);
    PROCEDURE ENVIOS_POR_SUCURSAL(P_DESDE IN DATE, P_HASTA IN DATE, P_CURSOR OUT SYS_REFCURSOR);
END PKG_REPORTES;
/

CREATE OR REPLACE PACKAGE BODY PKG_REPORTES AS

    PROCEDURE VENTAS_POR_SUCURSAL(P_DESDE IN DATE, P_HASTA IN DATE, P_CURSOR OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN P_CURSOR FOR
            SELECT sucursal, departamento, pais,
                   COUNT(DISTINCT id_factura) AS facturas,
                   SUM(cantidad)              AS unidades,
                   SUM(subtotal)              AS total_vendido
              FROM V_VENTAS_BASE
             WHERE fecha >= NVL(P_DESDE, DATE '1900-01-01')
               AND fecha <  NVL(P_HASTA, DATE '2999-12-31') + 1
             GROUP BY sucursal, departamento, pais
             ORDER BY total_vendido DESC;
    END;

    PROCEDURE PRODUCTOS_MAS_VENDIDOS(P_DESDE IN DATE, P_HASTA IN DATE, P_TOP IN NUMBER, P_CURSOR OUT SYS_REFCURSOR) IS
        V_TOP NUMBER := NVL(P_TOP, 10);
    BEGIN
        OPEN P_CURSOR FOR
            SELECT codigo, producto, categoria, marca,
                   SUM(cantidad) AS unidades_vendidas,
                   SUM(subtotal) AS total_vendido
              FROM V_VENTAS_BASE
             WHERE fecha >= NVL(P_DESDE, DATE '1900-01-01')
               AND fecha <  NVL(P_HASTA, DATE '2999-12-31') + 1
             GROUP BY codigo, producto, categoria, marca
             ORDER BY unidades_vendidas DESC
             FETCH FIRST V_TOP ROWS ONLY;
    END;

    PROCEDURE CLIENTES_POR_REGION(P_DESDE IN DATE, P_HASTA IN DATE, P_CURSOR OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN P_CURSOR FOR
            SELECT region, pais, cliente,
                   COUNT(DISTINCT id_factura) AS facturas,
                   SUM(subtotal)              AS total_comprado
              FROM V_VENTAS_BASE
             WHERE fecha >= NVL(P_DESDE, DATE '1900-01-01')
               AND fecha <  NVL(P_HASTA, DATE '2999-12-31') + 1
             GROUP BY region, pais, cliente
             ORDER BY region, total_comprado DESC;
    END;

    PROCEDURE VENDEDORES_POR_AREA(P_DESDE IN DATE, P_HASTA IN DATE, P_CURSOR OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN P_CURSOR FOR
            SELECT region, pais, vendedor,
                   COUNT(DISTINCT id_factura) AS facturas,
                   SUM(subtotal)              AS total_vendido
              FROM V_VENTAS_BASE
             WHERE fecha >= NVL(P_DESDE, DATE '1900-01-01')
               AND fecha <  NVL(P_HASTA, DATE '2999-12-31') + 1
             GROUP BY region, pais, vendedor
             ORDER BY region, total_vendido DESC;
    END;

    PROCEDURE ENVIOS_POR_SUCURSAL(P_DESDE IN DATE, P_HASTA IN DATE, P_CURSOR OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN P_CURSOR FOR
            SELECT s.nombre AS sucursal, p.nombres || ' ' || p.apellidos AS responsable,
                   COUNT(*) AS envios,
                   SUM(CASE WHEN e.estado = 'ENTREGADO' THEN 1 ELSE 0 END) AS entregados
              FROM ENVIO e
              JOIN SUCURSAL s  ON s.id_sucursal = e.id_sucursal
              JOIN EMPLEADO em ON em.id_empleado = e.id_empleado
              JOIN PERSONA p   ON p.id_persona = em.id_persona
             WHERE e.fecha_envio >= NVL(P_DESDE, DATE '1900-01-01')
               AND e.fecha_envio <  NVL(P_HASTA, DATE '2999-12-31') + 1
             GROUP BY s.nombre, p.nombres, p.apellidos
             ORDER BY envios DESC;
    END;

END PKG_REPORTES;
/

--menus y roles

DECLARE
    PROCEDURE P_ROL(P_NOMBRE IN VARCHAR2, P_DESC IN VARCHAR2) IS
    BEGIN
        INSERT INTO ROL (nombre, descripcion)
        SELECT P_NOMBRE, P_DESC FROM DUAL
         WHERE NOT EXISTS (SELECT 1 FROM ROL WHERE nombre = P_NOMBRE);
    END;

    PROCEDURE P_OPC(P_MODULO IN VARCHAR2, P_ORD_MOD IN NUMBER,
                    P_MENU   IN VARCHAR2, P_ORD_MENU IN NUMBER,
                    P_OPCION IN VARCHAR2, P_RUTA IN VARCHAR2, P_ORD IN NUMBER) IS
        V_MOD NUMBER;
        V_MEN NUMBER;
        V_OPC NUMBER;
    BEGIN
        BEGIN
            SELECT id_modulo INTO V_MOD FROM MODULO WHERE nombre = P_MODULO;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                INSERT INTO MODULO (nombre, descripcion, orden)
                VALUES (P_MODULO, P_MODULO, P_ORD_MOD)
                RETURNING id_modulo INTO V_MOD;
        END;

        BEGIN
            SELECT id_menu INTO V_MEN FROM MENU WHERE id_modulo = V_MOD AND nombre = P_MENU;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                INSERT INTO MENU (id_modulo, nombre, orden)
                VALUES (V_MOD, P_MENU, P_ORD_MENU)
                RETURNING id_menu INTO V_MEN;
        END;

        BEGIN
            SELECT id_opcion INTO V_OPC FROM OPCION WHERE id_menu = V_MEN AND nombre = P_OPCION;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                INSERT INTO OPCION (id_menu, nombre, ruta, orden)
                VALUES (V_MEN, P_OPCION, P_RUTA, P_ORD);
        END;
    END;

    PROCEDURE P_PERM(P_ROL IN VARCHAR2, P_OPCION IN VARCHAR2,
                     P_C IN CHAR, P_I IN CHAR, P_U IN CHAR, P_D IN CHAR) IS
    BEGIN
        MERGE INTO ROL_OPCION t
        USING (SELECT r.id_rol, o.id_opcion
                 FROM ROL r, OPCION o
                WHERE r.nombre = P_ROL AND o.nombre = P_OPCION) s
           ON (t.id_rol = s.id_rol AND t.id_opcion = s.id_opcion)
         WHEN MATCHED THEN UPDATE SET
              t.puede_consultar = P_C, t.puede_insertar = P_I,
              t.puede_actualizar = P_U, t.puede_eliminar = P_D
         WHEN NOT MATCHED THEN INSERT
              (id_rol, id_opcion, puede_consultar, puede_insertar, puede_actualizar, puede_eliminar)
              VALUES (s.id_rol, s.id_opcion, P_C, P_I, P_U, P_D);
    END;

    PROCEDURE P_PERM_MODULO(P_ROL IN VARCHAR2, P_MODULO IN VARCHAR2,
                            P_C IN CHAR, P_I IN CHAR, P_U IN CHAR, P_D IN CHAR) IS
    BEGIN
        FOR O IN (SELECT op.nombre
                    FROM OPCION op
                    JOIN MENU me   ON me.id_menu = op.id_menu
                    JOIN MODULO mo ON mo.id_modulo = me.id_modulo
                   WHERE mo.nombre = P_MODULO) LOOP
            P_PERM(P_ROL, O.nombre, P_C, P_I, P_U, P_D);
        END LOOP;
    END;
BEGIN

    P_ROL('Administrador General', 'Acceso total al sistema');
    P_ROL('Cajero',    'Facturacion y cobros');
    P_ROL('Gerente',   'Consultas y reportes gerenciales');
    P_ROL('Bodeguero', 'Compras, inventario y envios');

    P_OPC('Seguridad', 1, 'Administración', 1, 'Gestión de Usuarios', '/admin/usuarios', 1);
    P_OPC('Seguridad', 1, 'Administración', 1, 'Roles y Permisos',     '/admin/roles',    2);
    P_OPC('Seguridad', 1, 'Administración', 1, 'Bitácora',             '/admin/bitacora', 3);

    P_OPC('Catálogos', 2, 'General', 1, 'Categorías',       '/catalogos/categorias',    1);
    P_OPC('Catálogos', 2, 'General', 1, 'Marcas',           '/catalogos/marcas',        2);
    P_OPC('Catálogos', 2, 'General', 1, 'Productos',        '/catalogos/productos',     3);
    P_OPC('Catálogos', 2, 'General', 1, 'Proveedores',      '/catalogos/proveedores',   4);
    P_OPC('Catálogos', 2, 'General', 1, 'Clientes',         '/catalogos/clientes',      5);
    P_OPC('Catálogos', 2, 'General', 1, 'Empleados',        '/catalogos/empleados',     6);
    P_OPC('Catálogos', 2, 'General', 1, 'Sucursales',       '/catalogos/sucursales',    7);
    P_OPC('Catálogos', 2, 'General', 1, 'Vehículos',        '/catalogos/vehiculos',     8);
    P_OPC('Catálogos', 2, 'General', 1, 'Métodos de Pago',  '/catalogos/metodos-pago',  9);
    P_OPC('Catálogos', 2, 'General', 1, 'Puestos',          '/catalogos/puestos',       10);
    P_OPC('Catálogos', 2, 'General', 1, 'Departamentos',    '/catalogos/departamentos', 11);
    P_OPC('Catálogos', 2, 'General', 1, 'Motivos de Baja',  '/catalogos/motivos-baja',  12);

    P_OPC('Ventas', 3, 'Facturación', 1, 'Emisión de Factura', '/ventas/facturar',      1);
    P_OPC('Ventas', 3, 'Facturación', 1, 'Pagos de Clientes',  '/ventas/pagos',         2);
    P_OPC('Ventas', 3, 'Facturación', 1, 'Notas de Crédito',   '/ventas/notas-credito', 3);
    P_OPC('Ventas', 3, 'Facturación', 1, 'Garantías',          '/ventas/garantias',     4);
    P_OPC('Ventas', 3, 'Facturación', 1, 'Devoluciones',       '/ventas/devoluciones',  5);

    P_OPC('Compras', 4, 'Compras', 1, 'Registro de Compras',   '/compras/registro', 1);
    P_OPC('Compras', 4, 'Compras', 1, 'Pagos a Proveedores',   '/compras/pagos',    2);

    P_OPC('Inventario', 5, 'Inventario', 1, 'Existencias',          '/inventario/existencias', 1);
    P_OPC('Inventario', 5, 'Inventario', 1, 'Bajas de Inventario',  '/inventario/bajas',       2);
    P_OPC('Inventario', 5, 'Inventario', 1, 'Kardex',               '/inventario/kardex',      3);

    P_OPC('Envíos', 6, 'Envíos', 1, 'Gestión de Envíos', '/envios/gestion', 1);

    P_OPC('Reportes', 7, 'Consultas', 1, 'Ventas por Sucursal',             '/reportes/ventas-sucursal', 1);
    P_OPC('Reportes', 7, 'Consultas', 1, 'Productos Más y Menos Vendidos',  '/reportes/productos',       2);
    P_OPC('Reportes', 7, 'Consultas', 1, 'Clientes por Región',             '/reportes/clientes-region', 3);
    P_OPC('Reportes', 7, 'Consultas', 1, 'Vendedores por Área',             '/reportes/vendedores-area', 4);
    P_OPC('Reportes', 7, 'Consultas', 1, 'Envíos por Sucursal',             '/reportes/envios',          5);
    P_OPC('Reportes', 7, 'Consultas', 1, 'Cuentas por Cobrar',              '/reportes/cxc',             6);
    P_OPC('Reportes', 7, 'Consultas', 1, 'Cuentas por Pagar',               '/reportes/cxp',             7);
    P_OPC('Reportes', 7, 'Consultas', 1, 'Dashboard Gerencial',             '/reportes/dashboard',       8);

    FOR M IN (SELECT nombre FROM MODULO) LOOP
        P_PERM_MODULO('Administrador General', M.nombre, 'S', 'S', 'S', 'S');
    END LOOP;

    FOR M IN (SELECT nombre FROM MODULO WHERE nombre <> 'Seguridad') LOOP
        P_PERM_MODULO('Gerente', M.nombre, 'S', 'N', 'N', 'N');
    END LOOP;

    P_PERM_MODULO('Bodeguero', 'Compras',    'S', 'S', 'S', 'N');
    P_PERM_MODULO('Bodeguero', 'Inventario', 'S', 'S', 'S', 'N');
    P_PERM_MODULO('Bodeguero', 'Envíos',     'S', 'S', 'S', 'N');
    P_PERM('Bodeguero', 'Productos',   'S', 'N', 'N', 'N');
    P_PERM('Bodeguero', 'Proveedores', 'S', 'N', 'N', 'N');

    P_PERM('Cajero', 'Emisión de Factura', 'S', 'S', 'N', 'N');
    P_PERM('Cajero', 'Pagos de Clientes',  'S', 'S', 'N', 'N');
    P_PERM('Cajero', 'Notas de Crédito',   'S', 'S', 'N', 'N');
    P_PERM('Cajero', 'Clientes',           'S', 'S', 'S', 'N');
    P_PERM('Cajero', 'Productos',          'S', 'N', 'N', 'N');
    P_PERM('Cajero', 'Existencias',        'S', 'N', 'N', 'N');

    COMMIT;
END;
/

--triggers

ALTER TRIGGER TRG_BI_DETALLE_ENVIO COMPILE;
ALTER TRIGGER TRG_BI_DETALLE_GARANTIA COMPILE;
ALTER TRIGGER TRG_BI_DEVOLUCION COMPILE;
ALTER TRIGGER TRG_BI_ENVIO COMPILE;
ALTER TRIGGER TRG_BI_GARANTIA COMPILE;
ALTER TRIGGER TRG_BI_PAGO_PROVEEDOR COMPILE;

--verificacion

SELECT 'MONEDA' tabla, COUNT(*) filas FROM MONEDA UNION ALL
SELECT 'PAIS', COUNT(*) FROM PAIS UNION ALL
SELECT 'REGION_GEOGRAFICA', COUNT(*) FROM REGION_GEOGRAFICA UNION ALL
SELECT 'DEPARTAMENTO', COUNT(*) FROM DEPARTAMENTO UNION ALL
SELECT 'MUNICIPIO', COUNT(*) FROM MUNICIPIO UNION ALL
SELECT 'SUCURSAL', COUNT(*) FROM SUCURSAL UNION ALL
SELECT 'PERSONA', COUNT(*) FROM PERSONA UNION ALL
SELECT 'EMPLEADO', COUNT(*) FROM EMPLEADO UNION ALL
SELECT 'EMPLEADO_SUCURSAL', COUNT(*) FROM EMPLEADO_SUCURSAL UNION ALL
SELECT 'USUARIO', COUNT(*) FROM USUARIO UNION ALL
SELECT 'CLIENTE', COUNT(*) FROM CLIENTE UNION ALL
SELECT 'PRODUCTO_SUCURSAL', COUNT(*) FROM PRODUCTO_SUCURSAL UNION ALL
SELECT 'FACTURA', COUNT(*) FROM FACTURA UNION ALL
SELECT 'DETALLE_FACTURA', COUNT(*) FROM DETALLE_FACTURA UNION ALL
SELECT 'PAGO_CLIENTE', COUNT(*) FROM PAGO_CLIENTE UNION ALL
SELECT 'BITACORA', COUNT(*) FROM BITACORA;

SELECT p.codigo, ps.existencia
  FROM PRODUCTO_SUCURSAL ps JOIN PRODUCTO p ON p.id_producto = ps.id_producto;

SELECT tabla_afectada, tipo_evento, descripcion, valor_anterior, valor_nuevo FROM BITACORA;

SELECT object_type, COUNT(*) AS cantidad
  FROM user_objects
 WHERE object_type IN ('TABLE','VIEW','SEQUENCE','TRIGGER','PROCEDURE','FUNCTION','PACKAGE','PACKAGE BODY')
 GROUP BY object_type
 ORDER BY object_type;

SELECT object_name, object_type FROM user_objects WHERE status = 'INVALID';
SELECT name, type, line, text FROM user_errors ORDER BY name, sequence;

SELECT COUNT(*) AS llaves_foraneas FROM user_constraints WHERE constraint_type = 'R';

SELECT nombre_usuario,
       CASE WHEN clave = FN_HASH_CLAVE('admin') THEN 'COINCIDE' ELSE 'NO COINCIDE' END AS prueba_clave
  FROM USUARIO;

SELECT modulo, menu, opcion, ruta FROM V_MENU_USUARIO WHERE nombre_usuario = 'admin'
 ORDER BY orden_modulo, orden_menu, orden_opcion;

SELECT object_name, object_type, status
FROM user_objects
WHERE status = 'INVALID';

SELECT COUNT(*) AS total_cuentas_por_cobrar
FROM V_CUENTAS_POR_COBRAR;

SELECT COUNT(*) AS checks_creados
FROM user_constraints
WHERE constraint_type = 'C' AND constraint_name LIKE 'CK\_%' ESCAPE '\';

SELECT nombre_usuario,
       CASE
           WHEN clave = FN_HASH_CLAVE('admin') THEN 'COINCIDE'
           ELSE 'NO COINCIDE'
       END AS prueba
FROM USUARIO;

--pruebas

SET SERVEROUTPUT ON;

INSERT INTO COMPRA (id_empleado_sucursal, id_proveedor, numero_documento, fecha, condicion_pago, total, saldo, estado)
VALUES ((SELECT es.id_empleado_sucursal FROM EMPLEADO_SUCURSAL es JOIN EMPLEADO e ON e.id_empleado = es.id_empleado WHERE e.codigo_empleado = 'EMP-001'),
        (SELECT id_proveedor FROM PROVEEDOR WHERE nombre = 'Distribuidora Ferretera El Sol'),
        'TEST-COMPRA-1', SYSDATE, 'CONTADO', 350.00, 0, 'PAGADA');
INSERT INTO DETALLE_COMPRA (id_compra, id_producto_sucursal, cantidad, costo_unitario, subtotal)
VALUES ((SELECT id_compra FROM COMPRA WHERE numero_documento = 'TEST-COMPRA-1'),
        (SELECT ps.id_producto_sucursal FROM PRODUCTO_SUCURSAL ps JOIN PRODUCTO p ON p.id_producto = ps.id_producto WHERE p.codigo = 'HERR-001'),
        10, 35.00, 350.00);

INSERT INTO DETALLE_FACTURA (id_factura, id_producto_sucursal, cantidad, precio_unitario, subtotal)
VALUES ((SELECT id_factura FROM FACTURA WHERE serie = 'A001' AND numero = 1001),
        (SELECT ps.id_producto_sucursal FROM PRODUCTO_SUCURSAL ps JOIN PRODUCTO p ON p.id_producto = ps.id_producto WHERE p.codigo = 'HERR-001'),
        2, 65.00, 130.00);

INSERT INTO NOTA_CREDITO (id_empleado, id_factura, numero, fecha, motivo, total)
VALUES ((SELECT id_empleado FROM EMPLEADO WHERE codigo_empleado = 'EMP-002'),
        (SELECT id_factura FROM FACTURA WHERE serie = 'A001' AND numero = 1001),
        'NC-TEST-1', SYSDATE, 'Producto devuelto por el cliente', 65.00);
INSERT INTO DETALLE_NOTA_CREDITO (id_detalle_factura, id_nota_credito, cantidad, precio_unitario, subtotal)
VALUES ((SELECT MIN(id_detalle_factura) FROM DETALLE_FACTURA WHERE id_factura = (SELECT id_factura FROM FACTURA WHERE serie = 'A001' AND numero = 1001)),
        (SELECT id_nota_credito FROM NOTA_CREDITO WHERE numero = 'NC-TEST-1'),
        1, 65.00, 65.00);

UPDATE FACTURA SET estado = 'ANULADA' WHERE serie = 'A001' AND numero = 1001;

SELECT p.codigo, ps.existencia
  FROM PRODUCTO_SUCURSAL ps JOIN PRODUCTO p ON p.id_producto = ps.id_producto
 WHERE p.codigo = 'HERR-001';

SELECT t.nombre AS tipo, m.cantidad, m.existencia_anterior AS anterior, m.existencia_nueva AS nueva, m.referencia
  FROM MOVIMIENTO_INVENTARIO m JOIN TIPO_MOVIMIENTO t ON t.id_tipo_movimiento = m.id_tipo_movimiento
 ORDER BY m.id_movimiento_inventario;

ROLLBACK;

DECLARE
    V_CLI NUMBER; V_ES NUMBER; V_EMP NUMBER; V_PS NUMBER; V_MET NUMBER;
    V_FAC NUMBER; V_NC NUMBER; V_DET NUMBER; V_TOTAL NUMBER;
    V_EXIST_ANTES NUMBER; V_EXIST_VENTA NUMBER; V_EXIST_NC NUMBER;
    V_SALDO NUMBER; V_ESTADO VARCHAR2(15);
BEGIN
    SELECT MIN(id_cliente) INTO V_CLI FROM CLIENTE;
    SELECT es.id_empleado_sucursal, e.id_empleado INTO V_ES, V_EMP
      FROM EMPLEADO_SUCURSAL es JOIN EMPLEADO e ON e.id_empleado = es.id_empleado
     WHERE e.codigo_empleado = 'EMP-002';
    SELECT ps.id_producto_sucursal, ps.existencia INTO V_PS, V_EXIST_ANTES
      FROM PRODUCTO_SUCURSAL ps JOIN PRODUCTO p ON p.id_producto = ps.id_producto
     WHERE p.codigo = 'HERR-001';
    SELECT id_metodo_pago INTO V_MET FROM METODO_PAGO WHERE nombre = 'Efectivo';

    V_FAC := PKG_VENTAS.NUEVA_FACTURA(V_CLI, V_ES, 'CONTADO');
    PKG_VENTAS.AGREGAR_DETALLE(V_FAC, V_PS, 3);
    SELECT total INTO V_TOTAL FROM FACTURA WHERE id_factura = V_FAC;
    SELECT existencia INTO V_EXIST_VENTA FROM PRODUCTO_SUCURSAL WHERE id_producto_sucursal = V_PS;

    PKG_VENTAS.REGISTRAR_PAGO(V_FAC, V_ES, V_MET, V_TOTAL, 'EFECTIVO-TEST');
    SELECT saldo, estado INTO V_SALDO, V_ESTADO FROM FACTURA WHERE id_factura = V_FAC;

    SELECT MIN(id_detalle_factura) INTO V_DET FROM DETALLE_FACTURA WHERE id_factura = V_FAC;
    V_NC := PKG_VENTAS.NUEVA_NOTA_CREDITO(V_FAC, V_EMP, 'Prueba de nota de credito');
    PKG_VENTAS.AGREGAR_DETALLE_NC(V_NC, V_DET, 1);
    SELECT existencia INTO V_EXIST_NC FROM PRODUCTO_SUCURSAL WHERE id_producto_sucursal = V_PS;

    DBMS_OUTPUT.PUT_LINE('Existencia inicial: ' || V_EXIST_ANTES || '  | tras vender 3: ' || V_EXIST_VENTA ||
                         '  | tras nota de credito de 1: ' || V_EXIST_NC);
    DBMS_OUTPUT.PUT_LINE('Factura total: ' || V_TOTAL || '  | saldo tras pago: ' || V_SALDO || '  | estado: ' || V_ESTADO);
    ROLLBACK;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('PRUEBA CON ERROR: ' || SQLERRM);
        ROLLBACK;
END;
/

--paises

BEGIN

   INSERT INTO PAIS (CODIGO_PAIS, NOMBRE_PAIS, MONEDA, SIMBOLO_MONEDA)
   SELECT 'GT', 'Guatemala', 'Quetzal', 'Q' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PAIS WHERE CODIGO_PAIS = 'GT');

   INSERT INTO PAIS (CODIGO_PAIS, NOMBRE_PAIS, MONEDA, SIMBOLO_MONEDA)
   SELECT 'SV', 'El Salvador', 'Dólar', '$' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PAIS WHERE CODIGO_PAIS = 'SV');

   INSERT INTO PAIS (CODIGO_PAIS, NOMBRE_PAIS, MONEDA, SIMBOLO_MONEDA)
   SELECT 'HN', 'Honduras', 'Lempira', 'L' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PAIS WHERE CODIGO_PAIS = 'HN');

   COMMIT;
END;
/
