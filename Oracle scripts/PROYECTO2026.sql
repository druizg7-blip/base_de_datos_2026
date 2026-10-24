/*==============================================================*/
/* DBMS name:      ORACLE Version 19c                           */
/* Created on:     20/10/2026 19:52:27                          */
/*==============================================================*/


alter table BITACORA
   drop constraint FK_BITACORA_RELATIONS_USUARIO;

alter table CLIENTE
   drop constraint FK_CLIENTE_RELATIONS_PERSONA;

alter table COMPRA
   drop constraint FK_COMPRA_RELATIONS_PROVEEDO;

alter table COMPRA
   drop constraint FK_COMPRA_RELATIONS_EMPLEADO;

alter table DEPARTAMENTO
   drop constraint FK_DEPARTAM_RELATIONS_PAIS;

alter table DEPARTAMENTO
   drop constraint FK_DEPARTAM_RELATIONS_REGION_G;

alter table DETALLE_COMPRA
   drop constraint FK_DETALLE__RELATIONS_COMPRA;

alter table DETALLE_COMPRA
   drop constraint FK_DETALLE__RELATIONS_PRODUCTO;

alter table DETALLE_ENVIO
   drop constraint FK_DETALLE__RELATIONS_ENVIO;

alter table DETALLE_ENVIO
   drop constraint FK_DETALLE__RELATIONS_DETALLE_;

alter table DETALLE_FACTURA
   drop constraint FK_DETALLE__RELATIONS_FACTURA;

alter table DETALLE_FACTURA
   drop constraint FK_DETALLE__RELATIONS_PRODUCTO;

alter table DETALLE_GARANTIA
   drop constraint FK_DETALLE__RELATIONS_GARANTIA;

alter table DETALLE_GARANTIA
   drop constraint FK_DETALLE__RELATIONS_DETALLE_;

alter table DETALLE_NOTA_CREDITO
   drop constraint FK_DETALLE__RELATIONS_NOTA_CRE;

alter table DETALLE_NOTA_CREDITO
   drop constraint FK_DETALLE__RELATIONS_DETALLE_;

alter table DEVOLUCION
   drop constraint FK_DEVOLUCI_RELATIONS_FACTURA;

alter table DEVOLUCION
   drop constraint FK_DEVOLUCI_RELATIONS_DETALLE_;

alter table DEVOLUCION
   drop constraint FK_DEVOLUCI_RELATIONS_SUCURSAL;

alter table DEVOLUCION
   drop constraint FK_DEVOLUCI_RELATIONS_EMPLEADO;

alter table DEVOLUCION
   drop constraint FK_DEVOLUCI_RELATIONS_NOTA_CRE;

alter table EMPLEADO
   drop constraint FK_EMPLEADO_RELATIONS_PERSONA;

alter table EMPLEADO_PUESTO
   drop constraint FK_EMPLEADO_RELATIONS_PUESTO;

alter table EMPLEADO_PUESTO
   drop constraint FK_EMPLEADO_RELATIONS_EMPLEADO;

alter table EMPLEADO_SUCURSAL
   drop constraint FK_EMPLEADO_RELATIONS_SUCURSAL;

alter table EMPLEADO_SUCURSAL
   drop constraint FK_EMPLEADO_RELATIONS_EMPLEADO;

alter table ENVIO
   drop constraint FK_ENVIO_RELATIONS_FACTURA;

alter table ENVIO
   drop constraint FK_ENVIO_RELATIONS_SUCURSAL;

alter table ENVIO
   drop constraint FK_ENVIO_RELATIONS_VEHICULO;

alter table ENVIO
   drop constraint FK_ENVIO_RELATIONS_EMPLEADO;

alter table ENVIO
   drop constraint FK_ENVIO_RELATIONS_DEPARTAM;

alter table FACTURA
   drop constraint FK_FACTURA_RELATIONS_EMPLEADO;

alter table FACTURA
   drop constraint FK_FACTURA_RELATIONS_CLIENTE;

alter table GARANTIA
   drop constraint FK_GARANTIA_RELATIONS_EMPLEADO;

alter table GARANTIA
   drop constraint FK_GARANTIA_RELATIONS_NOTA_CRE;

alter table GARANTIA
   drop constraint FK_GARANTIA_RELATIONS_FACTURA;

alter table MENU
   drop constraint FK_MENU_RELATIONS_MODULO;

alter table MOVIMIENTO_INVENTARIO
   drop constraint FK_MOVIMIEN_RELATIONS_MOTIVO_B;

alter table MOVIMIENTO_INVENTARIO
   drop constraint FK_MOVIMIEN_RELATIONS_TIPO_MOV;

alter table MOVIMIENTO_INVENTARIO
   drop constraint FK_MOVIMIEN_RELATIONS_PRODUCTO;

alter table MUNICIPIO
   drop constraint FK_MUNICIPI_RELATIONS_DEPARTAM;

alter table NOTA_CREDITO
   drop constraint FK_NOTA_CRE_RELATIONS_FACTURA;

alter table NOTA_CREDITO
   drop constraint FK_NOTA_CRE_RELATIONS_EMPLEADO;

alter table OPCION
   drop constraint FK_OPCION_RELATIONS_MENU;

alter table PAGO_CLIENTE
   drop constraint FK_PAGO_CLI_RELATIONS_CLIENTE;

alter table PAGO_CLIENTE
   drop constraint FK_PAGO_CLI_RELATIONS_FACTURA;

alter table PAGO_CLIENTE
   drop constraint FK_PAGO_CLI_RELATIONS_METODO_P;

alter table PAGO_CLIENTE
   drop constraint FK_PAGO_CLI_RELATIONS_EMPLEADO;

alter table PAGO_PROVEEDOR
   drop constraint FK_PAGO_PRO_RELATIONS_COMPRA;

alter table PAGO_PROVEEDOR
   drop constraint FK_PAGO_PRO_RELATIONS_METODO_P;

alter table PAGO_PROVEEDOR
   drop constraint FK_PAGO_PRO_RELATIONS_EMPLEADO;

alter table PAIS
   drop constraint FK_PAIS_RELATIONS_MONEDA;

alter table PRODUCTO
   drop constraint FK_PRODUCTO_RELATIONS_CATEGORI;

alter table PRODUCTO
   drop constraint FK_PRODUCTO_RELATIONS_MARCA;

alter table PRODUCTO_SUCURSAL
   drop constraint FK_PRODUCTO_RELATIONS_SUCURSAL;

alter table PRODUCTO_SUCURSAL
   drop constraint FK_PRODUCTO_RELATIONS_PRODUCTO;

alter table PROVEEDOR
   drop constraint FK_PROVEEDO_RELATIONS_PAIS;

alter table ROL_OPCION
   drop constraint FK_ROL_OPCI_RELATIONS_ROL;

alter table ROL_OPCION
   drop constraint FK_ROL_OPCI_RELATIONS_OPCION;

alter table SUCURSAL
   drop constraint FK_SUCURSAL_RELATIONS_DEPARTAM;

alter table USUARIO
   drop constraint FK_USUARIO_RELATIONS_EMPLEADO;

alter table USUARIO
   drop constraint FK_USUARIO_RELATIONS_ROL;

alter table VEHICULO
   drop constraint FK_VEHICULO_RELATIONS_SUCURSAL;

drop index Relationship_82_FK;

drop table BITACORA cascade constraints;

drop table CATEGORIA cascade constraints;

drop index Relationship_68_FK;

drop table CLIENTE cascade constraints;

drop index Relationship_85_FK;

drop index Relationship_21_FK;

drop table COMPRA cascade constraints;

drop index Relationship_88_FK;

drop index Relationship_63_FK;

drop table DEPARTAMENTO cascade constraints;

drop index Relationship_78_FK;

drop index Relationship_24_FK;

drop table DETALLE_COMPRA cascade constraints;

drop index Relationship_61_FK;

drop index Relationship_60_FK;

drop table DETALLE_ENVIO cascade constraints;

drop index Relationship_77_FK;

drop index Relationship_33_FK;

drop table DETALLE_FACTURA cascade constraints;

drop index Relationship_81_FK;

drop index Relationship_80_FK;

drop table DETALLE_GARANTIA cascade constraints;

drop index Relationship_38_FK;

drop index Relationship_37_FK;

drop table DETALLE_NOTA_CREDITO cascade constraints;

drop index Relationship_48_FK;

drop index Relationship_47_FK;

drop index Relationship_46_FK;

drop index Relationship_45_FK;

drop index Relationship_44_FK;

drop table DEVOLUCION cascade constraints;

drop index Relationship_69_FK;

drop table EMPLEADO cascade constraints;

drop index Relationship_71_FK;

drop index Relationship_70_FK;

drop table EMPLEADO_PUESTO cascade constraints;

drop index Relationship_67_FK;

drop index Relationship_66_FK;

drop table EMPLEADO_SUCURSAL cascade constraints;

drop index Relationship_59_FK;

drop index Relationship_58_FK;

drop index Relationship_57_FK;

drop index Relationship_56_FK;

drop index Relationship_55_FK;

drop table ENVIO cascade constraints;

drop index Relationship_87_FK;

drop index Relationship_86_FK;

drop table FACTURA cascade constraints;

drop index Relationship_79_FK;

drop index Relationship_53_FK;

drop index Relationship_52_FK;

drop table GARANTIA cascade constraints;

drop table MARCA cascade constraints;

drop index Relationship_3_FK;

drop table MENU cascade constraints;

drop table METODO_PAGO cascade constraints;

drop table MODULO cascade constraints;

drop table MONEDA cascade constraints;

drop table MOTIVO_BAJA cascade constraints;

drop index Relationship_74_FK;

drop index Relationship_73_FK;

drop index Relationship_72_FK;

drop table MOVIMIENTO_INVENTARIO cascade constraints;

drop index Relationship_65_FK;

drop table MUNICIPIO cascade constraints;

drop index Relationship_36_FK;

drop index Relationship_35_FK;

drop table NOTA_CREDITO cascade constraints;

drop index Relationship_4_FK;

drop table OPCION cascade constraints;

drop index Relationship_83_FK;

drop index Relationship_42_FK;

drop index Relationship_40_FK;

drop index Relationship_39_FK;

drop table PAGO_CLIENTE cascade constraints;

drop index Relationship_84_FK;

drop index Relationship_27_FK;

drop index Relationship_26_FK;

drop table PAGO_PROVEEDOR cascade constraints;

drop index Relationship_64_FK;

drop table PAIS cascade constraints;

drop table PERSONA cascade constraints;

drop index Relationship_13_FK;

drop index Relationship_12_FK;

drop table PRODUCTO cascade constraints;

drop index Relationship_76_FK;

drop index Relationship_75_FK;

drop table PRODUCTO_SUCURSAL cascade constraints;

drop index Relationship_20_FK;

drop table PROVEEDOR cascade constraints;

drop table PUESTO cascade constraints;

drop table REGION_GEOGRAFICA cascade constraints;

drop table ROL cascade constraints;

drop index Relationship_6_FK;

drop index Relationship_5_FK;

drop table ROL_OPCION cascade constraints;

drop index Relationship_9_FK;

drop table SUCURSAL cascade constraints;

drop table TIPO_MOVIMIENTO cascade constraints;

drop index Relationship_2_FK;

drop index Relationship_1_FK;

drop table USUARIO cascade constraints;

drop index Relationship_54_FK;

drop table VEHICULO cascade constraints;

/*==============================================================*/
/* Table: BITACORA                                              */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_82_FK                                    */
/*==============================================================*/
create index Relationship_82_FK on BITACORA (
   id_usuario ASC
);

/*==============================================================*/
/* Table: CATEGORIA                                             */
/*==============================================================*/
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

/*==============================================================*/
/* Table: CLIENTE                                               */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_68_FK                                    */
/*==============================================================*/
create index Relationship_68_FK on CLIENTE (
   id_persona ASC
);

/*==============================================================*/
/* Table: COMPRA                                                */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_21_FK                                    */
/*==============================================================*/
create index Relationship_21_FK on COMPRA (
   id_proveedor ASC
);

/*==============================================================*/
/* Index: Relationship_85_FK                                    */
/*==============================================================*/
create index Relationship_85_FK on COMPRA (
   id_empleado_sucursal ASC
);

/*==============================================================*/
/* Table: DEPARTAMENTO                                          */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_63_FK                                    */
/*==============================================================*/
create index Relationship_63_FK on DEPARTAMENTO (
   id_pais ASC
);

/*==============================================================*/
/* Index: Relationship_88_FK                                    */
/*==============================================================*/
create index Relationship_88_FK on DEPARTAMENTO (
   id_region_geografica ASC
);

/*==============================================================*/
/* Table: DETALLE_COMPRA                                        */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_24_FK                                    */
/*==============================================================*/
create index Relationship_24_FK on DETALLE_COMPRA (
   id_compra ASC
);

/*==============================================================*/
/* Index: Relationship_78_FK                                    */
/*==============================================================*/
create index Relationship_78_FK on DETALLE_COMPRA (
   id_producto_sucursal ASC
);

/*==============================================================*/
/* Table: DETALLE_ENVIO                                         */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_60_FK                                    */
/*==============================================================*/
create index Relationship_60_FK on DETALLE_ENVIO (
   id_envio ASC
);

/*==============================================================*/
/* Index: Relationship_61_FK                                    */
/*==============================================================*/
create index Relationship_61_FK on DETALLE_ENVIO (
   id_detalle_factura ASC
);

/*==============================================================*/
/* Table: DETALLE_FACTURA                                       */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_33_FK                                    */
/*==============================================================*/
create index Relationship_33_FK on DETALLE_FACTURA (
   id_factura ASC
);

/*==============================================================*/
/* Index: Relationship_77_FK                                    */
/*==============================================================*/
create index Relationship_77_FK on DETALLE_FACTURA (
   id_producto_sucursal ASC
);

/*==============================================================*/
/* Table: DETALLE_GARANTIA                                      */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_80_FK                                    */
/*==============================================================*/
create index Relationship_80_FK on DETALLE_GARANTIA (
   id_garantia ASC
);

/*==============================================================*/
/* Index: Relationship_81_FK                                    */
/*==============================================================*/
create index Relationship_81_FK on DETALLE_GARANTIA (
   id_detalle_factura ASC
);

/*==============================================================*/
/* Table: DETALLE_NOTA_CREDITO                                  */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_37_FK                                    */
/*==============================================================*/
create index Relationship_37_FK on DETALLE_NOTA_CREDITO (
   id_nota_credito ASC
);

/*==============================================================*/
/* Index: Relationship_38_FK                                    */
/*==============================================================*/
create index Relationship_38_FK on DETALLE_NOTA_CREDITO (
   id_detalle_factura ASC
);

/*==============================================================*/
/* Table: DEVOLUCION                                            */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_44_FK                                    */
/*==============================================================*/
create index Relationship_44_FK on DEVOLUCION (
   id_factura ASC
);

/*==============================================================*/
/* Index: Relationship_45_FK                                    */
/*==============================================================*/
create index Relationship_45_FK on DEVOLUCION (
   id_detalle_factura ASC
);

/*==============================================================*/
/* Index: Relationship_46_FK                                    */
/*==============================================================*/
create index Relationship_46_FK on DEVOLUCION (
   id_sucursal ASC
);

/*==============================================================*/
/* Index: Relationship_47_FK                                    */
/*==============================================================*/
create index Relationship_47_FK on DEVOLUCION (
   id_empleado ASC
);

/*==============================================================*/
/* Index: Relationship_48_FK                                    */
/*==============================================================*/
create index Relationship_48_FK on DEVOLUCION (
   id_nota_credito ASC
);

/*==============================================================*/
/* Table: EMPLEADO                                              */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_69_FK                                    */
/*==============================================================*/
create index Relationship_69_FK on EMPLEADO (
   id_persona ASC
);

/*==============================================================*/
/* Table: EMPLEADO_PUESTO                                       */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_70_FK                                    */
/*==============================================================*/
create index Relationship_70_FK on EMPLEADO_PUESTO (
   id_puesto ASC
);

/*==============================================================*/
/* Index: Relationship_71_FK                                    */
/*==============================================================*/
create index Relationship_71_FK on EMPLEADO_PUESTO (
   id_empleado ASC
);

/*==============================================================*/
/* Table: EMPLEADO_SUCURSAL                                     */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_66_FK                                    */
/*==============================================================*/
create index Relationship_66_FK on EMPLEADO_SUCURSAL (
   id_sucursal ASC
);

/*==============================================================*/
/* Index: Relationship_67_FK                                    */
/*==============================================================*/
create index Relationship_67_FK on EMPLEADO_SUCURSAL (
   id_empleado ASC
);

/*==============================================================*/
/* Table: ENVIO                                                 */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_55_FK                                    */
/*==============================================================*/
create index Relationship_55_FK on ENVIO (
   id_factura ASC
);

/*==============================================================*/
/* Index: Relationship_56_FK                                    */
/*==============================================================*/
create index Relationship_56_FK on ENVIO (
   id_sucursal ASC
);

/*==============================================================*/
/* Index: Relationship_57_FK                                    */
/*==============================================================*/
create index Relationship_57_FK on ENVIO (
   id_vehiculo ASC
);

/*==============================================================*/
/* Index: Relationship_58_FK                                    */
/*==============================================================*/
create index Relationship_58_FK on ENVIO (
   id_empleado ASC
);

/*==============================================================*/
/* Index: Relationship_59_FK                                    */
/*==============================================================*/
create index Relationship_59_FK on ENVIO (
   id_departamento ASC
);

/*==============================================================*/
/* Table: FACTURA                                               */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_86_FK                                    */
/*==============================================================*/
create index Relationship_86_FK on FACTURA (
   id_empleado_sucursal ASC
);

/*==============================================================*/
/* Index: Relationship_87_FK                                    */
/*==============================================================*/
create index Relationship_87_FK on FACTURA (
   id_cliente ASC
);

/*==============================================================*/
/* Table: GARANTIA                                              */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_52_FK                                    */
/*==============================================================*/
create index Relationship_52_FK on GARANTIA (
   id_empleado ASC
);

/*==============================================================*/
/* Index: Relationship_53_FK                                    */
/*==============================================================*/
create index Relationship_53_FK on GARANTIA (
   id_nota_credito ASC
);

/*==============================================================*/
/* Index: Relationship_79_FK                                    */
/*==============================================================*/
create index Relationship_79_FK on GARANTIA (
   id_factura ASC
);

/*==============================================================*/
/* Table: MARCA                                                 */
/*==============================================================*/
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

/*==============================================================*/
/* Table: MENU                                                  */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_3_FK                                     */
/*==============================================================*/
create index Relationship_3_FK on MENU (
   id_modulo ASC
);

/*==============================================================*/
/* Table: METODO_PAGO                                           */
/*==============================================================*/
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

/*==============================================================*/
/* Table: MODULO                                                */
/*==============================================================*/
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

/*==============================================================*/
/* Table: MONEDA                                                */
/*==============================================================*/
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

/*==============================================================*/
/* Table: MOTIVO_BAJA                                           */
/*==============================================================*/
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

/*==============================================================*/
/* Table: MOVIMIENTO_INVENTARIO                                 */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_72_FK                                    */
/*==============================================================*/
create index Relationship_72_FK on MOVIMIENTO_INVENTARIO (
   id_motivo_baja ASC
);

/*==============================================================*/
/* Index: Relationship_73_FK                                    */
/*==============================================================*/
create index Relationship_73_FK on MOVIMIENTO_INVENTARIO (
   id_tipo_movimiento ASC
);

/*==============================================================*/
/* Index: Relationship_74_FK                                    */
/*==============================================================*/
create index Relationship_74_FK on MOVIMIENTO_INVENTARIO (
   id_producto_sucursal ASC
);

/*==============================================================*/
/* Table: MUNICIPIO                                             */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_65_FK                                    */
/*==============================================================*/
create index Relationship_65_FK on MUNICIPIO (
   id_departamento ASC
);

/*==============================================================*/
/* Table: NOTA_CREDITO                                          */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_35_FK                                    */
/*==============================================================*/
create index Relationship_35_FK on NOTA_CREDITO (
   id_factura ASC
);

/*==============================================================*/
/* Index: Relationship_36_FK                                    */
/*==============================================================*/
create index Relationship_36_FK on NOTA_CREDITO (
   id_empleado ASC
);

/*==============================================================*/
/* Table: OPCION                                                */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_4_FK                                     */
/*==============================================================*/
create index Relationship_4_FK on OPCION (
   id_menu ASC
);

/*==============================================================*/
/* Table: PAGO_CLIENTE                                          */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_39_FK                                    */
/*==============================================================*/
create index Relationship_39_FK on PAGO_CLIENTE (
   id_cliente ASC
);

/*==============================================================*/
/* Index: Relationship_40_FK                                    */
/*==============================================================*/
create index Relationship_40_FK on PAGO_CLIENTE (
   id_factura ASC
);

/*==============================================================*/
/* Index: Relationship_42_FK                                    */
/*==============================================================*/
create index Relationship_42_FK on PAGO_CLIENTE (
   id_metodo_pago ASC
);

/*==============================================================*/
/* Index: Relationship_83_FK                                    */
/*==============================================================*/
create index Relationship_83_FK on PAGO_CLIENTE (
   id_empleado_sucursal ASC
);

/*==============================================================*/
/* Table: PAGO_PROVEEDOR                                        */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_26_FK                                    */
/*==============================================================*/
create index Relationship_26_FK on PAGO_PROVEEDOR (
   id_compra ASC
);

/*==============================================================*/
/* Index: Relationship_27_FK                                    */
/*==============================================================*/
create index Relationship_27_FK on PAGO_PROVEEDOR (
   id_metodo_pago ASC
);

/*==============================================================*/
/* Index: Relationship_84_FK                                    */
/*==============================================================*/
create index Relationship_84_FK on PAGO_PROVEEDOR (
   id_empleado_sucursal ASC
);

/*==============================================================*/
/* Table: PAIS                                                  */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_64_FK                                    */
/*==============================================================*/
create index Relationship_64_FK on PAIS (
   id_moneda ASC
);

/*==============================================================*/
/* Table: PERSONA                                               */
/*==============================================================*/
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

/*==============================================================*/
/* Table: PRODUCTO                                              */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_12_FK                                    */
/*==============================================================*/
create index Relationship_12_FK on PRODUCTO (
   id_categoria ASC
);

/*==============================================================*/
/* Index: Relationship_13_FK                                    */
/*==============================================================*/
create index Relationship_13_FK on PRODUCTO (
   id_marca ASC
);

/*==============================================================*/
/* Table: PRODUCTO_SUCURSAL                                     */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_75_FK                                    */
/*==============================================================*/
create index Relationship_75_FK on PRODUCTO_SUCURSAL (
   id_sucursal ASC
);

/*==============================================================*/
/* Index: Relationship_76_FK                                    */
/*==============================================================*/
create index Relationship_76_FK on PRODUCTO_SUCURSAL (
   id_producto ASC
);

/*==============================================================*/
/* Table: PROVEEDOR                                             */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_20_FK                                    */
/*==============================================================*/
create index Relationship_20_FK on PROVEEDOR (
   id_pais ASC
);

/*==============================================================*/
/* Table: PUESTO                                                */
/*==============================================================*/
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

/*==============================================================*/
/* Table: REGION_GEOGRAFICA                                     */
/*==============================================================*/
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

/*==============================================================*/
/* Table: ROL                                                   */
/*==============================================================*/
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

/*==============================================================*/
/* Table: ROL_OPCION                                            */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_5_FK                                     */
/*==============================================================*/
create index Relationship_5_FK on ROL_OPCION (
   id_rol ASC
);

/*==============================================================*/
/* Index: Relationship_6_FK                                     */
/*==============================================================*/
create index Relationship_6_FK on ROL_OPCION (
   id_opcion ASC
);

/*==============================================================*/
/* Table: SUCURSAL                                              */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_9_FK                                     */
/*==============================================================*/
create index Relationship_9_FK on SUCURSAL (
   id_departamento ASC
);

/*==============================================================*/
/* Table: TIPO_MOVIMIENTO                                       */
/*==============================================================*/
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

/*==============================================================*/
/* Table: USUARIO                                               */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_1_FK                                     */
/*==============================================================*/
create index Relationship_1_FK on USUARIO (
   id_empleado ASC
);

/*==============================================================*/
/* Index: Relationship_2_FK                                     */
/*==============================================================*/
create index Relationship_2_FK on USUARIO (
   id_rol ASC
);

/*==============================================================*/
/* Table: VEHICULO                                              */
/*==============================================================*/
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

/*==============================================================*/
/* Index: Relationship_54_FK                                    */
/*==============================================================*/
create index Relationship_54_FK on VEHICULO (
   id_sucursal ASC
);

alter table BITACORA
   add constraint FK_BITACORA_RELATIONS_USUARIO foreign key (id_usuario)
      references USUARIO (id_usuario);

alter table CLIENTE
   add constraint FK_CLIENTE_RELATIONS_PERSONA foreign key (id_persona)
      references PERSONA (id_persona);

alter table COMPRA
   add constraint FK_COMPRA_RELATIONS_PROVEEDO foreign key (id_proveedor)
      references PROVEEDOR (id_proveedor);

alter table COMPRA
   add constraint FK_COMPRA_RELATIONS_EMPLEADO foreign key (id_empleado_sucursal)
      references EMPLEADO_SUCURSAL (id_empleado_sucursal);

alter table DEPARTAMENTO
   add constraint FK_DEPARTAM_RELATIONS_PAIS foreign key (id_pais)
      references PAIS (id_pais);

alter table DEPARTAMENTO
   add constraint FK_DEPARTAM_RELATIONS_REGION_G foreign key (id_region_geografica)
      references REGION_GEOGRAFICA (id_region_geografica);

alter table DETALLE_COMPRA
   add constraint FK_DETALLE__RELATIONS_COMPRA foreign key (id_compra)
      references COMPRA (id_compra);

alter table DETALLE_COMPRA
   add constraint FK_DETALLE__RELATIONS_PRODUCTO foreign key (id_producto_sucursal)
      references PRODUCTO_SUCURSAL (id_producto_sucursal);

alter table DETALLE_ENVIO
   add constraint FK_DETALLE__RELATIONS_ENVIO foreign key (id_envio)
      references ENVIO (id_envio);

alter table DETALLE_ENVIO
   add constraint FK_DETALLE__RELATIONS_DETALLE_ foreign key (id_detalle_factura)
      references DETALLE_FACTURA (id_detalle_factura);

alter table DETALLE_FACTURA
   add constraint FK_DETALLE__RELATIONS_FACTURA foreign key (id_factura)
      references FACTURA (id_factura);

alter table DETALLE_FACTURA
   add constraint FK_DETALLE__RELATIONS_PRODUCTO foreign key (id_producto_sucursal)
      references PRODUCTO_SUCURSAL (id_producto_sucursal);

alter table DETALLE_GARANTIA
   add constraint FK_DETALLE__RELATIONS_GARANTIA foreign key (id_garantia)
      references GARANTIA (id_garantia);

alter table DETALLE_GARANTIA
   add constraint FK_DETALLE__RELATIONS_DETALLE_ foreign key (id_detalle_factura)
      references DETALLE_FACTURA (id_detalle_factura);

alter table DETALLE_NOTA_CREDITO
   add constraint FK_DETALLE__RELATIONS_NOTA_CRE foreign key (id_nota_credito)
      references NOTA_CREDITO (id_nota_credito);

alter table DETALLE_NOTA_CREDITO
   add constraint FK_DETALLE__RELATIONS_DETALLE_ foreign key (id_detalle_factura)
      references DETALLE_FACTURA (id_detalle_factura);

alter table DEVOLUCION
   add constraint FK_DEVOLUCI_RELATIONS_FACTURA foreign key (id_factura)
      references FACTURA (id_factura);

alter table DEVOLUCION
   add constraint FK_DEVOLUCI_RELATIONS_DETALLE_ foreign key (id_detalle_factura)
      references DETALLE_FACTURA (id_detalle_factura);

alter table DEVOLUCION
   add constraint FK_DEVOLUCI_RELATIONS_SUCURSAL foreign key (id_sucursal)
      references SUCURSAL (id_sucursal);

alter table DEVOLUCION
   add constraint FK_DEVOLUCI_RELATIONS_EMPLEADO foreign key (id_empleado)
      references EMPLEADO (id_empleado);

alter table DEVOLUCION
   add constraint FK_DEVOLUCI_RELATIONS_NOTA_CRE foreign key (id_nota_credito)
      references NOTA_CREDITO (id_nota_credito);

alter table EMPLEADO
   add constraint FK_EMPLEADO_RELATIONS_PERSONA foreign key (id_persona)
      references PERSONA (id_persona);

alter table EMPLEADO_PUESTO
   add constraint FK_EMPLEADO_RELATIONS_PUESTO foreign key (id_puesto)
      references PUESTO (id_puesto);

alter table EMPLEADO_PUESTO
   add constraint FK_EMPLEADO_RELATIONS_EMPLEADO foreign key (id_empleado)
      references EMPLEADO (id_empleado);

alter table EMPLEADO_SUCURSAL
   add constraint FK_EMPLEADO_RELATIONS_SUCURSAL foreign key (id_sucursal)
      references SUCURSAL (id_sucursal);

alter table EMPLEADO_SUCURSAL
   add constraint FK_EMPLEADO_RELATIONS_EMPLEADO foreign key (id_empleado)
      references EMPLEADO (id_empleado);

alter table ENVIO
   add constraint FK_ENVIO_RELATIONS_FACTURA foreign key (id_factura)
      references FACTURA (id_factura);

alter table ENVIO
   add constraint FK_ENVIO_RELATIONS_SUCURSAL foreign key (id_sucursal)
      references SUCURSAL (id_sucursal);

alter table ENVIO
   add constraint FK_ENVIO_RELATIONS_VEHICULO foreign key (id_vehiculo)
      references VEHICULO (id_vehiculo);

alter table ENVIO
   add constraint FK_ENVIO_RELATIONS_EMPLEADO foreign key (id_empleado)
      references EMPLEADO (id_empleado);

alter table ENVIO
   add constraint FK_ENVIO_RELATIONS_DEPARTAM foreign key (id_departamento)
      references DEPARTAMENTO (id_departamento);

alter table FACTURA
   add constraint FK_FACTURA_RELATIONS_EMPLEADO foreign key (id_empleado_sucursal)
      references EMPLEADO_SUCURSAL (id_empleado_sucursal);

alter table FACTURA
   add constraint FK_FACTURA_RELATIONS_CLIENTE foreign key (id_cliente)
      references CLIENTE (id_cliente);

alter table GARANTIA
   add constraint FK_GARANTIA_RELATIONS_EMPLEADO foreign key (id_empleado)
      references EMPLEADO (id_empleado);

alter table GARANTIA
   add constraint FK_GARANTIA_RELATIONS_NOTA_CRE foreign key (id_nota_credito)
      references NOTA_CREDITO (id_nota_credito);

alter table GARANTIA
   add constraint FK_GARANTIA_RELATIONS_FACTURA foreign key (id_factura)
      references FACTURA (id_factura);

alter table MENU
   add constraint FK_MENU_RELATIONS_MODULO foreign key (id_modulo)
      references MODULO (id_modulo);

alter table MOVIMIENTO_INVENTARIO
   add constraint FK_MOVIMIEN_RELATIONS_MOTIVO_B foreign key (id_motivo_baja)
      references MOTIVO_BAJA (id_motivo_baja);

alter table MOVIMIENTO_INVENTARIO
   add constraint FK_MOVIMIEN_RELATIONS_TIPO_MOV foreign key (id_tipo_movimiento)
      references TIPO_MOVIMIENTO (id_tipo_movimiento);

alter table MOVIMIENTO_INVENTARIO
   add constraint FK_MOVIMIEN_RELATIONS_PRODUCTO foreign key (id_producto_sucursal)
      references PRODUCTO_SUCURSAL (id_producto_sucursal);

alter table MUNICIPIO
   add constraint FK_MUNICIPI_RELATIONS_DEPARTAM foreign key (id_departamento)
      references DEPARTAMENTO (id_departamento);

alter table NOTA_CREDITO
   add constraint FK_NOTA_CRE_RELATIONS_FACTURA foreign key (id_factura)
      references FACTURA (id_factura);

alter table NOTA_CREDITO
   add constraint FK_NOTA_CRE_RELATIONS_EMPLEADO foreign key (id_empleado)
      references EMPLEADO (id_empleado);

alter table OPCION
   add constraint FK_OPCION_RELATIONS_MENU foreign key (id_menu)
      references MENU (id_menu);

alter table PAGO_CLIENTE
   add constraint FK_PAGO_CLI_RELATIONS_CLIENTE foreign key (id_cliente)
      references CLIENTE (id_cliente);

alter table PAGO_CLIENTE
   add constraint FK_PAGO_CLI_RELATIONS_FACTURA foreign key (id_factura)
      references FACTURA (id_factura);

alter table PAGO_CLIENTE
   add constraint FK_PAGO_CLI_RELATIONS_METODO_P foreign key (id_metodo_pago)
      references METODO_PAGO (id_metodo_pago);

alter table PAGO_CLIENTE
   add constraint FK_PAGO_CLI_RELATIONS_EMPLEADO foreign key (id_empleado_sucursal)
      references EMPLEADO_SUCURSAL (id_empleado_sucursal);

alter table PAGO_PROVEEDOR
   add constraint FK_PAGO_PRO_RELATIONS_COMPRA foreign key (id_compra)
      references COMPRA (id_compra);

alter table PAGO_PROVEEDOR
   add constraint FK_PAGO_PRO_RELATIONS_METODO_P foreign key (id_metodo_pago)
      references METODO_PAGO (id_metodo_pago);

alter table PAGO_PROVEEDOR
   add constraint FK_PAGO_PRO_RELATIONS_EMPLEADO foreign key (id_empleado_sucursal)
      references EMPLEADO_SUCURSAL (id_empleado_sucursal);

alter table PAIS
   add constraint FK_PAIS_RELATIONS_MONEDA foreign key (id_moneda)
      references MONEDA (id_moneda);

alter table PRODUCTO
   add constraint FK_PRODUCTO_RELATIONS_CATEGORI foreign key (id_categoria)
      references CATEGORIA (id_categoria);

alter table PRODUCTO
   add constraint FK_PRODUCTO_RELATIONS_MARCA foreign key (id_marca)
      references MARCA (id_marca);

alter table PRODUCTO_SUCURSAL
   add constraint FK_PRODUCTO_RELATIONS_SUCURSAL foreign key (id_sucursal)
      references SUCURSAL (id_sucursal);

alter table PRODUCTO_SUCURSAL
   add constraint FK_PRODUCTO_RELATIONS_PRODUCTO foreign key (id_producto)
      references PRODUCTO (id_producto);

alter table PROVEEDOR
   add constraint FK_PROVEEDO_RELATIONS_PAIS foreign key (id_pais)
      references PAIS (id_pais);

alter table ROL_OPCION
   add constraint FK_ROL_OPCI_RELATIONS_ROL foreign key (id_rol)
      references ROL (id_rol);

alter table ROL_OPCION
   add constraint FK_ROL_OPCI_RELATIONS_OPCION foreign key (id_opcion)
      references OPCION (id_opcion);

alter table SUCURSAL
   add constraint FK_SUCURSAL_RELATIONS_DEPARTAM foreign key (id_departamento)
      references DEPARTAMENTO (id_departamento);

alter table USUARIO
   add constraint FK_USUARIO_RELATIONS_EMPLEADO foreign key (id_empleado)
      references EMPLEADO (id_empleado);

alter table USUARIO
   add constraint FK_USUARIO_RELATIONS_ROL foreign key (id_rol)
      references ROL (id_rol);

alter table VEHICULO
   add constraint FK_VEHICULO_RELATIONS_SUCURSAL foreign key (id_sucursal)
      references SUCURSAL (id_sucursal);

