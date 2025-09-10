#!/bin/bash

# This script helps you to create a new GitHub repository and push the azkar-data directory to it.

# Please follow these steps:
# 1. Go to https://github.com/new and create a new repository.
#    - Repository name: azkar-data
#    - You can keep it public or make it private.
#    - Do NOT initialize with a README, .gitignore, or license.

# 2. After creating the repository, GitHub will show you a URL. Copy the HTTPS URL.
#    It will look something like this: https://github.com/your-username/azkar-data.git

# 3. Run this script and paste the URL when prompted.

# --- Script starts here ---

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo "Git is not installed. Please install it first."
    exit 1
fi

# Initialize a new git repository inside the azkar-data directory
cd /data/data/com.termux/files/home/downloads/The-Holy-Quran/azkar-data

# Check if it's already a git repository
if [ -d ".git" ]; then
  echo "This directory is already a Git repository."
else
  git init
  git add .
  git commit -m "Initial commit: Add placeholder for Azkar data"
fi


# Ask for the remote repository URL
read -p "Please paste the HTTPS URL of your new GitHub repository: " remote_url

# Add the remote repository
git remote add origin $remote_url

# Push the changes to the remote repository
git push -u origin main

echo "---"
echo "✅ Successfully pushed the azkar-data to your GitHub repository."
echo "Now, you can add the actual Azkar files to the azkar-data directory, commit and push them."
