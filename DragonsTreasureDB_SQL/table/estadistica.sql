create table estadistica
(
    id               int auto_increment
        primary key,
    idUsuario        int         null,
    idTipo           int         null,
    valor_INT        int         null,
    valor_TIME       time        null,
    fecha_hora       datetime    null,
    outcome          varchar(10) null,
    duracion_partida time        null,
    constraint estadistica_ibfk_1
        foreign key (idUsuario) references usuario (id),
    constraint estadistica_ibfk_2
        foreign key (idTipo) references tipoEstadistica (id)
);

