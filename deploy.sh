#!/bin/bash

# Enable strict error handling
set -eo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Error handling function
trap 'echo -e "${RED}Error occurred at line $LINENO. Exiting...${NC}"; exit 1' ERR

# Set Git identity for this repository
set_git_identity() {
    echo -e "${YELLOW}Setting Git identity...${NC}"
    git config user.name "vladimirovertheworld"
    git config user.email "vladimir@overtheworld.uk"
    echo -e "${GREEN}✓ Git identity configured for this repository${NC}"
}

# Check and initialize repository
init_repository() {
    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}Initializing new Git repository...${NC}"
        git init
        git remote add origin git@github.com:vladimirovertheworld/aistreamhelper.git || \
        git remote set-url origin git@github.com:vladimirovertheworld/aistreamhelper.git
        set_git_identity
    else
        # Ensure identity is set even if repo exists
        set_git_identity
    fi
}

# ... [keep all other functions unchanged] ...

# Main deployment process
deploy() {
    local commit_msg="$1"
    
    echo -e "${YELLOW}Starting deployment...${NC}"
    
    check_directory
    check_config
    create_gitignore
    init_repository  # Changed from check_directory
    check_sensitive_files

    # ... [rest of the deploy function remains unchanged] ...
}

# ... [rest of the script remains unchanged] ...