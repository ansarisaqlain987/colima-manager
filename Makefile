PORT := 1420

PROFILE ?= default
CPU     ?=
MEMORY  ?=
DISK    ?=
RUNTIME ?=

COLIMA_FLAGS := --profile $(PROFILE) \
	$(if $(CPU),--cpu $(CPU)) \
	$(if $(MEMORY),--memory $(MEMORY)) \
	$(if $(DISK),--disk $(DISK)) \
	$(if $(RUNTIME),--runtime $(RUNTIME))

.PHONY: up down clean install colima-start colima-stop colima-restart colima-status colima-ssh colima-list

up:
	docker compose up -d --build
	@echo "✅ Application started on port : $(PORT) → http://localhost:$(PORT)"

down:
	docker compose down

clean:
	rm -rf apps/vite-frontend/node_modules apps/vite-frontend/dist apps/vite-frontend/.tanstack
	rm -rf apps/rust-backend/target

install:
	cd apps/vite-frontend && pnpm install
	cd apps/rust-backend && cargo fetch

colima-start:
	colima start $(COLIMA_FLAGS)

colima-stop:
	colima stop --profile $(PROFILE)

colima-restart:
	colima stop --profile $(PROFILE)
	colima start $(COLIMA_FLAGS)

colima-status:
	colima status --profile $(PROFILE)

colima-ssh:
	colima ssh --profile $(PROFILE)

colima-list:
	colima list
