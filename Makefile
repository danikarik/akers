all: run

run: ## Run dev server
	@hugo server -D --bind=0.0.0.0 --baseUrl=localhost

build: ## Build static files
	@hugo

help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {sub("\\\\n",sprintf("\n%22c"," "), $$2);printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
