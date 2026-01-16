PYTHON := .venv/bin/python
PIP := .venv/bin/pip

.PHONY: venv install migrate seed dev test lint

venv:
	python -m venv .venv

install: venv
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

migrate: install
	$(PYTHON) manage.py migrate

seed: migrate
	$(PYTHON) manage.py seed_demo

dev: seed
	$(PYTHON) manage.py runserver 0.0.0.0:8000

test: install
	$(PYTHON) manage.py test

lint:
	@echo "No lint configured for MVP"
