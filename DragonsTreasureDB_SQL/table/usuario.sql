create table usuario
(
    id                          int auto_increment
        primary key,
    email                       varchar(100)                          null,
    ultimo_sticker_desbloqueado int                                   null,
    monedas                     int                                   null,
    name                        varchar(100)                          null,
    gamertag                    varchar(50)                           null,
    role                        enum ('user', 'admin') default 'user' not null,
    nivel                       int                    default 1      not null,
    progreso                    int                    default 0      not null,
    avatar_sticker_id           int                                   null,
    total_victorias             int                    default 0      not null,
    total_derrotas              int                    default 0      not null,
    total_partidas              int                    default 0      not null
);

