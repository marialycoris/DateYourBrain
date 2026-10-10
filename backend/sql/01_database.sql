-- Date Your Brain — database bootstrap
-- Run this once in phpMyAdmin (or `mysql -u root`), then run a separate
-- DROP first if you already created the database in the phpMyAdmin UI.

CREATE DATABASE IF NOT EXISTS `dateyourbrain`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `dateyourbrain`;

-- Tables themselves are created by Django migrations (python manage.py migrate).
-- This file only owns the database + stored procedures below.