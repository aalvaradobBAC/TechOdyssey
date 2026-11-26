SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help setup validate start-api start-web status clean rebuild

help:
	@echo ""
	@echo "TechOdyssey"
	@echo "-----------"
	@echo "make setup       Crea o completa la plataforma"
	@echo "make validate    Compila y prueba la solución"
	@echo "make start-api   Ejecuta la API en el puerto 5048"
	@echo "make start-web   Ejecuta el portal en el puerto 5173"
	@echo "make status      Muestra el estado"
	@echo "make clean       Elimina artefactos generados"
	@echo "make rebuild     Limpia y valida nuevamente"

setup:
	@./setup.sh

validate:
	@./scripts/validate.sh

start-api:
	@./scripts/start-api.sh

start-web:
	@./scripts/start-web.sh

status:
	@echo "Git:     $$(git --version)"
	@echo "Node:    $$(node --version)"
	@echo "npm:     $$(npm --version)"
	@echo ".NET:    $$(dotnet --version)"
	@echo "Carpeta: $$(pwd)"
	@echo ""
	@git status --short --branch

clean:
	@find . -type d \( \
		-name bin -o \
		-name obj -o \
		-name dist -o \
		-name coverage \
	\) -prune -exec rm -rf {} +
	@echo "Artefactos eliminados."

rebuild: clean validate
