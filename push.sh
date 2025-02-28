#!/bin/bash

# Enable strict error handling
set -eo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for commit message
if [ -z "$1" ]; then
  echo -e "${RED}Error: Commit message required!${NC}"
  echo -e "Usage: ./push.sh \"Your commit message\""
  exit 1
fi

# Set repository URL
REPO_URL="git@github.com:vladimirovertheworld/aistreamhelper.git"

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo -e "${YELLOW}Initializing Git repository...${NC}"
  git init
  git remote add origin $REPO_URL || git remote set-url origin $REPO_URL
fi

# Check for sensitive files
SENSITIVE_FILES=("config.json" "*.pem" "*.key" ".env")
for pattern in "${SENSITIVE_FILES[@]}"; do
  if [[ $(git ls-files "$pattern" | wc -l) -gt 0 ]]; then
    echo -e "${RED}Error: Sensitive files ($pattern) detected in repository!${NC}"
    echo -e "Remove them with: git rm --cached $pattern"
    exit 1
  fi
done

# Add all files
echo -e "${YELLOW}Staging changes...${NC}"
git add .

# Commit changes
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "$1"

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push -u origin main

# Check deployment status
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Successfully deployed to GitHub!${NC}"
else
  echo -e "${RED}❌ Deployment failed${NC}"
fi