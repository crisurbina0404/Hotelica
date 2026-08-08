-- ============================================
-- BASE DE DATOS: HOTELICA
-- Versión: 1.0  (se modifica conforme avanza el proyecto)
-- ============================================

-- Creamos la base de datos
CREATE DATABASE IF NOT EXISTS hotelica
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotelica;

-- Tabla de roles (turista, hotel, admin)
CREATE TABLE roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- Departamentos de Nicaragua
CREATE TABLE departamentos (
  id_departamento INT AUTO_INCREMENT PRIMARY KEY,
  nombre_departamento VARCHAR(100) NOT NULL
);

-- Municipios, pertenecen a un departamento
CREATE TABLE municipios (
  id_municipio INT AUTO_INCREMENT PRIMARY KEY,
  nombre_municipio VARCHAR(100) NOT NULL,
  id_departamento INT NOT NULL,
  FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento)
);

-- Todas las cuentas del sistema
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL, -- se guarda encriptada
  telefono VARCHAR(20),
  id_rol INT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_registro DATE DEFAULT (CURRENT_DATE),
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- Hoteles registrados
CREATE TABLE hoteles (
  id_hotel INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,           -- dueño del hotel
  nombre_hotel VARCHAR(150) NOT NULL,
  descripcion TEXT,
  direccion VARCHAR(200),
  id_municipio INT NOT NULL,
  -- el admin decide si se publica
  estado_hotel ENUM('Pendiente','Aprobado','Rechazado') DEFAULT 'Pendiente',
  destacado BOOLEAN DEFAULT FALSE,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_municipio) REFERENCES municipios(id_municipio)
);

-- Categorías de habitación
CREATE TABLE tipos_habitacion (
  id_tipo INT AUTO_INCREMENT PRIMARY KEY,
  nombre_tipo VARCHAR(100) NOT NULL
);

-- Habitaciones de cada hotel
CREATE TABLE habitaciones (
  id_habitacion INT AUTO_INCREMENT PRIMARY KEY,
  id_hotel INT NOT NULL,
  id_tipo INT NOT NULL,
  capacidad INT NOT NULL,            -- cuántas personas caben
  precio_por_noche DECIMAL(10,2) NOT NULL,
  total_unidades INT NOT NULL,       -- cuántas hay de este tipo
  en_mantenimiento BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_hotel) REFERENCES hoteles(id_hotel),
  FOREIGN KEY (id_tipo) REFERENCES tipos_habitacion(id_tipo)
);

-- Fotos de los hoteles
CREATE TABLE fotografias (
  id_foto INT AUTO_INCREMENT PRIMARY KEY,
  id_hotel INT NOT NULL,
  url_foto VARCHAR(255) NOT NULL,
  es_principal BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_hotel) REFERENCES hoteles(id_hotel)
);

-- Reservas hechas por turistas
CREATE TABLE reservas (
  id_reserva INT AUTO_INCREMENT PRIMARY KEY,
  folio VARCHAR(20) NOT NULL UNIQUE,  -- código único (ej: HC-2501)
  id_usuario INT NOT NULL,            -- turista que reserva
  id_habitacion INT NOT NULL,
  fecha_llegada DATE NOT NULL,
  fecha_salida DATE NOT NULL,
  numero_huespedes INT NOT NULL,
  noches INT NOT NULL,                -- cálculo: salida - llegada
  subtotal DECIMAL(10,2) NOT NULL,    -- cálculo: precio × noches
  iva DECIMAL(10,2) NOT NULL,         -- cálculo: subtotal × 0.15
  total DECIMAL(10,2) NOT NULL,       -- cálculo: subtotal + iva
  estado_reserva ENUM('Pendiente','Confirmada','Check-in','Completada','Cancelada')
    DEFAULT 'Pendiente',
  fecha_reserva DATE DEFAULT (CURRENT_DATE),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_habitacion) REFERENCES habitaciones(id_habitacion)
);

-- Pagos de cada reserva
CREATE TABLE pagos (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('Tarjeta','Efectivo','Transferencia') NOT NULL,
  estado_pago ENUM('Pagado','Pendiente','Reembolsado') DEFAULT 'Pagado',
  fecha_pago DATE DEFAULT (CURRENT_DATE),
  FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva)
);

-- Calificación del turista tras su estadía
CREATE TABLE calificaciones (
  id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva INT NOT NULL,
  id_hotel INT NOT NULL,
  estrellas INT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  comentario TEXT,
  fecha_calificacion DATE DEFAULT (CURRENT_DATE),
  FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva),
  FOREIGN KEY (id_hotel) REFERENCES hoteles(id_hotel)
);

-- ============================================
-- DATOS DE EJEMPLO (para probar)
-- ============================================
INSERT INTO roles (nombre_rol) VALUES ('Turista'),('Hotel'),('Administrador');

INSERT INTO departamentos (nombre_departamento) VALUES
('Granada'),('León'),('Rivas'),('Managua'),('Masaya'),('Estelí'),('Matagalpa'),('RACCS');

INSERT INTO municipios (nombre_municipio, id_departamento) VALUES
('Granada',1),('León',2),('San Juan del Sur',3),('Ometepe',3),('Managua',4),('Masaya',5);

INSERT INTO tipos_habitacion (nombre_tipo) VALUES
('Sencilla'),('Doble'),('Suite'),('Cabaña'),('Dormitorio compartido');