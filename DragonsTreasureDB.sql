create table estadistica
(
    id               int auto_increment
        primary key,
    idUsuario        int           null,
    idTipo           int           null,
    valor_INT        int           null,
    valor_TIME       time          null,
    fecha_hora       datetime      null,
    victorias        int default 0 null,
    derrotas         int default 0 null,
    partidas_totales int default 0 null,
    duracion_partida time          null,
    constraint estadistica_ibfk_1
        foreign key (idUsuario) references dragonstreasuredb.usuario (id),
    constraint estadistica_ibfk_2
        foreign key (idTipo) references dragonstreasuredb.tipoEstadistica (id)
);

create index idTipo
    on estadistica (idTipo);

create index idUsuario
    on estadistica (idUsuario);

create table nivel
(
    id     int auto_increment
        primary key,
    nombre varchar(50) null
);

create table progreso
(
    id        int auto_increment
        primary key,
    idUsuario int  null,
    idNivel   int  null,
    fecha     date null,
    hora      time null,
    constraint progreso_ibfk_1
        foreign key (idUsuario) references dragonstreasuredb.usuario (id),
    constraint progreso_ibfk_2
        foreign key (idNivel) references dragonstreasuredb.nivel (id)
);

create index idNivel
    on progreso (idNivel);

create index idUsuario
    on progreso (idUsuario);

create table tipoEstadistica
(
    id     int auto_increment
        primary key,
    nombre varchar(50) null
);

create table usuario
(
    id                          int auto_increment
        primary key,
    email                       varchar(100)  null,
    ultimo_sticker_desbloqueado int           null,
    monedas                     int           null,
    name                        varchar(100)  null,
    gamertag                    varchar(50)   null,
    nivel                       int default 1 not null,
    progreso                    int default 0 not null
);