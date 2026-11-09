-- 001_core.sql
-- Shared/core setup for Minimalist Toolkit.
-- Keep this file limited to shared, safe, idempotent objects.

create extension if not exists pgcrypto;
