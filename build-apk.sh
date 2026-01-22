#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Progress bar function
show_progress() {
  local current=$1
  local total=$2
  local message=$3
  local percent=$((current * 100 / total))
  local filled=$((percent / 2))
  local empty=$((50 - filled))
  
  printf "\r${BLUE}[";
  printf "%${filled}s" | tr ' ' '█'
  printf "%${empty}s" | tr ' ' '░'
  printf "] ${percent}%% - ${message}${NC}"
}

# Prompt for APK name
echo -e "${YELLOW}Enter APK name (without .apk extension):${NC}"
read -p "> " APK_NAME

if [ -z "$APK_NAME" ]; then
  echo -e "${RED}Error: APK name cannot be empty${NC}"
  exit 1
fi

# Create release folder if it doesn't exist
mkdir -p release

echo ""
echo -e "${GREEN}Starting APK build process...${NC}"
echo ""

# Step 1: Prebuild (40%)
show_progress 0 100 "Initializing..."
sleep 0.5
show_progress 10 100 "Running prebuild..."
npx expo prebuild --clean --platform android > /dev/null 2>&1 &
PREBUILD_PID=$!

while kill -0 $PREBUILD_PID 2>/dev/null; do
  for i in {10..40}; do
    show_progress $i 100 "Running prebuild..."
    sleep 0.3
    kill -0 $PREBUILD_PID 2>/dev/null || break
  done
done
wait $PREBUILD_PID
show_progress 40 100 "Prebuild complete"
echo ""

# Step 2: Gradle build (40% to 95%)
show_progress 40 100 "Starting Gradle build..."
sleep 0.5
cd android
./gradlew assembleRelease 2>&1 | while IFS= read -r line; do
  if [[ $line == *"BUILD SUCCESSFUL"* ]]; then
    show_progress 95 100 "Build successful"
  elif [[ $line == *"Compiling"* ]] || [[ $line == *"compileReleaseKotlin"* ]]; then
    show_progress 50 100 "Compiling Kotlin..."
  elif [[ $line == *"mergeReleaseResources"* ]]; then
    show_progress 60 100 "Merging resources..."
  elif [[ $line == *"processReleaseManifest"* ]]; then
    show_progress 70 100 "Processing manifest..."
  elif [[ $line == *"dexBuilder"* ]] || [[ $line == *"mergeDex"* ]]; then
    show_progress 80 100 "Building DEX files..."
  elif [[ $line == *"package"* ]] || [[ $line == *"assembleRelease"* ]]; then
    show_progress 90 100 "Packaging APK..."
  fi
done
cd ..
echo ""

# Step 3: Copy APK (95% to 100%)
show_progress 95 100 "Copying APK..."
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
  cp android/app/build/outputs/apk/release/app-release.apk "release/${APK_NAME}.apk"
  show_progress 100 100 "Complete!"
  echo ""
  echo ""
  echo -e "${GREEN}✅ APK created successfully!${NC}"
  echo -e "${BLUE}📦 Location: release/${APK_NAME}.apk${NC}"
  
  # Get file size
  SIZE=$(du -h "release/${APK_NAME}.apk" | cut -f1)
  echo -e "${BLUE}📊 Size: ${SIZE}${NC}"
  echo ""
  
  # Ask to install on emulator
  echo -e "${YELLOW}Install APK on emulator/device? (y/n):${NC}"
  read -p "> " INSTALL_CHOICE
  
  if [[ $INSTALL_CHOICE == "y" || $INSTALL_CHOICE == "Y" ]]; then
    echo ""
    echo -e "${BLUE}📱 Installing APK...${NC}"
    
    # Check if adb is available
    if ! command -v adb &> /dev/null; then
      echo -e "${RED}❌ Error: adb not found. Please install Android SDK Platform Tools.${NC}"
      exit 1
    fi
    
    # Check if device is connected
    DEVICE_COUNT=$(adb devices | grep -w "device" | wc -l)
    if [ $DEVICE_COUNT -eq 0 ]; then
      echo -e "${RED}❌ Error: No emulator/device connected.${NC}"
      echo -e "${YELLOW}Please start an emulator or connect a device and try again.${NC}"
      exit 1
    fi
    
    # Install APK
    adb install -r "release/${APK_NAME}.apk"
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ APK installed successfully!${NC}"
    else
      echo -e "${RED}❌ Error: APK installation failed${NC}"
      exit 1
    fi
  else
    echo -e "${BLUE}Skipping installation.${NC}"
  fi
else
  echo ""
  echo -e "${RED}❌ Error: APK build failed${NC}"
  exit 1
fi
