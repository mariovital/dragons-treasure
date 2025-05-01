
SELECT * FROM usuario;

SELECT * FROM estadistica;



USE DragonsTreasureDB;

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100),
    ultimo_sticker_desbloqueado INT NULL DEFAULT NULL,
    monedas INT NULL DEFAULT NULL
);

CREATE TABLE tipoEstadistica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50)
);

CREATE TABLE estadistica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT,
    idTipo INT,
    valor_INT INT,
    valor_TIME TIME,
    fecha_hora DATETIME,
    FOREIGN KEY (idUsuario) REFERENCES usuario(id),
    FOREIGN KEY (idTipo) REFERENCES tipoEstadistica(id)
);
-- Insert victory and defeat types into tipoEstadistica
INSERT INTO tipoEstadistica (nombre) VALUES ('Victoria');
INSERT INTO tipoEstadistica (nombre) VALUES ('Derrota');

-- Alter estadistica table to add separate columns for victories and defeats
ALTER TABLE estadistica
ADD COLUMN victorias INT DEFAULT 0,
ADD COLUMN derrotas INT DEFAULT 0;

-- If you want to track total games played, you can add this column
ALTER TABLE estadistica
ADD COLUMN partidas_totales INT DEFAULT 0;

-- If you want to track match duration
ALTER TABLE estadistica
ADD COLUMN duracion_partida TIME;
ALTER TABLE estadistica
ADD COLUMN duracion_partida TIME;
CREATE TABLE nivel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50)
);

CREATE TABLE progreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT,
    idNivel INT,
    fecha DATE,
    hora TIME,
    FOREIGN KEY (idUsuario) REFERENCES usuario(id),
    FOREIGN KEY (idNivel) REFERENCES nivel(id)
);