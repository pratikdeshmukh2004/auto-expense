#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color



# Prompt for IPA name
echo -e "${YELLOW}Enter IPA name (without .ipa extension):${NC}"
read -p "> " IPA_NAME

if [ -z "$IPA_NAME" ]; then
  echo -e "${RED}Error: IPA name cannot be empty${NC}"
  exit 1
fi

# Create release folder if it doesn't exist
mkdir -p release

echo ""
echo -e "${GREEN}Starting IPA build process...${NC}"
echo ""

# Step 1: Prebuild
echo -e "${BLUE}Running prebuild...${NC}"
npx expo prebuild --clean --platform ios
echo -e "${GREEN}✅ Prebuild complete${NC}"
echo ""

# Step 2: Build archive
echo -e "${BLUE}Building iOS archive...${NC}"
cd ios
xcodebuild -workspace *.xcworkspace -scheme AutoExpense -configuration Release archive -archivePath ../build/autoexpense.xcarchive
cd ..
echo -e "${GREEN}✅ Archive complete${NC}"
echo ""

# Step 3: Export IPA
echo -e "${BLUE}Exporting IPA...${NC}"
xcodebuild -exportArchive -archivePath build/autoexpense.xcarchive -exportPath build -exportOptionsPlist ios/exportOptions.plist
echo -e "${GREEN}✅ Export complete${NC}"
echo ""

# Step 4: Copy IPA
echo -e "${BLUE}Copying IPA...${NC}"
if [ -f "build/autoexpense.ipa" ]; then
  cp build/autoexpense.ipa "release/${IPA_NAME}.ipa"
  echo ""
  echo -e "${GREEN}✅ IPA created successfully!${NC}"
  echo -e "${BLUE}📦 Location: release/${IPA_NAME}.ipa${NC}"
  
  # Get file size
  SIZE=$(du -h "release/${IPA_NAME}.ipa" | cut -f1)
  echo -e "${BLUE}📊 Size: ${SIZE}${NC}"
  echo ""
  
  # Ask to install on simulator
  echo -e "${YELLOW}Install IPA on simulator? (y/n):${NC}"
  read -p "> " INSTALL_CHOICE
  
  if [[ $INSTALL_CHOICE == "y" || $INSTALL_CHOICE == "Y" ]]; then
    echo ""
    echo -e "${BLUE}📱 Installing IPA...${NC}"
    
    # Check if xcrun is available
    if ! command -v xcrun &> /dev/null; then
      echo -e "${RED}❌ Error: Xcode command line tools not found.${NC}"
      exit 1
    fi
    
    # Get booted simulator
    SIMULATOR_ID=$(xcrun simctl list devices | grep "Booted" | grep -o -E '\([A-Z0-9-]+\)' | tr -d '()')
    
    if [ -z "$SIMULATOR_ID" ]; then
      echo -e "${RED}❌ Error: No simulator is running.${NC}"
      echo -e "${YELLOW}Please start a simulator and try again.${NC}"
      exit 1
    fi
    
    # Install IPA
    xcrun simctl install "$SIMULATOR_ID" "release/${IPA_NAME}.ipa"
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ IPA installed successfully!${NC}"
    else
      echo -e "${RED}❌ Error: IPA installation failed${NC}"
      exit 1
    fi
  else
    echo -e "${BLUE}Skipping installation.${NC}"
  fi
else
  echo ""
  echo -e "${RED}❌ Error: IPA build failed${NC}"
  exit 1
fi
